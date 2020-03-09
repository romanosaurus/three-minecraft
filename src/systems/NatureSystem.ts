import * as THREE from "three";
import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import IEntity from "../ecs/interfaces/IEntity";

export default class NatureSystem extends ASystem {
    private _threeNumber: number;

    constructor(name: string) {
        super(name);
        this._threeNumber = 1;
    }

    onInit() {
        const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();

        this.createThrees(scene);
/*        for (let i = 0; i < this._cloudNumber; i++) {
            ECSWrapper.entities.create(`Cloud${i}`);
            const cloudEntity: IEntity = ECSWrapper.entities.getByName(`Cloud${i}`)[0];
            cloudEntity.assignComponent<Cloud>(new Cloud(cloudEntity));
            cloudEntity.getComponent(Cloud).mesh.position.set(Math.floor(Math.random() * 300) + 10, 60, Math.floor(Math.random() * 300) + 10);
            scene.add(cloudEntity.getComponent(Cloud).mesh);
        }
        */
    }

    onUpdate(elapsedTime: number) {
    }

    onClose() {

    }
    private createThrees(scene : THREE.Scene) {
        return;
    }
}