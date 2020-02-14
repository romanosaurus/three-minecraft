import * as THREE from "three";

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import CircadianRhythm from "../components/CircadianRhythm";
import SystemManager from "../ecs/managers/SystemManager";
import IEntity from "../ecs/interfaces/IEntity";
import { cornflowerblue } from "color-name";

export default class CircadianRhythmSystem extends ASystem {
    private _isDay: boolean;
    private _isNight: boolean;
    private _dirLight: THREE.DirectionalLight;

    constructor(name: string) {
        super(name)
    }

    onInit() {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();
        this._isDay = true;
        this._isNight = false;
        this._dirLight = new THREE.DirectionalLight(0xffffff, 1);

        ecsWrapper.entityManager.applyToEach(["CircadianRhythm"], (entity) => {
            const scene: THREE.Scene = ecsWrapper.systemManager.getSystem(ThreeSystem).getScene();
            const renderer: THREE.WebGLRenderer = ecsWrapper.systemManager.getSystem(ThreeSystem).getRenderer();

            // add hemiLight
            var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.05);
            hemiLight.color.setHSL(0.6, 1, 0.6);
            hemiLight.groundColor.setHSL(0.095, 1, 0.75);
            hemiLight.position.set(0, 500, 0);
            scene.add(hemiLight);

            // add the sun
            this._dirLight.color.setHSL(0.1, 1, 0.95);
            this._dirLight.position.set(-1, 0.75, 1);
            this._dirLight.position.multiplyScalar(50);
            scene.add(this._dirLight);

            this._dirLight.castShadow = true;
            this._dirLight.shadowMapWidth = this._dirLight.shadowMapHeight = 1024*2;
            this._dirLight.shadowCameraLeft = -30;
            this._dirLight.shadowCameraRight = 30;
            this._dirLight.shadowCameraTop = 30;
            this._dirLight.shadowCameraBottom = -30;

            this._dirLight.shadowCameraFar = 3500;
            this._dirLight.shadowBias = -0.000001;
            scene.add(this._dirLight);
        });
    }

    onUpdate(elapsedTime: number): void {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        ecsWrapper.entityManager.applyToEach(["CircadianRhythm"], (entity) => {
            const scene: THREE.Scene = ecsWrapper.systemManager.getSystem(ThreeSystem).getScene();
            const renderer: THREE.WebGLRenderer = ecsWrapper.systemManager.getSystem(ThreeSystem).getRenderer();
            const CircadianRhythmComponent = entity.getComponent(CircadianRhythm);

            CircadianRhythmComponent.time = elapsedTime + CircadianRhythmComponent.istime;

            let time : number = ((CircadianRhythmComponent.istime - elapsedTime) / 1000)

            var minuteTime = time / 60;

            /*
            if (minuteTime > 0 && this._isDay === true) { // day
                this._dirLight.intensity = 1;
                CircadianRhythmComponent.time = 0;
                this._isDay = false;
            } else if (minuteTime > 0.40 && minuteTime < 1) {
                var nsin = Math.sin(minuteTime);
                var f = nsin/2;
                this._dirLight.intensity = f;
                var color = new THREE.Color;
                color.setRGB(0.25*f, 0.55*f, 1*f);
                renderer.setClearColor(color);
            } else if (minuteTime > 1 && this._isNight === false) {
                this._isNight = true;
            }
            */
        });
    }

    onClose() {}

}