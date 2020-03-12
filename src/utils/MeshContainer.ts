import * as THREE from 'three';
import { Container } from "../interface/Container";
import Chunk from "./Chunk";

/**
 * @class MeshContainer used in the Voxel component to stock all the datas about generated Chunk
 * (the Uint8Array data of the mesh, the chunk, the position of the chunk, the geometry)
 */
export default class MeshContainer {

    /**
     * public variables
     */
    public meshArray;

    /**
     * Constuctor of the MeshContainer class
     */
    constructor() {
        this.meshArray = {};
    }

    /**
     * Public member method to add a Chunk in the MeshArray by the given ID
     * @param id : the string id of the chunk
     * @param chunkToPush : the chunk to add in the meshArray member at the id position
     * @param drawableMeshToPush : the Uint8Array data of the mesh to add in the meshArray member at the id position
     */
    public addMesh(id: string, chunkToPush: Chunk, drawableMeshToPush: Uint8Array) {
        const container : Container = {drawableMesh: drawableMeshToPush, mesh: chunkToPush, drawedMesh: null, isDrawed: true, geometry: null};
        this.meshArray[id] = container;
    }

    /**
     * Public member method to get the container (containing all the infos about a chunk) at the given id position
     * @param id : the id used to retrive the chunk that you want
     * @return Container : a container containing all the infos about a chunk
     */
    public getContainerAtPos(id: string) {
        return this.meshArray[id];
    }

    /**
     * Public member method to add a mesh added to the scene and the generated geometry in the given id position container
     * @param id : the id used to retrive the chunk that you want
     * @param mesh : the THREE.Mesh mesh added to the scene that you cant to add in the container
     * @param geometry : the THREE.BufferGeometry that you want to add in the container
     */
    public addMeshToSceneId(id: string, mesh: THREE.Mesh, geometry: THREE.BufferGeometry): void {
        this.meshArray[id].drawedMesh = mesh;
        this.meshArray[id].geometry = geometry;
    }

    /**
     * Public member method to know if the Chunk at the given id position is drawed in the scene
     * @param id : the id used to retrive the chunk that you want
     * @return a boolean : true if the Chunk is drawed in the scene, otherwise false
     */
    public isMeshDrawed(id: string): boolean {
        return this.meshArray[id].isDrawed;
    }

    /**
     * Public member method to set the drawed state of the Chunk at the given id position
     * @param id : the id used to retrive the chunk that you want
     * @param toSet : a boolean to set the drawed state
     */
    public setDrawedStatus(id: string, toSet: boolean): void {
        this.meshArray[id].isDrawed = toSet;
    }

    /**
     * Public member method to delete from the scene all the useless drawed Chunk
     * @param scene : the THREE.Scene where the Chunk are drawed
     * @param idToDelete : a array of all the IDs that you want to keep drawed
     */
    public deleteToSceneUselessDrawing(scene : THREE.Scene, idToDelete): void {
        const keys = Object.keys(this.meshArray);

        for (let i = 0; i < keys.length; i++) {
            if (this.meshArray[keys[i]].isDrawed === true && idToDelete.includes(keys[i]) === false) {
                scene.remove(this.meshArray[keys[i]].drawedMesh);
                this.setDrawedStatus(keys[i], false);
            }
        }
    }

    /**
     * Public member method to get all the drawed Chunk by their drawed status
     * @return an array of all the drawed chunk's IDs
     */
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

    /**
     * Public member method to know if an update is necessary, based on the chunk drawed status.
     * @param currentHeightPos : the Height position of the Chunk where the player is located
     * @param currentWidthPos : the Width position of the Chunk where the player is located
     * @param fov : the distance of rendering
     * @return a boolean, true if an update is necessary, otherwise, false
     */
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

    /**
     * Public member method to serialize the meshArray member.
     * It means that it will create an object without method, and without object with methods
     * Used to send object in the thread worker functions
     * @return a serialized meshArray
     */
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
