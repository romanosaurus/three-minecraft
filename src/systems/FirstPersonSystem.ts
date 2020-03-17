import * as THREE from 'three';
import * as CANNON from 'cannon';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import Camera from "../components/Camera";
import FirstPersonController from "../components/controllers/FirstPersonController";
import Box from "../components/Box";
import PointerLock from '../components/PointerLock';
import Life from '../components/Life';
import AudioSource from '../components/audio/AudioSource';
import Audio, { AudioState } from '../components/audio/Audio';
import Transform from '../components/Transform';
import Euler from '../maths/Euler';

/**
 * FirstPersonSystem heriting from ASystem
 * @system FirstPersonSystem
 * @function onInit function automatically called at the initialization of the system
 * @function onUpdate function automatically called at each main loop tour
 * @function onClose function calles when the system is shutted down
 */
class FirstPersonSystem extends ASystem {
    private startJumping: number;
    private isStartedJump: Boolean;


    /**
     * Constuctor of the FirstPersonSystem
     * @param name name of the system
     */
    constructor(name: string) {
        super(name);

        this.startJumping = 0;
        this.isStartedJump = false;
        this.setupMouseEvent();
        this.setupKeyEvents();
    }

    onInit() {
        ECSWrapper.entities.create("fallSound");
        const fallEntity = ECSWrapper.entities.getByName("fallSound")[0];
        fallEntity.assignComponent<AudioSource>(new AudioSource(fallEntity));
        ECSWrapper.entities.getByName('Player')[0].getComponent(Camera).camera.add(fallEntity.getComponent(AudioSource).listener);
        fallEntity.assignComponent<Audio>(new Audio(fallEntity, {
            listener: fallEntity.getComponent(AudioSource).listener,
            path: "../../assets/sound/minecraft-damage-oof-sound-effect-hd.ogg",
            loop: false,
            volume: 1
        }));
        fallEntity.getComponent(Audio).state = AudioState.SOUND;
    }

    onUpdate(elapsedTime: number): void {
        const elapsedTimeAsSecond = elapsedTime / 1000;

        ECSWrapper.entities.applyToEach(["Camera", "Box", "FirstPersonController", "Rigidbody", "Transform"], (entity) => {
            const firstPersonController: FirstPersonController = entity.getComponent(FirstPersonController);
            const lifeComponent = entity.getComponent(Life);
            const transform = entity.getComponent(Transform);

            if (!lifeComponent.isPlayerDead) {
                if (firstPersonController.jumping && firstPersonController.canJump) {
                    firstPersonController.velocity.y = 5;
                    firstPersonController.canJump = false;
                    firstPersonController.jumping = false;
                } else {
                    firstPersonController.velocity.y = 0;
                }

                let directionVector: THREE.Vector3 = new THREE.Vector3(
                    firstPersonController.direction.right - firstPersonController.direction.left,
                    0,
                    firstPersonController.direction.backward - firstPersonController.direction.forward
                );
                directionVector.applyEuler(entity.getComponent(Camera).camera.rotation);
                directionVector.y = 0;

                if (directionVector.lengthSq() === 0) {
                    firstPersonController.velocity.x = 0;
                    firstPersonController.velocity.z = 0;
                    return;
                } else
                    directionVector = directionVector.normalize();

                let movementVector : THREE.Vector3 = new THREE.Vector3(
                    directionVector.x * firstPersonController.movementSpeed.x * elapsedTimeAsSecond,
                    0,
                    directionVector.z * firstPersonController.movementSpeed.y * elapsedTimeAsSecond
                );

                firstPersonController.velocity.x = movementVector.x;
                firstPersonController.velocity.z = movementVector.z;
                
                const sound = ECSWrapper.entities.getByName("fallSound")[0].getComponent(Audio);

                if (!firstPersonController.canJump && !this.isStartedJump) {
                    this.startJumping = Math.round(entity.getComponent(Transform).position.y);
                    this.isStartedJump = true;
                } else if (firstPersonController.canJump && this.isStartedJump) {
                    let endJump = Math.round(entity.getComponent(Transform).position.y);
                    let jumpDif = this.startJumping - endJump;
                    if (jumpDif > 3) {
                        lifeComponent.takeDamage = jumpDif - 3;
                        sound.sound.play();
                    }
                    this.isStartedJump = false;
                    this.startJumping = 0;
                }
            }
        });
    }

    onClose(): void {}

    private setupMouseEvent() {
        this.registerEvent("mouseEvent", (event: any) => {
            ECSWrapper.entities.applyToEach(["Camera", "FirstPersonController", "PointerLock", "Transform"], (entity) => {
                const lifeComponent = entity.getComponent(Life);
                const transform = entity.getComponent(Transform);

                if (!lifeComponent.isPlayerDead) {
                    if (entity.getComponent(PointerLock).pointerLockActivated) {
                        const euler = new Euler(0, 0, 0, 'YXZ');
                        let movementX: number = 0;
                        let movementY: number = 0;

                        if (event !== undefined) {
                            movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                            movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
                        }

                        euler.setFromQuaternion(transform.quaternion);
                        euler.y -= movementX * entity.getComponent(FirstPersonController).rotationSpeed.y;
                        euler.x -= movementY * entity.getComponent(FirstPersonController).rotationSpeed.x;

                        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
                        transform.quaternion.setFromEuler(euler);
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
