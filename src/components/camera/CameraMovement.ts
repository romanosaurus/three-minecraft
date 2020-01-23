import * as THREE from 'three';

import Object3 from "./../models/Object3";
import { MOUSE, Raycaster, Scene } from "three";

export default class CameraMovement
{
    private readonly PI_2: number;

    private speedY: number;
    private speedX: number;

    private speed: number;

    private pointerLock: boolean;

    private readonly euler: THREE.Euler;

    private quat: THREE.Quaternion;

    // Basic ctor for MovementCamera init camera view
    constructor(object: THREE.Mesh, camera: THREE.Camera)
    {
        this.PI_2 = Math.PI / 2;

        this.speedX = 0.005;
        this.speedY = 0.005;

        this.speed = 0.2;

        this.pointerLock = true;

        this.quat = new THREE.Quaternion();

        camera.position.set( object.position.x + 1, object.position.y + 8, object.position.z );
        camera.rotation.set( object.rotation.x, object.rotation.y, object.rotation.z );

        this.euler = new THREE.Euler( 0, 0, 0, 'XYZ');
        this.euler.x = object.rotation.x;
        this.euler.y = object.rotation.y - 1.6;

        camera.quaternion.setFromEuler( this.euler );
    }

    // Handle camera movement
    private CameraMovement(mouseEvent, camera : THREE.Camera) {
        const euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
        const movementX = mouseEvent.movementX || mouseEvent.mozMovementX || mouseEvent.webkitMovementX || 0;
        const movementY = mouseEvent.movementY || mouseEvent.mozMovementY || mouseEvent.webkitMovementY || 0;

        euler.setFromQuaternion( camera.quaternion );

		euler.y -= movementX * 0.005;
		euler.x -= movementY * 0.005;

        euler.x = Math.max( - this.PI_2, Math.min( this.PI_2, euler.x ) );

        camera.quaternion.setFromEuler(euler);


    }

    private updateCameraPointer(camera : THREE.Camera)
    {
        if ( this.pointerLock )
            document.body.requestPointerLock();
        else
            document.exitPointerLock();
    }

    private CameraPointerLock( keyPressed )
    {
        if (keyPressed.key == "e") {
            if (!this.pointerLock )
                this.pointerLock = true;
            else
                this.pointerLock = false;
        }
    }
    public Update(camera : THREE.Camera, object : THREE.Mesh) : void {
        camera.position.set(object.position.x, object.position.y, object.position.z);
        this.updateCameraPointer( camera );
    }

    // Add listeners for mouse move
    public CameraListeners(camera : THREE.Camera): void {
        document.addEventListener( 'mousemove', ( mouse_event ) => { this.CameraMovement(mouse_event, camera) });
        document.addEventListener( 'keydown', ( key_pressed ) => { this.CameraPointerLock(key_pressed) });
    }

    public createPointer(camera : THREE.Camera, scene : THREE.Scene)
    {
        var loader = new THREE.TextureLoader();

        var texture = new THREE.TextureLoader().load( '../../../assets/cursor/Cursor.png' );
    
        var material = new THREE.MeshPhongMaterial({ transparent: true, map: texture });

        material.transparent = true;
        material.opacity = 0.9;
    
        var geometry = new THREE.PlaneGeometry(10, 10*.75);

        var mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(0,1,0)

        scene.add(mesh);

        var light = new THREE.PointLight( 0xffffff, 1, 0 );

        // Specify the light's position
        light.position.set(1, 1, 100 );

        // Add the light to the scene
        scene.add(light);
    }
}
