import * as THREE from 'three';

import AComponent from "../../ecs/abstract/AComponent";
import IEntity from "../../ecs/interfaces/IEntity";

export default class Light extends AComponent {
    public bulb: THREE.DirectionalLight;

    constructor(entity: IEntity, color: number = 0xFFFFFF) {
        super(entity);

        this.bulb = new THREE.DirectionalLight(color, 1);
    }
}