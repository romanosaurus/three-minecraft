import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from '../ecs/interfaces/IEntity';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export enum AnimalType {
    PIG,
    SHEEP
};

export interface AnimalRenderer {
    geometry: THREE.BoxGeometry;
    material: THREE.MeshBasicMaterial;
};

export class Animal extends AComponent {

    private _animalRenderer: AnimalRenderer;
    private _animalType: AnimalType;

    private _inHeat: boolean;
    private _lastBaby: number;

    private _mesh: THREE.Mesh;

    constructor(entity: IEntity, animalType: AnimalType) {
        super(entity);

        let color: number = 0x000000;

        this._animalType = animalType;

        if (this._animalType === AnimalType.SHEEP)
            color = 0xffffff;
        else
            color = 0xf542bf;

        this._animalRenderer = {
            geometry: new THREE.BoxGeometry(1, 1, 1),
            material: new THREE.MeshBasicMaterial({ color: color })
        };

        let loader = new GLTFLoader();

        this._mesh = new THREE.Mesh(this._animalRenderer.geometry, this._animalRenderer.material);

        this._inHeat = false;
        this._lastBaby = 0;
    }

    get position(): THREE.Vector3 {
        return this._mesh.position;
    }

    set position(newPosition: THREE.Vector3) {
        this._mesh.position.set(newPosition.x, newPosition.y, newPosition.z);
    }

    get mesh(): THREE.Mesh {
        return this._mesh;
    }
}