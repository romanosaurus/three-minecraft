import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";
import Vector3D from '../maths/Vector3D';

class Box extends AComponent {
    private readonly _geometry: THREE.BoxGeometry;
    private readonly _material: THREE.MeshBasicMaterial;
    private readonly _mesh: THREE.Mesh;

    private _size: Vector3D;

    constructor(entity: IEntity, size: Vector3D) {
        super(entity);

        this._geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        this._material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this._mesh = new THREE.Mesh(this._geometry, this._material);

        this._size = size;
    }

    get size(): Vector3D {
        return this._size;
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
