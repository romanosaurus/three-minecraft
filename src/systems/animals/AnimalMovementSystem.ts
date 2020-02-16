import * as CANNON from "cannon";

import ECSWrapper from "../../ecs/wrapper/ECSWrapper";
import ASystem from "../../ecs/abstract/ASystem";
import IEntity from "../../ecs/interfaces/IEntity";
import BoxCollider from "../../components/BoxCollider";
import { Animal } from "../../components/Animal";

export default class AnimalMovementSystem extends ASystem {
    constructor(name: string) {
        super(name);
    }

    onInit(): void {

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

                animalBoxCollider.position.z += (2 * elapsedTimeAsSeconds);
                animalBoxCollider.position.y += (2 * elapsedTimeAsSeconds);
                
                animalUtils.currentMovingTime += elapsedTimeAsSeconds;
            }
        });
    }

    onClose(): void {

    }
}