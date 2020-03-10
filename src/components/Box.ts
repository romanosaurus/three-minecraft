import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";
import { printCommonLine } from 'jest-diff/build/printDiffs';
import { Scene } from 'three';

class Box extends AComponent {
    private readonly _geometry: THREE.BoxGeometry;
    private readonly _material: THREE.MeshBasicMaterial;
    private readonly _mesh: THREE.Mesh;

    private _size: THREE.Vector3;
    private _position: THREE.Vector3;

    constructor(entity: IEntity, size: THREE.Vector3, position: THREE.Vector3) {
        super(entity);

        this._geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        this._material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._mesh.position.set(position.x, position.y, position.z);

        this._size = size;
        this._position = position;
    }

    get size(): THREE.Vector3 {
        return this._size;
    }

    get position(): THREE.Vector3 {
        return this._position;
    }

    get mesh(): THREE.Mesh {
        return this._mesh;
    }

    get geometry(): THREE.BoxGeometry {
        return this._geometry;
    }

    get material(): THREE.MeshBasicMaterial {
        return this._material;
    }
}

export default Box;
