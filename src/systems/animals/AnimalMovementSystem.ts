import * as CANNON from "cannon";

import ECSWrapper from "../../ecs/wrapper/ECSWrapper";
import ASystem from "../../ecs/abstract/ASystem";
import IEntity from "../../ecs/interfaces/IEntity";
import BoxCollider from "../../components/BoxCollider";
import { Animal } from "../../components/Animal";
import Model from "../../components/Model";
import Utilities from "../../utils/Utilities";
import { Object3D } from "three";
import ThreeSystem from "../ThreeSystem";

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
            const animalBoxCollider: BoxCollider = animal.getComponent(BoxCollider);
            const animalUtils: Animal = animal.getComponent(Animal);

            const randomPick: number = Math.random(); // Random pick to know if the animal has to move.

            // Handle the movement of the animals if the animal has a partner
            if (animalUtils.partner) {
                const partnerCollider = animalUtils.partner.getEntity().getComponent(BoxCollider);
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
                let movementVector: CANNON.Vec3 = new CANNON.Vec3(0, 2, 2);
                let rotatedVector: CANNON.Vec3 = Utilities.multiplyVectorByQuaternion(movementVector, animalBoxCollider.body.quaternion);

                animalBoxCollider.position.x += rotatedVector.x * animalUtils.speed * elapsedTimeAsSeconds;
                animalBoxCollider.position.y += rotatedVector.y * animalUtils.speed * elapsedTimeAsSeconds;
                animalBoxCollider.position.z += rotatedVector.z * animalUtils.speed * elapsedTimeAsSeconds;

                // Handle rotation
                if (randomPick > 0.3 && randomPick < 0.5 && !animalUtils.partner) {
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

    makeLoverMeet(animalUtils: Animal, elapsedTime: number) {
        const curAnimalBody = animalUtils.getEntity().getComponent(BoxCollider);
        const partnerBody = animalUtils.partner.getEntity().getComponent(BoxCollider);

        if (!animalUtils.facingPartner || this.curTime > 1) {
            curAnimalBody.getEntity().getComponent(Model).getObject().then((obj) => {
                obj.lookAt(partnerBody.body.position.x, partnerBody.body.position.y, partnerBody.body.position.z);
                curAnimalBody.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), obj.rotation.x);
            });
            animalUtils.facingPartner = true;
            this.curTime = 0;
        }
        this.curTime += elapsedTime
    }
}
