import * as THREE from 'three';
import * as CANNON from 'cannon';

import PerlinGenerator from '../utils/PerlinGenerator';
import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";
import MyMesh from "../utils/Mesh";
import MeshContainer from "../utils/MeshContainer";

interface Options {
    cellSize: number,
    tileSize: number,
    tileTextureWidth: number,
    tileTextureHeight: number
}

export default class Voxel extends AComponent
{
    private options: Options;
    private FOV: number; /* rendering distance */
    private _cellSliceSize: number;
    private _meshContainer: MeshContainer;

    constructor(entity: IEntity, options: Options)
    {
        super(entity);

        this.options = options;
        this._meshContainer = new MeshContainer();
        this.FOV = 1;
        this._cellSliceSize = this.options.cellSize * this.options.cellSize;
    }

    private computeVoxelOffset(x: number, y: number, z: number): number
    {
        const voxelX : number = THREE.MathUtils.euclideanModulo(x, this.options.cellSize) | 0;
        const voxelY : number = THREE.MathUtils.euclideanModulo(y, this.options.cellSize) | 0;
        const voxelZ : number = THREE.MathUtils.euclideanModulo(z, this.options.cellSize) | 0;

        return voxelY * this._cellSliceSize + voxelZ * this.options.cellSize + voxelX;
    }

    public getCellForVoxel(mesh: MyMesh): Uint8Array {
        let X = mesh.getWidthOffset();
        let Y = mesh.getHeightOffset();
        const container = this._meshContainer.getContainerAtPos(X + ',' + Y);

        if (!container)
            return null;

        return container.drawableMesh;
    }

    public addCellForVoxel(mesh: MyMesh): MyMesh {
        const cellId = `${mesh.getWidthOffset()},${mesh.getHeightOffset()}`;
        const container = this._meshContainer.getContainerAtPos(cellId);

        if (!container) {
            let cell = new Uint8Array(this.options.cellSize * this.options.cellSize * this.options.cellSize);

            this._meshContainer.addMesh(cellId, mesh, cell);
        }
        return this._meshContainer.getContainerAtPos(cellId).mesh;
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
        const cellX = Math.floor(x / this.options.cellSize);
        const cellY = Math.floor(y / this.options.cellSize);
        const id : string = cellX + ',' + cellY;

        if (this._meshContainer.getContainerAtPos(id) === undefined)
            return undefined;

        return this._meshContainer.getContainerAtPos(id).mesh;
    }

    public getVoxelPosition(x: number, y: number, z: number): CANNON.Vec3 {
        return new CANNON.Vec3(x + 0.5, y + 0.5, z + 0.5)
    }

    // Getter

    get meshContainer(): MeshContainer {
        return this._meshContainer;
    }

    get cellSize(): number {
        return this.options.cellSize;
    }

    get fov(): number {
        return this.FOV;
    }
}
