import * as THREE from 'three';
import * as CANNON from 'cannon';

import PerlinImage from './PerlinImage';
import {Box} from "../physics_objects/Box";

interface BoxCollider {
    position: CANNON.Vec3,
    body: CANNON.Body
}

export default class Voxel
{
    private readonly cellSize: number;
    private readonly faces;
    private cell: Uint8Array;
    private cellSliceSize;
    private perlin;
    private mesh : THREE.Mesh;
    private boxColliders : Array<BoxCollider>;

    constructor(cellSize)
    {
        this.cellSize = cellSize;
        this.cell = new Uint8Array(cellSize * cellSize * cellSize);
        this.cellSliceSize = cellSize * cellSize;
        this.perlin = new PerlinImage();
        this.mesh = new THREE.Mesh();
        this.boxColliders = [];

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

    public getVoxelPosition(x, y, z) {
        return new CANNON.Vec3(x + 0.5, y + 0.5, z + 0.5)
    }

    public async displayVoxelWorld(scene, world, physicsSystem)
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
        let counter = 0;
        for (let y = 0; y < this.perlin.getTexture().image.height; ++y) {
            for (let x = 0; x < this.perlin.getTexture().image.width; ++x) {
                //compute z (height) by white contrast
                //modifier nom variable par rapport au plan 3d
//                console.log(test[x + y * this.perlin.getTexture().image.width].r);
                let maxSize = {x: 0, height: 0, y: 0};

                for (let height = test[counter][0] * 0.05; height >= 0; height--) {
                    if (maxSize.height < height)
                        maxSize = {x: x, height: height, y: y};
                    this.setVoxel(x, height, y, 1);
                }
                counter++;
//                this.setVoxel(x, y, test[x + y * this.perlin.getTexture().image.width].r, 1);
//                this.setVoxel(x, y, simplexTest[y][x], 1);
            }
        }
        const {positions, normals, indices} = this.generateGeometryDataForCell(0, 0, 0, world);
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
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    public generateGeometryDataForCell(cellX, cellY, cellZ, world)
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
                                    /*if (pos[1] + y > 6) {
                                        let body = new CANNON.Body({mass: 0});
                                        body.position.set(voxX + 0.5, voxY + 0.5, voxZ + 0.5);
                                        body.addShape(new CANNON.Box(new CANNON.Vec3(1 / 2, 1 / 2, 1 / 2)));
                                        world.add(body);
                                    }*/
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

    public Update(player : CANNON.Body, world : CANNON.World) {
        for (let physicZpos = Math.round(player.position.z) - 3; physicZpos < Math.round(player.position.z) + 3; physicZpos++) {
            for (let physicXpos = Math.round(player.position.x) - 3; physicXpos < Math.round(player.position.x) + 3; physicXpos++) {
                let cell = this.getVoxel(physicXpos, 6, physicZpos);
                if (cell === 0)
                    continue
                let exist : boolean = false;
                let newBody = new CANNON.Body({mass: 0});
                newBody.position = this.getVoxelPosition(physicXpos, 6, physicZpos);
                newBody.addShape(new CANNON.Box(new CANNON.Vec3(1 / 2, 1 / 2, 1/2)));

                for (let col = 0;  col < this.boxColliders.length; col++) {
                    let boxPosition = this.boxColliders[col].position;
                    if (boxPosition.x === newBody.position.x && boxPosition.y === newBody.position.y && boxPosition.z === newBody.position.z)
                        exist = true;
                }
                if (!exist) {
                    this.boxColliders.push({position: newBody.position, body: newBody});
                    world.addBody(newBody);
                }
            }
        }
    }
}
