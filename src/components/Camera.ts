import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

class Camera extends AComponent {
    public camera: THREE.PerspectiveCamera;

    constructor(entity: IEntity, fov: number, aspect: number, near: number, far: number) {
        super(entity);
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    }

    setPosition(x: number, y: number, z: number) {
        this.camera.position.set(x, y, z);
    }
}

export default Camera;
