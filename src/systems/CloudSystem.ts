import * as THREE from "three";
import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import Cloud from "../components/Cloud";

export default class CloudSystem extends ASystem {
    constructor(name: string) {
        super(name);    }

    onInit() {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        const scene: THREE.Scene = ecsWrapper.systemManager.getSystem(ThreeSystem).getScene();

        for (let i = 0; i < 50; i++) {
            ecsWrapper.entityManager.create(`Cloud${i}`);
            const skyEntity = ecsWrapper.entityManager.getByName(`Cloud${i}`)[0];
            skyEntity.assignComponent<Cloud>(new Cloud(skyEntity));
            skyEntity.getComponent(Cloud).mesh.position.set(Math.floor(Math.random() * 300) + 10, 60, Math.floor(Math.random() * 300) + 10);
            scene.add(skyEntity.getComponent(Cloud).mesh);
        }
    }

    onUpdate(elapsedTime: number) {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        for (let i = 0; i < 50; i++) {
            const skyEntity = ecsWrapper.entityManager.getByName(`Cloud${i}`)[0];
            skyEntity.assignComponent<Cloud>(new Cloud(skyEntity));
            skyEntity.getComponent(Cloud).mesh.position.set(skyEntity.getComponent(Cloud).mesh.position.x + ( elapsedTime / 1000), 60, skyEntity.getComponent(Cloud).mesh.position.z);
        }
    }

    onClose() {

    }
}