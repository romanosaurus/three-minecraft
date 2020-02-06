import * as THREE from 'three';
import { Container } from "../interface/Container";
import MyMesh from "../utils/Mesh";

export default class MeshContainer {

    private meshArray;

    constructor() {
        this.meshArray = {};
    }
    public addMesh(id : string, meshToPush : MyMesh, drawableMeshToPush : Uint8Array) {
        const container : Container = {drawableMesh: drawableMeshToPush, mesh: meshToPush, drawedMesh: null, isDrawed: true};
        this.meshArray[id] = container;
    }
    public getContainerAtPos(id : string) {
        return this.meshArray[id];
    }
    public addMeshToSceneId(id : string, mesh : THREE.Mesh) {
        this.meshArray[id].drawedMesh = mesh;
    }
    public isMeshDrawed(id : string) {
        return this.meshArray[id].isDrawed;
    }
    public setDrawedStatus(id : string, toSet : boolean) {
        this.meshArray[id].isDrawed = toSet;
    }
    public deleteToSceneUselessDrawing(scene : THREE.Scene, idToDelete) {
        const keys = Object.keys(this.meshArray);
        for (let i = 0; i < keys.length; i++) {
            if (this.meshArray[keys[i]].isDrawed === true && idToDelete.includes(keys[i]) === false) {
                scene.remove(this.meshArray[keys[i]].drawedMesh);
                this.meshArray[keys[i]].isDrawed = false;
            }
        }
    }
};