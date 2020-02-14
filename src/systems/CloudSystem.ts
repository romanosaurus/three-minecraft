import * as THREE from "three";
import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import Cloud from "../components/Cloud";
import IEntity from "../ecs/interfaces/IEntity";

export default class CloudSystem extends ASystem {
    private _cloudNumber: number;

    constructor(name: string) {
        super(name);
        this._cloudNumber = 50;
    }

    onInit() {
        const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();

        for (let i = 0; i < this._cloudNumber; i++) {
            ECSWrapper.entities.create(`Cloud${i}`);
            const cloudEntity: IEntity = ECSWrapper.entities.getByName(`Cloud${i}`)[0];
            cloudEntity.assignComponent<Cloud>(new Cloud(cloudEntity));
            cloudEntity.getComponent(Cloud).mesh.position.set(Math.floor(Math.random() * 300) + 10, 60, Math.floor(Math.random() * 300) + 10);
            scene.add(cloudEntity.getComponent(Cloud).mesh);
        }
    }

    onUpdate(elapsedTime: number) {
    }

    onClose() {

    }
}