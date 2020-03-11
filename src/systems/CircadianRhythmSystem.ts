import * as THREE from "three";

import ASystem from "../ecs/abstract/ASystem";

import ECSWrapper from "../ecs/wrapper/ECSWrapper";

import ThreeSystem from "./ThreeSystem";

import CircadianRhythm from "../components/CircadianRhythm";

import { Scene } from "three";

enum DayState {
    DAY,
    NIGHT,
    SUNSET,
    SUNRISE
};

/**
 * CircadianRhythmSystem heriting from ASystem
 * @system CircadianRhythmSystem
 * @function onInit function automatically called at the initialization of the system
 * @function onUpdate function automatically called at each main loop tour
 * @function onClose function calles when the system is shutted down
 */
export default class CircadianRhythmSystem extends ASystem {
    private _dayState: DayState;
    private _isStar: boolean;
    private _dirLight: THREE.DirectionalLight;

    /**
     * Constuctor of the CircadianRhythmSystem
     * @param name name of the system
     */
    constructor(name: string) {
        super(name)
    }

    onInit() {
        this._dayState = DayState.DAY;
        this._isStar = false;
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
            this._dirLight.shadow.mapSize.width = this._dirLight.shadow.mapSize.height = 1024*2;
            this._dirLight.shadow.camera.left = -30;
            this._dirLight.shadow.camera.right = 30;
            this._dirLight.shadow.camera.top = 30;
            this._dirLight.shadow.camera.bottom = -30;

            this._dirLight.shadow.camera.far = 3500;
            this._dirLight.shadow.bias = -0.000001;
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

            if (minuteTime > 0) {
                switch (this._dayState) {
                    case DayState.DAY:
                        this._dirLight.intensity = 2;
                        if (minuteTime > CircadianRhythmComponent.switchingTime) {
                            CircadianRhythmComponent.time = 0;
                            minuteTime = 0;
                            this._dayState = DayState.SUNSET;
                            this._isStar = false;
                        }
                        break;

                    case DayState.SUNSET:
                        fadeout = (fadeout - (minuteTime * 4));
                        lightFadeout = (lightFadeout - (minuteTime * 2));

                        if (fadeout < 2) {
                            if (!this._isStar)
                                this.printStar(scene)
                        }
                        if (lightFadeout > -0.50)
                            this._dirLight.intensity = lightFadeout;
                        if (fadeout > 0)
                            renderer.setClearColor(0x222233, fadeout);
                        if (lightFadeout < - 0.50 && fadeout < 0) {
                            CircadianRhythmComponent.time = 0;
                            minuteTime = 0;
                            this._dayState = DayState.NIGHT;
                        }
                        break;

                    case DayState.NIGHT:
                        this._dirLight.intensity = -0.50;
                        renderer.setClearColor(0x222233, 0);

                        if (minuteTime > CircadianRhythmComponent.switchingTime) {
                            CircadianRhythmComponent.time = 0;
                            minuteTime = 0;
                            this._dayState = DayState.SUNRISE;
                        }

                    case DayState.SUNRISE:
                        skyfadein = (skyfadein + (minuteTime * 4));
                        lightFadein = (lightFadein + (minuteTime));

                        if (skyfadein > 3){
                            var selectedObject = scene.getObjectByName("star");
                            scene.remove( selectedObject );
                        }
                        if (lightFadein < 2)
                            this._dirLight.intensity = lightFadein;
                        if (skyfadein < 5)
                            renderer.setClearColor(0x222233, skyfadein);
                        if (lightFadein > 1.90 && skyfadein > 4.90) {
                            CircadianRhythmComponent.time = 0;
                            minuteTime = 0;
                            this._dayState = DayState.DAY
                        }
                }
            }
        });
    }

    printStar(scene: Scene) {
        var starGeo = new THREE.Geometry();

        for (let i = 0; i < 1000 + (Math.random() % 10000); i++) {
            let star = new THREE.Vector3(
                Math.random() * 1800,
                200 + (Math.random() % 600),
                Math.random() * 1800
            );
            starGeo.vertices.push(star);
        }

        let sprite = new THREE.TextureLoader().load( '../../assets/textures/star.png' );
        let starMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.7,
            map: sprite
        });

        let stars = new THREE.Points(starGeo,starMaterial);

        stars.name = "star"
        scene.add(stars);
        this._isStar = true;
    }

    onClose() {}

}