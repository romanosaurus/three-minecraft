import * as CANNON from "cannon";

import ECSWrapper from "../../ecs/wrapper/ECSWrapper";
import ASystem from "../../ecs/abstract/ASystem";
import IEntity from "../../ecs/interfaces/IEntity";
import BoxCollider from "../../components/BoxCollider";
import { Animal } from "../../components/Animal";
import Model from "../../components/Model";
import Utilities from "../../utils/Utilities";

export default class AnimalMovementSystem extends ASystem {
    constructor(name: string) {
        super(name);
    }

    onUpdate(elapsedTime: number): void {
        const movementTime: number = Math.floor(Math.random() * (+10 - +1)) + +1;
        const elapsedTimeAsSeconds: number = elapsedTime / 1000;

        ECSWrapper.entities.applyToEach(["Animal"], (animal: IEntity) => {
            const animalBoxCollider: BoxCollider = animal.getComponent(BoxCollider);
            const animalUtils: Animal = animal.getComponent(Animal);

            const randomPick: number = Math.random();

            if (!animalUtils.hasToMove && randomPick > 0.476 && randomPick < 0.477)
                animalUtils.hasToMove = true;

            if (animalUtils.hasToMove) {

                if (animalUtils.currentMovingTime > movementTime) {
                    animalUtils.currentMovingTime = 0;
                    animalUtils.hasToMove = false;
                }

                let movementVector: CANNON.Vec3 = new CANNON.Vec3(0, 2, 2);
                let rotatedVector: CANNON.Vec3 = Utilities.multiplyVectorByQuaternion(movementVector, animalBoxCollider.body.quaternion);

                animalBoxCollider.position.x += rotatedVector.x * 2 * elapsedTimeAsSeconds;
                animalBoxCollider.position.y += rotatedVector.y * 2 * elapsedTimeAsSeconds;
                animalBoxCollider.position.z += rotatedVector.z * 2 * elapsedTimeAsSeconds;

                // Handle rotation
                if (randomPick > 0.3 && randomPick < 0.5) {
                    animalBoxCollider.body.fixedRotation = false;
                    animalBoxCollider.rotation.set(0, animalBoxCollider.rotation.y + elapsedTimeAsSeconds, 0);
                    animalBoxCollider.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), animalBoxCollider.rotation.y);
                    animalBoxCollider.body.fixedRotation = true;
                }

                animalUtils.currentMovingTime += elapsedTimeAsSeconds;
            }
        });
    }

    onClose(): void {

    }
}
