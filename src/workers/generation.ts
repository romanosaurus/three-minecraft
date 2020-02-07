import * as THREE from "three";

import { expose } from "threads/worker";

import MyMesh from "../utils/Mesh";
import PerlinGenerator from "../utils/PerlinGenerator";


/**
 * Worker to handle the world generation
 */
expose({
    meshWorker(cellSize: number, height: number, width: number, generator: PerlinGenerator): MyMesh {
        const mesh : MyMesh = new MyMesh(
            cellSize,
            height,
            width,
            PerlinGenerator.fromData(
                generator.width,
                generator.height,
                generator.spec.randseed
            )
        );

        return mesh;
    },
    generateGeometryDataForCell(cellX: number, cellY: number, cellZ: number, meshSize: number, meshData: any, utils: any) {

        function computeVoxelOffset(x: number, y: number, z: number, cellSize: number, cellSliceSize: number): number {
            const voxelX: number = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
            const voxelY: number = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
            const voxelZ: number = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;

            return voxelY * cellSliceSize +
                voxelZ * cellSize +
                voxelX;
        }

        function getCellForVoxel(x: number, y: number, z: number, mesh: MyMesh, meshArray: any): Uint8Array {
            let newX: number = mesh.getWidthOffset();
            let newY: number = mesh.getHeightOffset();

            const container = meshArray[newX + ',' + newY];

            if (!container)
                return null;

            return container.drawableMesh;
        }

        function getVoxel(x: number, y: number, z: number, mesh: MyMesh, meshArray: any, cellSize: number, cellSliceSize: number): number {
            const cell: Uint8Array = getCellForVoxel(x, y, z, mesh, meshArray);

            if (!cell)
                return 0;

            const voxelOffset: number = computeVoxelOffset(x, y, z, cellSize, cellSliceSize);
            return cell[voxelOffset];
        }

        const newMesh: MyMesh = new MyMesh(meshSize, cellZ, cellX, null, meshData);
        const { cellSize, tileSize, tileTextureWidth, tileTextureHeight, meshArray, cellSliceSize, faces } = utils;
        const positions: Array<number> = [];
        const normals: Array<number> = [];
        const uvs: Array<number> = [];
        const indices: Array<number> = [];
        const startX: number = cellX * cellSize;
        const startY: number = cellY * cellSize;
        const startZ: number = cellZ * cellSize;

        for (let y: number = 0; y < cellSize; y += 1) {

            const voxY: number = startY + y;
            for (let z: number = 0; z < cellSize; z += 1) {

                const voxZ: number = startZ + z;
                for (let x: number = 0; x < cellSize; x += 1) {

                    const voxX: number = startX + x;
                    const vox: number = getVoxel(voxX, voxY, voxZ, newMesh, meshArray, cellSize, cellSliceSize);

                    if (vox) {
                        const uvVoxel: number = vox - 1;
                        for (const { dir, corners, uvRow } of faces) {
                            const neighbor: number = getVoxel(
                                voxX + dir[0],
                                voxY + dir[1],
                                voxZ + dir[2],
                                newMesh,
                                meshArray,
                                cellSize,
                                cellSliceSize);

                            if (!neighbor) {
                                const ndx: number = positions.length / 3;
                                for (const { pos, uv } of corners) {
                                    positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                                    normals.push(...dir);
                                    uvs.push(
                                        (uvVoxel +   uv[0]) * tileSize / tileTextureWidth,
                                        1 - (uvRow + 1 - uv[1]) * tileSize / tileTextureHeight);
                                }
                                indices.push(
                                    ndx, ndx + 1, ndx + 2,
                                    ndx + 2, ndx + 1, ndx + 3,
                                );
                            }
                        }
                    }
                }
            }
        }
        return {
            positions,
            normals,
            uvs,
            indices,
        }
    }
});
