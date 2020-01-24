import * as THREE from 'three';
import * as CANNON from 'cannon';

import PerlinImage from './PerlinImage';

interface BoxCollider {
    position: CANNON.Vec3,
    body: CANNON.Body
}

interface Options {
    cellSize: number,
    tileSize: number,
    tileTextureWidth: number,
    tileTextureHeight: number
}

export default class Voxel
{
    private readonly cellSize: number;
    private readonly faces;
    private tileTextureWidth;
    private tileTextureHeight;
    private tileSize;
    private cell: Uint8Array;
    private cellSliceSize;
    private perlin;
    private mesh : THREE.Mesh;
    private boxColliders : Array<BoxCollider>;

    constructor(options : Options)
    {
        this.cellSize = options.cellSize;
        this.tileSize = options.tileSize;
        this.tileTextureWidth = options.tileTextureWidth;
        this.tileTextureHeight = options.tileTextureHeight;
        const { cellSize } = this;
        this.cell = new Uint8Array(cellSize * cellSize * cellSize);
        this.cellSliceSize = cellSize * cellSize;
        this.perlin = new PerlinImage("assets/perlin/perlin.png");
        this.mesh = new THREE.Mesh();
        this.boxColliders = [];

        this.faces = [
            { // left
                uvRow: 0,
                dir: [ -1,  0,  0, ],
                corners: [
                    { pos: [ 0, 1, 0 ], uv: [ 0, 1 ], },
                    { pos: [ 0, 0, 0 ], uv: [ 0, 0 ], },
                    { pos: [ 0, 1, 1 ], uv: [ 1, 1 ], },
                    { pos: [ 0, 0, 1 ], uv: [ 1, 0 ], },
                ],
            },
            { // right
                uvRow: 0,
                dir: [  1,  0,  0, ],
                corners: [
                    { pos: [ 1, 1, 1 ], uv: [ 0, 1 ], },
                    { pos: [ 1, 0, 1 ], uv: [ 0, 0 ], },
                    { pos: [ 1, 1, 0 ], uv: [ 1, 1 ], },
                    { pos: [ 1, 0, 0 ], uv: [ 1, 0 ], },
                ],
            },
            { // bottom
                uvRow: 1,
                dir: [  0, -1,  0, ],
                corners: [
                    { pos: [ 1, 0, 1 ], uv: [ 1, 0 ], },
                    { pos: [ 0, 0, 1 ], uv: [ 0, 0 ], },
                    { pos: [ 1, 0, 0 ], uv: [ 1, 1 ], },
                    { pos: [ 0, 0, 0 ], uv: [ 0, 1 ], },
                ],
            },
            { // top
                uvRow: 2,
                dir: [  0,  1,  0, ],
                corners: [
                    { pos: [ 0, 1, 1 ], uv: [ 1, 1 ], },
                    { pos: [ 1, 1, 1 ], uv: [ 0, 1 ], },
                    { pos: [ 0, 1, 0 ], uv: [ 1, 0 ], },
                    { pos: [ 1, 1, 0 ], uv: [ 0, 0 ], },
                ],
            },
            { // back
                uvRow: 0,
                dir: [  0,  0, -1, ],
                corners: [
                    { pos: [ 1, 0, 0 ], uv: [ 0, 0 ], },
                    { pos: [ 0, 0, 0 ], uv: [ 1, 0 ], },
                    { pos: [ 1, 1, 0 ], uv: [ 0, 1 ], },
                    { pos: [ 0, 1, 0 ], uv: [ 1, 1 ], },
                ],
            },
            { // front
                uvRow: 0,
                dir: [  0,  0,  1, ],
                corners: [
                    { pos: [ 0, 0, 1 ], uv: [ 0, 0 ], },
                    { pos: [ 1, 0, 1 ], uv: [ 1, 0 ], },
                    { pos: [ 0, 1, 1 ], uv: [ 0, 1 ], },
                    { pos: [ 1, 1, 1 ], uv: [ 1, 1 ], },
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

    public async displayVoxelWorld(scene, world) {
        const perlinArray = await this.perlin.getArray();

        const loader = new THREE.TextureLoader();
        const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/minecraft/flourish-cc-by-nc-sa.png');
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        if (perlinArray == null)
            return;

        let counter = 0;

        for (let y = 0; y < this.perlin.getTexture().image.height; ++y) {
            for (let x = 0; x < this.perlin.getTexture().image.width; ++x) {
                //compute height by red contrast
                for (let height = perlinArray[counter][0] * 0.05; height >= 0; height--) {
                    this.setVoxel(x, height, y, 14);
                }
                counter++;
            }
        }
        const {positions, normals, uvs, indices} = this.generateGeometryDataForCell(0, 0, 0, world);
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
            transparent: true,
        });


        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const uvNumComponents = 2;

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents)
        );
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents)
        );
        geometry.setAttribute(
            'uv',
            new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
        geometry.setIndex(indices);
        this.mesh = new THREE.Mesh(geometry, material);
        scene.add(this.mesh);
    }

    public generateGeometryDataForCell(cellX, cellY, cellZ, world)
    {
        const { cellSize, tileSize, tileTextureWidth, tileTextureHeight } = this;
        const positions = [];
        const normals = [];
        const uvs = [];
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
                        const uvVoxel = vox - 1;
                        for (const { dir, corners, uvRow } of this.faces) {
                            const neighbor = this.getVoxel(
                                voxX + dir[0],
                                voxY + dir[1],
                                voxZ + dir[2]);

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

    public Update(player : CANNON.Body, world : CANNON.World) {
        let stock = [];
        for (let physicZpos = Math.round(player.position.z) - 3; physicZpos <= Math.round(player.position.z) + 3; physicZpos++) {
            for (let physicXpos = Math.round(player.position.x) - 3; physicXpos <= Math.round(player.position.x) + 3; physicXpos++) {
                for (let physicYpos = Math.round(player.position.y) - 3; physicYpos <= Math.round(player.position.y) + 3; physicYpos++) {
                    let cell = this.getVoxel(physicXpos, physicYpos, physicZpos);
                    if (cell === 0)
                        continue;
                    let exist : boolean = false;
                    let newBody = new CANNON.Body({mass: 0});

                    newBody.position = this.getVoxelPosition(physicXpos, physicYpos, physicZpos);
                    stock.push(newBody.position);
                    newBody.addShape(new CANNON.Box(new CANNON.Vec3(1.25 / 2, 1.25 / 2, 1.25/2)));

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

        let indexToDelete = [];

        for (let i = 0; i < this.boxColliders.length; i++) {
            let toPush = true;
            for (let j = 0; j < stock.length; j++) {
                let tmpPosition = this.boxColliders[i].position;

                if (tmpPosition.x === stock[j].x && tmpPosition.y === stock[j].y && tmpPosition.z === stock[j].z) {
                    toPush = false;
                }
            }

            if (toPush === true) {
                indexToDelete.push(i);
            }
        }
        for (let i = 0; i < indexToDelete.length; i++) {
            world.remove(this.boxColliders[indexToDelete[i]].body);
            this.boxColliders.splice(indexToDelete[i], 1);
        }
    }
}
