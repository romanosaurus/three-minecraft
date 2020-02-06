import * as THREE from 'three';

import MyMesh from "../utils/Mesh";

export interface Container {
    drawableMesh: Uint8Array,
    mesh: MyMesh
}