import * as THREE from 'three';
import * as CANNON from 'cannon';

import PerlinGenerator from '../utils/PerlinGenerator';
import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";
import MyMesh from "../utils/Mesh";
import MeshContainer from "../utils/MeshContainer";
import { spawn, Thread, Worker, Transfer } from "threads";
import ThreeSystem from '../systems/ThreeSystem';
import ECSWrapper from "../ecs/wrapper/ECSWrapper";

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

export default class Voxel extends AComponent
{
    private readonly cellSize: number;
    private readonly faces;
    private tileTextureWidth : number;
    private tileTextureHeight : number;
    private tileSize : number;
    private cell: Uint8Array;
    private cellSliceSize : number;
    private boxColliders : Array<BoxCollider>;

    private MeshContainer : MeshContainer;
    private isGenerated: boolean;

    //generateur preocedural
    public generator;
    constructor(entity: IEntity, options : Options)
    {
        super(entity);
        this.generator = new PerlinGenerator(options.cellSize, options.cellSize);
        this.MeshContainer = new MeshContainer();
        this.cellSize = options.cellSize;
        this.tileSize = options.tileSize;
        this.tileTextureWidth = options.tileTextureWidth;
        this.tileTextureHeight = options.tileTextureHeight;

        const { cellSize } = this;
        this.cellSliceSize = cellSize * cellSize;

        this.boxColliders = [];
        this.isGenerated = false;

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

    private computeVoxelOffset(x : number, y : number, z : number) : number
    {
        const voxelX : number = THREE.MathUtils.euclideanModulo(x, this.cellSize) | 0;
        const voxelY : number = THREE.MathUtils.euclideanModulo(y, this.cellSize) | 0;
        const voxelZ : number = THREE.MathUtils.euclideanModulo(z, this.cellSize) | 0;

        return voxelY * this.cellSliceSize +
            voxelZ * this.cellSize +
            voxelX;
    }

    public getCellForVoxel(x : number, y : number, z : number, mesh : MyMesh) {
        let X = mesh.getWidthOffset();
        let Y = mesh.getHeightOffset();
        const container = this.MeshContainer.getContainerAtPos(X + ',0,' + Y);
        if (!container)
            return null;
        return this.MeshContainer.getContainerAtPos(X + ',0,' + Y).drawableMesh;
    }

    public addCellForVoxel(x, y, z, mesh : MyMesh) {
        const cellId = `${mesh.getWidthOffset()},0,${mesh.getHeightOffset()}`;
        const container = this.MeshContainer.getContainerAtPos(cellId);
        if (!container) {
          const {cellSize} = this;
          let cell = new Uint8Array(cellSize * cellSize * cellSize);
          this.MeshContainer.addMesh(cellId, mesh, cell);
        }
        return this.MeshContainer.getContainerAtPos(cellId).mesh;
    }

    public setVoxel(x : number, y : number, z : number, v : number, mesh : MyMesh) : void
    {
        let cell = this.getCellForVoxel(x, y, z, mesh);

        if (!cell) {
            cell = this.addCellForVoxel(x, y, z, mesh);
        }
        const voxelOffset = this.computeVoxelOffset(x, y, z);
        cell[voxelOffset] = v;
    }

    public getVoxel(x : number, y : number, z : number, mesh : MyMesh) {
        const cell = this.getCellForVoxel(x, y, z, mesh);

        if (!cell)
            return 0;

        const voxelOffset : number = this.computeVoxelOffset(x, y, z);
        return cell[voxelOffset];
    }

    public getActiveMesh(x : number, y : number) {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const id : string = cellX + ',0,' + cellY;
        if (this.MeshContainer.getContainerAtPos(id) === undefined) {
            return undefined;
        }
        return this.MeshContainer.getContainerAtPos(id).mesh;
    }
    public getVoxelPosition(x : number, y : number, z : number) : CANNON.Vec3 {
        return new CANNON.Vec3(x + 0.5, y + 0.5, z + 0.5)
    }

    public async displayMeshs(scene : THREE.Scene) {
        let mesh : MyMesh = new MyMesh(this.cellSize, 2, 2, this.generator);
        this.displayVoxelWorld(scene, mesh);
    }
    public async displayVoxelWorld(scene : THREE.Scene, mesh : MyMesh) {
        const perlinArray = mesh.getMeshData();

        const loader : THREE.TextureLoader = new THREE.TextureLoader();
        const texture : THREE.Texture = loader.load('../../assets/textures/textures.png');
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        if (perlinArray === null)
            return;

        let counter : number = 0;
        const startX = mesh.getWidthOffset() * this.cellSize;
        const startY = mesh.getHeightOffset() * this.cellSize;
        for (let y = 0; y < mesh.getMeshSize(); ++y) {
            for (let x = 0; x < mesh.getMeshSize(); ++x) {
                for (let height = perlinArray[counter] * (64 / 255); height >= 0; height--)
                    this.setVoxel(startX + x, height, startY + y, 14, mesh);
                counter += 4;
            }
        }
        const generation = await spawn(new Worker('../workers/generation'));
        let newObject = this.MeshContainer.serialize();
        const {positions, normals, uvs, indices} = await generation.generateGeometryDataForCell(mesh.getWidthOffset(), 0, mesh.getHeightOffset(), mesh.size, mesh.data, {
            cellSize: this.cellSize,
            tileSize: this.tileSize,
            tileTextureWidth: this.tileTextureWidth,
            tileTextureHeight: this.tileTextureHeight,
            meshArray: newObject,
            cellSliceSize: this.cellSliceSize,
            faces: this.faces
        });
        await Thread.terminate(generation);

        const geometry : THREE.BufferGeometry = new THREE.BufferGeometry();
        const material : THREE.MeshLambertMaterial = new THREE.MeshLambertMaterial({
            map: texture,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
            transparent: true,
        });


        const positionNumComponents : number= 3;
        const normalNumComponents : number = 3;
        const uvNumComponents : number = 2;

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

        let drawMesh = new THREE.Mesh(geometry, material);
        drawMesh.position.set(mesh.getWidthOffset() * this.cellSize, 0, mesh.getHeightOffset() * this.cellSize);
        scene.add(drawMesh);
        this.MeshContainer.addMeshToSceneId(mesh.getWidthOffset() + ',0,' + mesh.getHeightOffset(), drawMesh);
    }

    public generateGeometryDataForCell(cellX : number, cellY : number, cellZ : number, mesh : MyMesh)
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
                    const vox = this.getVoxel(voxX, voxY, voxZ, mesh);
                    if (vox) {
                        const uvVoxel = vox - 1;
                        for (const { dir, corners, uvRow } of this.faces) {
                            const neighbor = this.getVoxel(
                                voxX + dir[0],
                                voxY + dir[1],
                                voxZ + dir[2],
                                mesh);

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

    public async Update(player : CANNON.Body, world : CANNON.World, scene : THREE.Scene) {
        let stock = [];
        const activeMesh = this.getActiveMesh(player.position.x, player.position.z);
        if (activeMesh === undefined)
            return;
        for (let physicZpos = Math.round(player.position.z) - 3; physicZpos <= Math.round(player.position.z) + 3; physicZpos++) {
            for (let physicXpos = Math.round(player.position.x) - 3; physicXpos <= Math.round(player.position.x) + 3; physicXpos++) {
                for (let physicYpos = Math.round(player.position.y) - 3; physicYpos <= Math.round(player.position.y) + 3; physicYpos++) {
                    let cell = this.getVoxel(physicXpos, physicYpos, physicZpos, activeMesh);
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
            if (this.boxColliders[indexToDelete[i]] !== undefined)
                world.remove(this.boxColliders[indexToDelete[i]].body);
            this.boxColliders.splice(indexToDelete[i], 1);
        }
        //updating mesh generation
        if (!this.MeshContainer.needToUpdate(Math.floor(player.position.z / this.cellSize), Math.floor(player.position.x / this.cellSize))) {
            console.log('no need')
            return;
        }
        console.log('need to update');
        if (this.isGenerated === false) {
            this.isGenerated = true;

            this.updateMesh(player.position, scene);
        }

/*        for (let i = 0; i < gen["toReturnMesh"].length; i++) {
            let mesh = new MyMesh(gen["toReturnMesh"][i].size, gen["toReturnMesh"][i].HeighOffset, gen["toReturnMesh"][i].WidthOffset, this.generator, gen["toReturnMesh"][i].data);
            this.displayVoxelWorld(scene, mesh);
        }

        for (let i = 0; i < gen["toAddToScene"].length; i++) {
            this.MeshContainer.setDrawedStatus(gen["toAddToScene"][i], true);
            scene.add(this.MeshContainer.getContainerAtPos(gen["toAddToScene"][i]).drawedMesh);
        }

        this.MeshContainer.deleteToSceneUselessDrawing(scene, gen["drawed"]);*/
    }
    public async updateMesh(playerPosition : CANNON.Vec3, scene : THREE.Scene) {
        let currentHeightPos = Math.floor(playerPosition.z / this.cellSize);
        let currentWidthPos = Math.floor(playerPosition.x / this.cellSize);
        let drawed = [];

        for (let height = currentHeightPos - 1; height <= currentHeightPos + 1; height++) {
            for (let width = currentWidthPos - 1; width <= currentWidthPos + 1; width++) {
                const id : string = width + ',0,' + height;
                const container = this.MeshContainer.getContainerAtPos(id);
                if (container && !container.isDrawed) {
                    scene.add(container.drawedMesh);
                    this.MeshContainer.setDrawedStatus(id, true);
                }
                if (!container) {
                    const generation = await spawn(new Worker('../workers/generation'));
                    const gen = await generation.meshWorker(this.cellSize, 1, 1, this.generator);
                    await Thread.terminate(generation);
                    let test : MyMesh = new MyMesh(gen.size, gen.HeightOffset, gen.WidthOffset, this.generator, gen.data);
                    this.displayVoxelWorld(scene, test);
                }
                drawed.push(id);
            }
        }
        this.MeshContainer.deleteToSceneUselessDrawing(scene, drawed);
    }
}
