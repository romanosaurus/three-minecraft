import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

class Box extends AComponent {
    public geometry: THREE.BoxGeometry;
    private material: THREE.MeshBasicMaterial;
    public mesh: THREE.Mesh;

    constructor(entity: IEntity, size: THREE.Vector3, position: THREE.Vector3) {
        super(entity);

        this.geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(position.x, position.y, position.z);
    }

    getSize() : THREE.Vector3 {
        return new THREE.Vector3(
            this.geometry.parameters.width,
            this.geometry.parameters.height,
            this.geometry.parameters.depth
        );
    }
}

export default Box;
