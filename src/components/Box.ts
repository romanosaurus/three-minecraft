import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

class Box extends AComponent {
    private readonly _geometry: THREE.BoxGeometry;
    private readonly _material: THREE.MeshBasicMaterial;
    private readonly _mesh: THREE.Mesh;

    constructor(entity: IEntity, size: THREE.Vector3, position: THREE.Vector3) {
        super(entity);

        this._geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        this._material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this._mesh = new THREE.Mesh(this._geometry, this._material);
        this._mesh.position.set(position.x, position.y, position.z);
    }

    getSize(): THREE.Vector3 {
        return new THREE.Vector3(
            this._geometry.parameters.width,
            this._geometry.parameters.height,
            this._geometry.parameters.depth
        );
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
