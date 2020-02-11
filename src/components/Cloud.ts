import * as THREE from "three";

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

export default class Cloud extends AComponent {
    private _geometry: THREE.BoxGeometry;
    private _material: THREE.MeshBasicMaterial;
    private _mesh: THREE.Mesh;

    constructor(entity: IEntity) {
        super(entity);

        this._geometry = new THREE.BoxGeometry(Math.floor(Math.random() * 30) + 15 , 5, 15)
        this._material = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true });
        this._mesh = new THREE.Mesh(this._geometry, this._material);
    }

    get geometry(): THREE.BoxGeometry {
        return this._geometry;
    }

    get material(): THREE.MeshBasicMaterial {
        return this._material;
    }

    get mesh(): THREE.Mesh {
        return this._mesh;
    }
}