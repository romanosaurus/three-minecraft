import * as THREE from 'three';
import { RedIntegerFormat } from 'three';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import IEntity from "../ecs/interfaces/IEntity";

import Camera from "../components/Camera";

/**
 * @class FullScreen
 */
export default class FullScreen
{
    public static keyDown(renderer: THREE.WebGLRenderer, scene: THREE.Scene) {
        ECSWrapper.entities.applyToEach(["Camera"], (entity) => {
            const camera: Camera = entity.getComponent(Camera);

            camera.camera.aspect = window.innerWidth / window.innerHeight;
            camera.camera.updateProjectionMatrix();
            document.body.style.display = 'block';
            document.body.style.margin = "0px";
            document.body.style.overflow = "hidden";
            renderer.setSize( window.innerWidth, window.innerHeight);
            document.body.appendChild( renderer.domElement );
        });
    }
}