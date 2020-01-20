import * as THREE from 'three';

import PerlinImage from './PerlinImage';

export default class Voxel
{
    private readonly cellSize: number;
    private readonly faces;
    private cell: Uint8Array;
    private cellSliceSize;
    private perlin;

    constructor(cellSize)
    {
        this.cellSize = cellSize;
        this.cell = new Uint8Array(cellSize * cellSize * cellSize);
        this.cellSliceSize = cellSize * cellSize;
        this.perlin = new PerlinImage();

        this.faces = [
            { // left
                dir: [ -1,  0,  0, ],
                corners: [
                    [ 0, 1, 0 ],
                    [ 0, 0, 0 ],
                    [ 0, 1, 1 ],
                    [ 0, 0, 1 ],
                ],
            },
            { // right
                dir: [  1,  0,  0, ],
                corners: [
                    [ 1, 1, 1 ],
                    [ 1, 0, 1 ],
                    [ 1, 1, 0 ],
                    [ 1, 0, 0 ],
                ],
            },
            { // bottom
                dir: [  0, -1,  0, ],
                corners: [
                    [ 1, 0, 1 ],
                    [ 0, 0, 1 ],
                    [ 1, 0, 0 ],
                    [ 0, 0, 0 ],
                ],
            },
            { // top
                dir: [  0,  1,  0, ],
                corners: [
                    [ 0, 1, 1 ],
                    [ 1, 1, 1 ],
                    [ 0, 1, 0 ],
                    [ 1, 1, 0 ],
                ],
            },
            { // back
                dir: [  0,  0, -1, ],
                corners: [
                    [ 1, 0, 0 ],
                    [ 0, 0, 0 ],
                    [ 1, 1, 0 ],
                    [ 0, 1, 0 ],
                ],
            },
            { // front
                dir: [  0,  0,  1, ],
                corners: [
                    [ 0, 0, 1 ],
                    [ 1, 0, 1 ],
                    [ 0, 1, 1 ],
                    [ 1, 1, 1 ],
                ],
            },
        ];
    }

    private computeVoxelOffset(x, y, z)
    {
        const voxelX = THREE.Math.euclideanModulo(x, this.cellSize) | 0;
        const voxelY = THREE.Math.euclideanModulo(y, this.cellSize) | 0;
        const voxelZ = THREE.Math.euclideanModulo(z, this.cellSize) | 0;

        return voxelY * this.cellSliceSize +
            voxelZ * this.cellSize +
            voxelX;
    }

    public getCellForVoxel(x, y, z)
    {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const cellZ = Math.floor(z / this.cellSize);

        if (cellX !== 0 || cellY !== 0 || cellZ !== 0)
            return null;

        return this.cell;
    }

    public setVoxel(x, y, z, v)
    {
        let cell = this.getCellForVoxel(x, y, z);

        if (!cell)
            return;

        const voxelOffset = this.computeVoxelOffset(x, y, z);
        cell[voxelOffset] = v;
    }

    public getVoxel(x, y, z) {
        const cell = this.getCellForVoxel(x, y, z);

        if (!cell)
            return 0;

        const voxelOffset = this.computeVoxelOffset(x, y, z);
        return cell[voxelOffset];
    }

    public async displayVoxelWorld(scene, posX, posY, posZ)
    {
        const { cellSize } = this;
        const simplexTest = [
            [0, 0.5],
            [1, 0]
        ];
        const test = await this.perlin.getArray();
//        console.log(test);
        if (test == null)
            return;
        console.log(this.perlin.getTexture().image.height);
        console.log(this.perlin.getTexture().image.width);
        for (let y = 0; y < this.perlin.getTexture().image.height; ++y) {
            for (let x = 0; x < this.perlin.getTexture().image.width; ++x) {
                //compute z (height) by white contrast
                //modifier nom variable par rapport au plan 3d
//                console.log(test[x + y * this.perlin.getTexture().image.width].r);
                this.setVoxel(x, test[x + y * this.perlin.getTexture().image.width][0] * 0.02, y, 1);
//                this.setVoxel(x, y, test[x + y * this.perlin.getTexture().image.width].r, 1);
//                this.setVoxel(x, y, simplexTest[y][x], 1);
            }
        }
        const {positions, normals, indices} = this.generateGeometryDataForCell(0, 0, 0);
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshLambertMaterial({color: 'green'});

        const positionNumComponents = 3;
        const normalNumComponents = 3;
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
        geometry.setIndex(indices);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = posX;
        mesh.position.y = posY;
        mesh.position.z = posZ;
        scene.add(mesh);
    }

    public generateGeometryDataForCell(cellX, cellY, cellZ)
    {
        const positions = [];
        const normals = [];
        const indices = [];
        const startX = cellX * this.cellSize;
        const startY = cellY * this.cellSize;
        const startZ = cellZ * this.cellSize;

        for (let y = 0; y < this.cellSize; y += 1) {
            const voxY = startY + y;
            for (let z = 0; z < this.cellSize; z += 1) {
                const voxZ = startZ + z;
                for (let x = 0; x < this.cellSize; x += 1) {
                    const voxX = startX + x;
                    const vox = this.getVoxel(voxX, voxY, voxZ);
                    if (vox) {
                        for (const { dir, corners } of this.faces) {
                            const neighbor = this.getVoxel(
                                voxX + dir[0],
                                voxY + dir[1],
                                voxZ + dir[2]);

                            if (!neighbor) {
                                const ndx = positions.length / 3;
                                for (const pos of corners) {
                                    positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                                    normals.push(...dir);
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
            indices,
        }
    }
}
