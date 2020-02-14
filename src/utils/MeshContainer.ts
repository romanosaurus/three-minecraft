import * as THREE from 'three';
import { Container } from "../interface/Container";
import Chunk from "./Chunk";

export default class MeshContainer {

    public meshArray;

    constructor() {
        this.meshArray = {};
    }

    public clone(): MeshContainer {
        const newMeshContainer: MeshContainer = new MeshContainer();

        newMeshContainer.meshArray = this.meshArray;
        return newMeshContainer;
    }

    public addMesh(id: string, chunkToPush: Chunk, drawableMeshToPush: Uint8Array) {
        const container : Container = {drawableMesh: drawableMeshToPush, mesh: chunkToPush, drawedMesh: null, isDrawed: true, geometry: null};
        this.meshArray[id] = container;
    }

    public getContainerAtPos(id: string) {
        return this.meshArray[id];
    }

    public addMeshToSceneId(id: string, mesh: THREE.Mesh, geometry: THREE.BufferGeometry): void {
        this.meshArray[id].drawedMesh = mesh;
        this.meshArray[id].geometry = geometry;
    }

    public isMeshDrawed(id: string): boolean {
        return this.meshArray[id].isDrawed;
    }

    public setDrawedStatus(id: string, toSet: boolean): void {
        this.meshArray[id].isDrawed = toSet;
    }

    public deleteToSceneUselessDrawing(scene : THREE.Scene, idToDelete): void {
        const keys = Object.keys(this.meshArray);

        for (let i = 0; i < keys.length; i++) {
            if (this.meshArray[keys[i]].isDrawed === true && idToDelete.includes(keys[i]) === false) {
                scene.remove(this.meshArray[keys[i]].drawedMesh);
                this.setDrawedStatus(keys[i], false);
            }
        }
    }

    public getDrawedMesh() {
        let array = [];

        const keys = Object.keys(this.meshArray);
        for (let i = 0; i < keys.length; i++) {
            if (this.meshArray[keys[i]].isDrawed === true) {
                array.push(keys[i]);
            }
        }
        return array;
    }

    public needToUpdate(currentHeightPos: number, currentWidthPos: number, fov: number): boolean {
        let cmpArray = [];
        for (let height = currentHeightPos - fov; height <= currentHeightPos + fov; height++) {
            for (let width = currentWidthPos - fov; width <= currentWidthPos + fov; width++) {
                const id : string = width + ',0,' + height;
                cmpArray.push(id);
            }
        }
        let drawedMesh = this.getDrawedMesh();
        for (let mesh of cmpArray) {
            if (drawedMesh.indexOf(mesh) <= -1)
                return true;
        }
        return false;
    }

    public serialize() {
        let serialized = {};

        for (let key of Object.keys(this.meshArray)) {
            serialized[key] = {};
            for (let jsonbKey of Object.keys(this.meshArray[key])) {
                if (jsonbKey === "mesh" || jsonbKey === "drawedMesh" || jsonbKey === "geometry") {
                    serialized[key][jsonbKey] = null;
                    continue;
                }
                serialized[key][jsonbKey] = this.meshArray[key][jsonbKey];
            }
        }
        return serialized;
    }
};
