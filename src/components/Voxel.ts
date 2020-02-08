import * as THREE from 'three';
import * as CANNON from 'cannon';

import PerlinGenerator from '../utils/PerlinGenerator';
import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";
import MyMesh from "../utils/Mesh";
import MeshContainer from "../utils/MeshContainer";
import { spawn, Thread, Worker } from "threads";

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

interface Face {
    uvRow: number,
    dir: Array<number>,
    corners: {pos: Array<number>, uv: Array<number>}[]
}

export default class Voxel extends AComponent
{
    private readonly cellSize: number;
    private readonly faces: Array<Face>;
    private tileTextureWidth: number;
    private tileTextureHeight: number;
    private tileSize: number;
    private FOV: number; /* rendering distance */
    private cellSliceSize: number;
    private meshContainer: MeshContainer;
    // Textures
    private textureLoader: THREE.TextureLoader;
    private texture: THREE.Texture;
    private material: THREE.MeshLambertMaterial;

    constructor(entity: IEntity, options : Options)
    {
        super(entity);

        this.meshContainer = new MeshContainer();
        this.cellSize = options.cellSize;
        this.tileSize = options.tileSize;
        this.tileTextureWidth = options.tileTextureWidth;
        this.tileTextureHeight = options.tileTextureHeight;
        this.FOV = 1;
        this.cellSliceSize = this.cellSize * this.cellSize;
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

        // Textures
        this.textureLoader = new THREE.TextureLoader();
        this.texture = this.textureLoader.load('../../assets/textures/textures.png');
        this.texture.magFilter = THREE.NearestFilter;
        this.texture.minFilter = THREE.NearestFilter;

        this.material = new THREE.MeshLambertMaterial({
            map: this.texture,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
            transparent: true
        });
    }

    private computeVoxelOffset(x: number, y: number, z: number): number
    {
        const voxelX : number = THREE.MathUtils.euclideanModulo(x, this.cellSize) | 0;
        const voxelY : number = THREE.MathUtils.euclideanModulo(y, this.cellSize) | 0;
        const voxelZ : number = THREE.MathUtils.euclideanModulo(z, this.cellSize) | 0;

        return voxelY * this.cellSliceSize + voxelZ * this.cellSize + voxelX;
    }

    public getCellForVoxel(mesh: MyMesh): Uint8Array {
        let X = mesh.getWidthOffset();
        let Y = mesh.getHeightOffset();
        const container = this.meshContainer.getContainerAtPos(X + ',' + Y);

        if (!container)
            return null;

        return container.drawableMesh;
    }

    public addCellForVoxel(mesh: MyMesh): MyMesh {
        const cellId = `${mesh.getWidthOffset()},${mesh.getHeightOffset()}`;
        const container = this.meshContainer.getContainerAtPos(cellId);

        if (!container) {
            let cell = new Uint8Array(this.cellSize * this.cellSize * this.cellSize);

            this.meshContainer.addMesh(cellId, mesh, cell);
        }
        return this.meshContainer.getContainerAtPos(cellId).mesh;
    }

    public setVoxel(x: number, y: number, z: number, v: number, mesh: MyMesh): void
    {
        let cell: Uint8Array | MyMesh = this.getCellForVoxel(mesh);

        if (!cell)
            cell = this.addCellForVoxel(mesh);

        const voxelOffset = this.computeVoxelOffset(x, y, z);
        cell[voxelOffset] = v;
    }

    public getVoxel(x: number, y: number, z: number, mesh: MyMesh): number {
        const cell = this.getCellForVoxel(mesh);

        if (!cell)
            return 0;

        const voxelOffset : number = this.computeVoxelOffset(x, y, z);
        return cell[voxelOffset];
    }

    public getActiveMesh(x: number, y: number): MyMesh {
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const id : string = cellX + ',' + cellY;

        if (this.meshContainer.getContainerAtPos(id) === undefined)
            return undefined;

        return this.meshContainer.getContainerAtPos(id).mesh;
    }

    public getVoxelPosition(x: number, y: number, z: number): CANNON.Vec3 {
        return new CANNON.Vec3(x + 0.5, y + 0.5, z + 0.5)
    }

    public async displayMeshs(scene: THREE.Scene, generator: PerlinGenerator): Promise<void> {
        let mesh: MyMesh = new MyMesh(this.cellSize, 2, 2, generator);

        this.displayVoxelWorld(scene, mesh);
    }

    public async displayVoxelWorld(scene: THREE.Scene, mesh: MyMesh): Promise<void> {
        const perlinArray = mesh.getMeshData();

        if (perlinArray === null)
            return;

        let counter: number = 0;
        const startX: number = mesh.getWidthOffset() * this.cellSize;
        const startY: number = mesh.getHeightOffset() * this.cellSize;
        for (let y = 0; y < mesh.getMeshSize(); ++y) {
            for (let x = 0; x < mesh.getMeshSize(); ++x) {
                for (let height = perlinArray[counter] * (64 / 255); height >= 0; height--)
                    this.setVoxel(startX + x, height, startY + y, 14, mesh);
                counter += 4;
            }
        }

        // Generation workers start
        const generation = await spawn(new Worker('../workers/generation'));
        const serializedMeshArray = this.meshContainer.serialize();
        const {positions, normals, uvs, indices} = await generation.generateGeometryDataForCell(mesh.getWidthOffset(), 0, mesh.getHeightOffset(), mesh.size, mesh.data, {
            cellSize: this.cellSize,
            tileSize: this.tileSize,
            tileTextureWidth: this.tileTextureWidth,
            tileTextureHeight: this.tileTextureHeight,
            meshArray: serializedMeshArray,
            cellSliceSize: this.cellSliceSize,
            faces: this.faces
        });
        await Thread.terminate(generation);

        const geometry : THREE.BufferGeometry = new THREE.BufferGeometry();

        const numComponent: {position: number, normal: number, uv: number} = {
            position: 3,
            normal: 3,
            uv: 2
        }

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), numComponent.position)
        );
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(new Float32Array(normals), numComponent.normal)
        );
        geometry.setAttribute(
            'uv',
            new THREE.BufferAttribute(new Float32Array(uvs), numComponent.uv));
        geometry.setIndex(indices);

        const drawMesh = new THREE.Mesh(geometry, this.material);
        drawMesh.position.set(mesh.getWidthOffset() * this.cellSize, 0, mesh.getHeightOffset() * this.cellSize);
        scene.add(drawMesh);
        this.meshContainer.addMeshToSceneId(mesh.getWidthOffset() + ',' + mesh.getHeightOffset(), drawMesh);
    }

    public getMeshContainer(): MeshContainer {
        return this.meshContainer;
    }

    get CellSize(): number {
        return this.cellSize;
    }

    get fov(): number {
        return this.FOV;
    }
}
