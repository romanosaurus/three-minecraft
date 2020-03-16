import * as CANNON from "cannon";

import ECSWrapper from "../../ecs/wrapper/ECSWrapper";
import ASystem from "../../ecs/abstract/ASystem";
import IEntity from "../../ecs/interfaces/IEntity";
import { Animal } from "../../components/Animal";
import Model from "../../components/Model";
import Utilities from "../../utils/Utilities";
import { Object3D } from "three";
import ThreeSystem from "../ThreeSystem";
import Transform from "../../components/Transform";
import Controller from "../../components/controllers/Controller";
import Vector3D from "../../maths/Vector3D";
import Rigidbody from "../../components/physics/Rigidbody";

/**
 * AnimalMovementSystem
 *
 * System handling the movement of all animals
 * on the map.
 *
 * Animals go forward
 */
export default class AnimalMovementSystem extends ASystem {
    private curTime = 0;
    constructor(name: string) {
        super(name);
    }

    onUpdate(elapsedTime: number): void {
        const movementTime: number = Math.floor(Math.random() * (+10 - +1)) + +1; // Get a movement time
        const elapsedTimeAsSeconds: number = elapsedTime / 1000;

        ECSWrapper.entities.applyToEach(["Animal"], (animal: IEntity) => {
            const animalBoxCollider: Rigidbody = animal.getComponent(Rigidbody);
            const animalUtils: Animal = animal.getComponent(Animal);
            const animalController = animal.getComponent(Controller);
            const animalTransform = animal.getComponent(Transform);
            const randomPick: number = Math.random(); // Random pick to know if the animal has to move.

            // Handle the movement of the animals if the animal has a partner
            if (animalUtils.partner) {
                const partnerCollider = animalUtils.partner.getEntity().getComponent(Rigidbody);
                const distance = 1;

                if (partnerCollider.position.x >= animalBoxCollider.position.x + distance ||
                    partnerCollider.position.x + distance <= animalBoxCollider.position.x) {
                    animalUtils.hasToMove = true;
                } else {
                    animalUtils.hasToMove = false;
                    if (!animalUtils.partner.makeBaby)
                        animalUtils.makeBaby = true;
                }
            }

            // Check the random pick to make the animal move if needed
            if (!animalUtils.hasToMove && randomPick > 0.3 && randomPick < 0.4)
                animalUtils.hasToMove = true;

            if (animalUtils.hasToMove) {

                if (animalUtils.partner) // If the animal has a partner, make them meet
                    this.makeLoverMeet(animalUtils, elapsedTimeAsSeconds);

                if (animalUtils.currentMovingTime > movementTime && !animalUtils.partner) {
                    animalUtils.currentMovingTime = 0;
                    animalUtils.hasToMove = false;
                }

                // Calculate the movement based on the animal's rotation.

                let rotatedVector = new Vector3D(0, 2, 2).applyQuaternion(animalTransform.quaternion);

                animalController.velocity = new Vector3D(
                    rotatedVector.x * animalController.speed * elapsedTimeAsSeconds,
                    rotatedVector.y * animalController.speed * elapsedTimeAsSeconds,
                    rotatedVector.z * animalController.speed * elapsedTimeAsSeconds
                );

                // Handle rotation
                if (randomPick > 0.3 && randomPick < 0.5 && !animalUtils.partner) {
                    if (randomPick < 0.4 && randomPick > 0.3)
                        animalTransform.rotation.y += elapsedTimeAsSeconds;
                    else
                        animalTransform.rotation.y -= elapsedTimeAsSeconds;
                    animalTransform.quaternion.setFromAxisAngle(Vector3D.UP, animalTransform.rotation.y);
                }

                animalUtils.currentMovingTime += elapsedTimeAsSeconds;
            }
        });
    }

    onClose(): void {

    }

    makeLoverMeet(animalUtils: Animal, elapsedTime: number) {
        const curAnimalBody = animalUtils.getEntity().getComponent(Rigidbody);
        const partnerBody = animalUtils.partner.getEntity().getComponent(Rigidbody);
        const transform = animalUtils.getEntity().getComponent(Transform);

        if (!animalUtils.facingPartner || this.curTime > 1) {
            curAnimalBody.getEntity().getComponent(Model).getObject().then((obj) => {
                obj.lookAt(partnerBody.position.x, partnerBody.position.y, partnerBody.position.z);
                obj.rotation.x = 0;
                obj.rotation.z = 0;
                transform.quaternion.setFromEuler(obj.rotation);
            });
            animalUtils.facingPartner = true;
            this.curTime = 0;
        }
        this.curTime += elapsedTime
    }
}
