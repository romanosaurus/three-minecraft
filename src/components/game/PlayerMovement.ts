import * as THREE from 'three';

interface Direction {
    left: number,
    right: number,
    forward: number,
    backward: number
}

export default class PlayerMovement {
    private readonly speed : number = 5;
    private readonly jumpingHigh : number = 5;

    private direction : Direction = {
        left: 0,
        right: 0,
        forward: 0,
        backward: 0
    };
    private isJumping : boolean = false;

    private onKeyDown(keyEvent : KeyboardEvent) {
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

    private onKeyUp(keyEvent : KeyboardEvent) {
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

    public Movement(player : CANNON.Body, camera: THREE.Camera, deltaTime : number) {

        if (this.isJumping) {
            player.position.y += (this.jumpingHigh * deltaTime);
        }

        let directionVector : THREE.Vector3 = new THREE.Vector3(
            this.direction.right - this.direction.left,
            0,
            this.direction.backward - this.direction.forward
        );
        directionVector.applyEuler(camera.rotation);
        directionVector.y = 0;

        if (directionVector.lengthSq() === 0)
            return;
        else
            directionVector = directionVector.normalize();

        let movementVector : THREE.Vector3 = new THREE.Vector3(
            directionVector.x * this.speed * deltaTime,
            0,
            directionVector.z * this.speed * deltaTime
        );

        player.position.z += movementVector.z;
        player.position.x += movementVector.x;
    }

    public Rotation(player : THREE.Mesh, camera : THREE.Camera) {
        player.rotation.set(0, camera.rotation.y, 0);
    }

    public setJumping(isJumping : boolean) {
        this.isJumping = isJumping;
    }

    public Listeners() {
        document.addEventListener( 'keydown', ( keyEvent ) => { this.onKeyDown( keyEvent ) });
        document.addEventListener( 'keyup', ( keyEvent ) => { this.onKeyUp( keyEvent ) }, false);
    }
}
