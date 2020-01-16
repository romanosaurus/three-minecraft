import * as THREE from 'three';

import Object3 from "./../models/Object3";

export default class PlayerMovement
{
    // Speed player x and y
    private xSpeed: number;
    private ySpeed: number;

    private moveForward: boolean;
    private moveBackward: boolean;
    private moveLeft: boolean;
    private moveRight: boolean;

    // Basic ctor for PlayerMovement init speed
    constructor()
    {

    }

    public updatePlayerMovement( playerObj, camera )
    {
        playerObj.getObject().then(object => {
            object.rotation.y = camera.rotation.y;
            object.position.x = camera.position.x;
            object.position.y = camera.position.y - 8;
            object.position.z = camera.position.z;
        })
    }
}