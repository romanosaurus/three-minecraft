import * as THREE from 'three';

import Object3 from "./../models/Object3";

export default class PlayerMovement
{
    // Basic ctor for PlayerMovement
    constructor()
    {

    }

    public updatePlayerMovement( playerObj, camera )
    {
        playerObj.getObject().then(object => {
            object.rotation.y = camera.rotation.y;
            object.position.x = camera.position.x;
            object.position.y = camera.position.y;
            object.position.z = camera.position.z;
        })
    }
}