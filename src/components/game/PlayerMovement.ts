import * as THREE from 'three';

import Object3 from "./../models/Object3";

export default class PlayerMovement
{
    // Speed player x and y
    private xSpeed: number;
    private ySpeed: number;

    // Basic ctor for PlayerMovement init speed
    constructor( xSpeed, ySpeed )
    {
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
    }

    // Handle movement player
    private OnKeyDown( keyPressEvent, playerObj, camera )
    {
        playerObj.getObject().then(object => {
            if (keyPressEvent.key == "s")
                object.position.x -= this.xSpeed;                
            if (keyPressEvent.key == "z")
                object.position.x += this.xSpeed;
            if (keyPressEvent.key == "q")
                object.position.z -= this.ySpeed;
            if (keyPressEvent.key == "d")
                object.position.z += this.ySpeed;
            camera.position.set(object.position.x + 1, object.position.y + 8, object.position.z);
        })
    }

    // Add listeners for key down
    public PlayerListener( playerObj, camera ): void
    {
        document.addEventListener( 'keydown', ( keyPressEvent ) => { this.OnKeyDown(keyPressEvent, playerObj, camera ) } );
    }
}