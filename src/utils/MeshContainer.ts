import * as THREE from 'three';
import { Container } from "../interface/Container";
import MyMesh from "../utils/Mesh";

export default class MeshContainer {

    private meshArray;

    constructor() {
        this.meshArray = {}
    }
    public addMesh(id : string, meshToPush : MyMesh, drawableMeshToPush : Uint8Array) {
        const container : Container = {drawableMesh: drawableMeshToPush, mesh: meshToPush};
        console.log(container);
        this.meshArray[id] = container;
    }
    public getContainerAtPos(id : string) {
        return this.meshArray[id];
    }
};