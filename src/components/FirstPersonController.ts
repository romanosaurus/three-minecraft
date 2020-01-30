import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

interface Direction {
    left: number,
    right: number,
    forward: number,
    backward: number
}

class FirstPersonController extends AComponent {
    public readonly rotationSpeed: THREE.Vector2;
    public readonly movementSpeed: THREE.Vector2;
    public direction: Direction;
    private euler: THREE.Euler;
    private isJumping: boolean;

    constructor(entity: IEntity, rotationSpeed: THREE.Vector2, movementSpeed: THREE.Vector2) {
        super(entity);

        this.rotationSpeed = rotationSpeed;
        this.movementSpeed = movementSpeed;
        this.euler = new THREE.Euler();
        this.direction = {
            left: 0,
            right: 0,
            forward: 0,
            backward: 0
        }
    }

    keyUp(keyEvent: KeyboardEvent) {
        switch (keyEvent.key) {
            case "z":
                this.direction.forward = 0;
                break;
            case "q":
                this.direction.left = 0;
                break;
            case "d":
                this.direction.right = 0;
                break;
            case "s":
                this.direction.backward = 0;
                break;
            default:
                break;
        }
    }

    keyDown(keyEvent: KeyboardEvent) {
        switch (keyEvent.key) {
            case "z":
                this.direction.forward = 1;
                break;
            case "q":
                this.direction.left = 1;
                break;
            case "d":
                this.direction.right = 1;
                break;
            case "s":
                this.direction.backward = 1;
                break;
            case " ":
                this.isJumping = true;
                break;
            default:
                break;
        }
    }

    get jumping(): boolean {
        return this.isJumping;
    }

    set jumping(jump: boolean) {
        this.isJumping = false;
    }
}

export default FirstPersonController;