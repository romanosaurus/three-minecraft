import * as THREE from 'three';
import * as CANNON from 'cannon';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import Camera from "../components/Camera";
import FirstPersonController from "../components/FirstPersonController";
import Box from "../components/Box";
import BoxCollider from "../components/BoxCollider";
import PointerLock from '../components/PointerLock';

class FirstPersonSystem extends ASystem {
    private currentTime: number;
    constructor(name: string) {
        super(name);
        this.currentTime = 0;
    }

    onInit() {}

    onUpdate(elapsedTime: number): void {
        const jumpingTime: number = 0.3;


        ECSWrapper.entities.applyToEach(["Camera", "FirstPersonController", "PointerLock"], (entity) => {
            if (entity.getComponent(PointerLock).pointerLockActivated) {

                const euler = new THREE.Euler(0, 0, 0, 'YXZ');
                const mouseEvent = this.events["mouseEvent"];
                let movementX: number = 0;
                let movementY: number = 0;

                if (mouseEvent !== undefined) {
                    movementX = mouseEvent.movementX || mouseEvent.mozMovementX || mouseEvent.webkitMovementX || 0;
                    movementY = mouseEvent.movementY || mouseEvent.mozMovementY || mouseEvent.webkitMovementY || 0;
                }

                euler.setFromQuaternion(entity.getComponent(Camera).camera.quaternion);
                euler.y -= movementX * entity.getComponent(FirstPersonController).rotationSpeed.y;
                euler.x -= movementY * entity.getComponent(FirstPersonController).rotationSpeed.x;

                euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
                entity.getComponent(Camera).camera.quaternion.setFromEuler(euler);
            }
        });

        ECSWrapper.entities.applyToEach(["Camera", "Box", "FirstPersonController", "BoxCollider"], (entity) => {
            const keyUp = this.events["keyUp"];
            const keyDown = this.events["keyDown"];
            const firstPersonController: FirstPersonController = entity.getComponent(FirstPersonController);

            if (keyUp)
                firstPersonController.keyUp(keyUp);
            if (keyDown)
                firstPersonController.keyDown(keyDown);

            entity.getComponent(BoxCollider).body.mass = 10;
            if (firstPersonController.jumping && this.currentTime < jumpingTime) {
                if (this.currentTime < jumpingTime) {
                    const force: number = 2;

                    entity.getComponent(BoxCollider).body.mass = 0;
                    entity.getComponent(BoxCollider).body.applyLocalImpulse(
                        new CANNON.Vec3(0, force, 0),
                        new CANNON.Vec3(0, 0, 0)
                    );
                    this.currentTime += (elapsedTime / 1000);
                }
            } else if (!firstPersonController.jumping && this.currentTime > jumpingTime) {
                this.currentTime = 0;
            }

            let directionVector : THREE.Vector3 = new THREE.Vector3(
                firstPersonController.direction.right - firstPersonController.direction.left,
                0,
                firstPersonController.direction.backward - firstPersonController.direction.forward
            );
            directionVector.applyEuler(entity.getComponent(Camera).camera.rotation);
            directionVector.y = 0;

            if (directionVector.lengthSq() === 0)
                return;
            else
                directionVector = directionVector.normalize();

            let movementVector : THREE.Vector3 = new THREE.Vector3(
                directionVector.x * firstPersonController.movementSpeed.x * elapsedTime,
                0,
                directionVector.z * firstPersonController.movementSpeed.y * elapsedTime
            );

            entity.getComponent(BoxCollider).body.position.z += movementVector.z;
            entity.getComponent(BoxCollider).body.position.x += movementVector.x;
        });

        ECSWrapper.entities.applyToEach(["Box", "Camera"], (entity) => {
            entity.getComponent(Camera).camera.position.set(
                entity.getComponent(Box).mesh.position.x,
                entity.getComponent(Box).mesh.position.y,
                entity.getComponent(Box).mesh.position.z
            );
        });
    }

    onClose(): void {}
}

export default FirstPersonSystem;
