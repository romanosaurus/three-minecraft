import { expose } from "threads/worker";
import MyMesh from "../utils/Mesh";
import PerlinGenerator from "../utils/PerlinGenerator";
import * as THREE from "three";

expose({
    meshWorker(cellSize: number, height: number, width: number, generator: PerlinGenerator) {
        const mesh : MyMesh = new MyMesh(cellSize, height, width, PerlinGenerator.fromData(generator.width, generator.height, generator.spec.randseed));

        return mesh;
    },
    generateGeometryDataForCell(cellX: number, cellY: number, cellZ: number, meshSize: number, meshData: any, utils: any) {
        function computeVoxelOffset(x: number, y: number, z: number, cellSize: number, cellSliceSize: number) {
            const voxelX : number = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
            const voxelY : number = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
            const voxelZ : number = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;

            return voxelY * cellSliceSize +
                voxelZ * cellSize +
                voxelX;
        }

        function getCellForVoxel(x: number, y: number, z: number, mesh: MyMesh, meshArray: any) {
            let newX = mesh.getWidthOffset();
            let newY = mesh.getHeightOffset();

            const container = meshArray[newX + ',' + newY];
            if (!container)
                return null;
            return container.drawableMesh;
        }

        function getVoxel(x: number, y: number, z: number, mesh: MyMesh, meshArray: any, cellSize: number, cellSliceSize: number) {
            const cell = getCellForVoxel(x, y, z, mesh, meshArray);

            if (!cell)
                return 0;

            const voxelOffset: number = computeVoxelOffset(x, y, z, cellSize, cellSliceSize);
            return cell[voxelOffset];
        }

        const newMesh: MyMesh = new MyMesh(meshSize, cellZ, cellX, null, meshData);
        let { cellSize, tileSize, tileTextureWidth, tileTextureHeight, meshArray, cellSliceSize, faces } = utils;
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        const startX = cellX * cellSize;
        const startY = cellY * cellSize;
        const startZ = cellZ * cellSize;

        for (let y = 0; y < cellSize; y += 1) {
            const voxY = startY + y;
            for (let z = 0; z < cellSize; z += 1) {
                const voxZ = startZ + z;
                for (let x = 0; x < cellSize; x += 1) {
                    const voxX = startX + x;
                    const vox = getVoxel(voxX, voxY, voxZ, newMesh, meshArray, cellSize, cellSliceSize);
                    if (vox) {
                        const uvVoxel = vox - 1;
                        for (const { dir, corners, uvRow } of faces) {
                            const neighbor = getVoxel(
                                voxX + dir[0],
                                voxY + dir[1],
                                voxZ + dir[2],
                                newMesh,
                                meshArray,
                                cellSize,
                                cellSliceSize);

                            if (!neighbor) {
                                const ndx = positions.length / 3;
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
