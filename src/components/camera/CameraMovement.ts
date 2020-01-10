import * as THREE from 'three';

import Object3 from "./../models/Object3";
import { MOUSE } from "three";

export default class MovementCamera
{
    private PI_2: number;

    private speedY: number;
    private speedX: number;

    // Basic ctor for MovementCamera init camera view
    constructor( playerObj, camera )
    {
        this.PI_2 = Math.PI / 2;

        this.speedX = 0.005;
        this.speedY = 0.005;

        playerObj.getObject().then(object => {
            camera.position.set( object.position.x + 1, object.position.y + 8, object.position.z );
            camera.rotation.set( object.rotation.x, object.rotation.y, object.rotation.z );

            const euler = new THREE.Euler(0, 0, 0, 'YXZ');
            euler.x = object.rotation.x;
            euler.y = object.rotation.y - 1.6;

            camera.quaternion.setFromEuler(euler);
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
       
        // fix limit for camera vision
        if (euler.x < -1 || euler.x > 1 || euler.y < -3)
            return;
        else
            camera.quaternion.setFromEuler(euler);
    }

    // Add listeners for mouse move
    public CameraListeners( camera ): void
    {
        document.addEventListener( 'mousemove', ( mouse_event ) => { this.CameraMovement( mouse_event, camera ) });
    }
}