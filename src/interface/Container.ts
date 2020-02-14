import * as THREE from 'three';

import Chunk from "../utils/Chunk";

export interface Container {
    drawableMesh: Uint8Array,
    mesh: Chunk,
    drawedMesh: THREE.Scene,
    isDrawed: boolean,
    geometry: THREE.BufferGeometry
}