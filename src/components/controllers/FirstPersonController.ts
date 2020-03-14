import * as THREE from 'three';

import AComponent from "../../ecs/abstract/AComponent";
import IEntity from "../../ecs/interfaces/IEntity";

import Vector3D from "../../maths/Vector3D";
import Vector2D from '../../maths/Vector2D';

interface Direction {
    left: number,
    right: number,
    forward: number,
    backward: number
}

class FirstPersonController extends AComponent {
    public readonly rotationSpeed: Vector2D;
    public readonly movementSpeed: Vector2D;
    public direction: Direction;
    public velocity: Vector3D;
    private isJumping: boolean;
    private _canJump: boolean;
    private _airTime: number;

    constructor(entity: IEntity, rotationSpeed: Vector2D, movementSpeed: Vector2D) {
        super(entity);

        this.rotationSpeed = rotationSpeed;
        this.movementSpeed = movementSpeed;
        this.direction = { left: 0, right: 0, forward: 0, backward: 0 };
        this._canJump = false;
        this._airTime = 0;
        this.velocity = new Vector3D;
    }

    public keyUp(keyEvent: KeyboardEvent) {
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

    public keyDown(keyEvent: KeyboardEvent) {
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

    get airTime(): number {
        return this._airTime;
    }

    set airTime(newTime: number) {
        this._airTime = newTime;
    }

    get jumping(): boolean {
        return this.isJumping;
    }

    set jumping(jump: boolean) {
        this.isJumping = jump;
    }

    get canJump(): boolean {
        return this._canJump;
    }

    set canJump(newState) {
        this._canJump = newState;
    }
}

export default FirstPersonController;
