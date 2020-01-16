import * as THREE from 'three';

import Object3 from "./../models/Object3";
import { MOUSE } from "three";

export default class MovementCamera
{
    private PI_2: number;

    private speedY: number;
    private speedX: number;

    private speed: number;

    private euler: THREE.Euler;

    private quat: THREE.Quaternion;

    private moveForward: boolean;
    private moveBackward: boolean;
    private moveLeft: boolean;
    private moveRight: boolean;

    // Basic ctor for MovementCamera init camera view
    constructor( playerObj, camera )
    {
        this.PI_2 = Math.PI / 2;

        this.speedX = 0.005;
        this.speedY = 0.005;

        this.speed = 0.2;

        this.quat = new THREE.Quaternion();

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        playerObj.getObject().then(object => {
            camera.position.set( object.position.x + 1, object.position.y + 8, object.position.z );
            camera.rotation.set( object.rotation.x, object.rotation.y, object.rotation.z );

            this.euler = new THREE.Euler( 0, 0, 0, 'XYZ');
            this.euler.x = object.rotation.x;
            this.euler.y = object.rotation.y - 1.6;

            camera.quaternion.setFromEuler( this.euler );
        })
    }

    // Handle camera movement
    private CameraMovement( mouse_event, camera )
    {
        const euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
        const movementX = mouse_event.movementX || mouse_event.mozMovementX || mouse_event.webkitMovementX || 0;
        const movementY = mouse_event.movementY || mouse_event.mozMovementY || mouse_event.webkitMovementY || 0;

        euler.setFromQuaternion( camera.quaternion );

		euler.y -= movementX * 0.005;
		euler.x -= movementY * 0.005;

        euler.x = Math.max( - this.PI_2, Math.min( this.PI_2, euler.x ) );
       
        camera.quaternion.setFromEuler(euler);
    }

    private onKeyDown( keyEvent )
    {
        switch ( keyEvent.key )
        {
            case "z":
                this.moveForward = true;
                break;
            case "s":
                this.moveBackward = true;
                break;
            case "q":
                this.moveLeft = true;
                break;
            case "d":
                this.moveRight = true;
                break;
        }
    }

    private onKeyUp( keyEvent )
    {
        switch ( keyEvent.key )
        {
            case "z":
                this.moveForward = false;
                break;
            case "s":
                this.moveBackward = false;
                break;
            case "q":
                this.moveLeft = false;
                break;
            case "d":
                this.moveRight = false;
                break;
        }
    }

    // Function for update translate X and Y camera
    public updateCamera( camera )
    {
        if ( this.moveForward )
            camera.translateZ( - this.speed );
        if ( this.moveBackward )
            camera.translateZ( this.speed );
        if ( this.moveLeft )
            camera.translateX( - this.speed );
        if ( this.moveRight )
            camera.translateX( this.speed );
    }

    // Add listeners for mouse move
    public CameraListeners( camera ): void
    {
        document.addEventListener( 'mousemove', ( mouse_event ) => { this.CameraMovement( mouse_event, camera ) });
        document.addEventListener( 'keydown', ( keyEvent ) => { this.onKeyDown( keyEvent ) });
        document.addEventListener( 'keyup', ( keyEvent ) => { this.onKeyUp( keyEvent ) }, false);
    }
}