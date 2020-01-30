import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

class Camera extends AComponent {
    private _camera: THREE.PerspectiveCamera;

    constructor(entity: IEntity, fov: number, aspect: number, near: number, far: number) {
        super(entity);

        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    }

    get camera(): THREE.PerspectiveCamera {
        return this._camera;
    }
}

export default Camera;
