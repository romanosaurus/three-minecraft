import * as THREE from 'three';
import * as CANNON from 'cannon';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import Camera from "../components/Camera";
import FirstPersonController from "../components/FirstPersonController";
import Box from "../components/Box";
import BoxCollider from "../components/BoxCollider";
import PointerLock from '../components/PointerLock';
import Life from '../components/Life'

/**
 * FirstPersonSystem heriting from ASystem
 * @system FirstPersonSystem
 * @function onInit function automatically called at the initialization of the system
 * @function onUpdate function automatically called at each main loop tour
 * @function onClose function calles when the system is shutted down
 */
class FirstPersonSystem extends ASystem {
    private currentTime: number;

    /**
     * Constuctor of the FirstPersonSystem
     * @param name name of the system
     */
    constructor(name: string) {
        super(name);

        this.currentTime = 0;
        this.setupMouseEvent();
        this.setupKeyEvents();
    }

    onInit() {}

    onUpdate(elapsedTime: number): void {
        const jumpingTime: number = 0.3;

        ECSWrapper.entities.applyToEach(["Camera", "Box", "FirstPersonController", "BoxCollider"], (entity) => {
            const firstPersonController: FirstPersonController = entity.getComponent(FirstPersonController);
            const lifeComponent = entity.getComponent(Life);

            if (!lifeComponent.isPlayerDead) {
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
            }
        });

        ECSWrapper.entities.applyToEach(["Box", "Camera"], (entity) => {
            const lifeComponent = entity.getComponent(Life);

            if (!lifeComponent.isPlayerDead) {
                entity.getComponent(Camera).camera.position.set(
                    entity.getComponent(Box).mesh.position.x,
                    entity.getComponent(Box).mesh.position.y,
                    entity.getComponent(Box).mesh.position.z
                );
            }
        });
    }

    onClose(): void {}

    private setupMouseEvent() {
        this.registerEvent("mouseEvent", (event: any) => {
            ECSWrapper.entities.applyToEach(["Camera", "FirstPersonController", "PointerLock"], (entity) => {
                const lifeComponent = entity.getComponent(Life);
                
                if (!lifeComponent.isPlayerDead) {
                    if (entity.getComponent(PointerLock).pointerLockActivated) {
                        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
                        let movementX: number = 0;
                        let movementY: number = 0;

                        if (event !== undefined) {
                            movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                            movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
                        }

                        euler.setFromQuaternion(entity.getComponent(Camera).camera.quaternion);
                        euler.y -= movementX * entity.getComponent(FirstPersonController).rotationSpeed.y;
                        euler.x -= movementY * entity.getComponent(FirstPersonController).rotationSpeed.x;

                        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
                        entity.getComponent(Camera).camera.quaternion.setFromEuler(euler);
                    }
                } else {
                    entity.getComponent(PointerLock).pointerLockActivated = false;
                    document.exitPointerLock();
                }
            });
        });
    }

    private setupKeyEvents() {
        this.registerEvent("keyDown", (event: any) => {
            ECSWrapper.entities.applyToEach(["FirstPersonController"], (entity) => {
                entity.getComponent(FirstPersonController).keyDown(event);
            });
        });


        this.registerEvent("keyUp", (event: any) => {
            ECSWrapper.entities.applyToEach(["FirstPersonController"], (entity) => {
                entity.getComponent(FirstPersonController).keyUp(event);
            });
        })
    }
}

export default FirstPersonSystem;
