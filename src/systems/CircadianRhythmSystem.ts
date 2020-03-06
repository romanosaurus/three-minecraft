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
    private _isSunset: boolean;
    private _isSunrise: boolean;
    private _dirLight: THREE.DirectionalLight;

    constructor(name: string) {
        super(name)
    }

    onInit() {
        this._isDay = true;
        this._isNight = false;
        this._isSunset = false;
        this._isSunrise = false;
        this._dirLight = new THREE.DirectionalLight(0xffffff, 1);

        ECSWrapper.entities.applyToEach(["CircadianRhythm"], (entity) => {
            const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();

            // add hemiLight
            var hemiLight = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.1);
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
        ECSWrapper.entities.applyToEach(["CircadianRhythm"], (entity) => {
            const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();
            const renderer: THREE.WebGLRenderer = ECSWrapper.systems.get(ThreeSystem).Renderer;
            const CircadianRhythmComponent = entity.getComponent(CircadianRhythm);

            CircadianRhythmComponent.time = elapsedTime + CircadianRhythmComponent.istime;

            let time : number = ((CircadianRhythmComponent.istime - elapsedTime) / 1000)

            var minuteTime = time / 60;

            let fadeout: number = 5;

            let lightFadeout: number = 2;

            let skyfadein = -0.4;

            let lightFadein = -0.50;

            if (this._isDay && minuteTime > 0) {
                this._dirLight.intensity = 2;

                if (minuteTime > CircadianRhythmComponent.switchingTime) {
                    CircadianRhythmComponent.time = 0;
                    minuteTime = 0;
                    this._isDay = false;
                    this._isSunset = true;
                }
            }
            if (this._isSunset && minuteTime > 0) {
                fadeout = (fadeout - (minuteTime * 4));
                lightFadeout = (lightFadeout - (minuteTime * 2));

                if (lightFadeout > -0.50)
                    this._dirLight.intensity = lightFadeout;
                if (fadeout > 0)
                    renderer.setClearColor(0x222233, fadeout);
                if (lightFadeout < - 0.50 && fadeout < 0) {
                    CircadianRhythmComponent.time = 0;
                    minuteTime = 0;
                    this._isSunset = false;
                    this._isNight = true;
                }
            }
            if (this._isNight && minuteTime > 0) {
                this._dirLight.intensity = -0.50;
                renderer.setClearColor(0x222233, 0);

                if (minuteTime > CircadianRhythmComponent.switchingTime) {
                    CircadianRhythmComponent.time = 0;
                    minuteTime = 0;
                    this._isNight = false;
                    this._isSunrise = true;
                }
            }
            if (this._isSunrise && minuteTime > 0) {
                skyfadein = (skyfadein + (minuteTime * 4));
                lightFadein = (lightFadein + (minuteTime));

                if (lightFadein < 2)
                    this._dirLight.intensity = lightFadein;
                if (skyfadein < 5)
                    renderer.setClearColor(0x222233, skyfadein);
                if (lightFadein > 1.90 && skyfadein > 4.90) {
                    CircadianRhythmComponent.time = 0;
                    minuteTime = 0;
                    this._isSunrise = false;
                    this._isDay = true;
                }
            }
        });
    }

    onClose() {}

}