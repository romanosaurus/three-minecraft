import * as THREE from "three";
import * as CANNON from 'cannon';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import IEntity from "../ecs/interfaces/IEntity";

import FirstPersonController from "../components/controllers/FirstPersonController";
import Box from "../components/Box";
import Camera from "../components/Camera";
import BoxCollider from "../components/BoxCollider";
import Transform from "../components/Transform";
import PointerLock from "../components/PointerLock";
import Life from "../components/Life";
import FullScreen from "../utils/FullScreen";

import * as Stats from 'stats.js';
import LightUtilities from "../utils/LightUtilities";
import WalkingArea from "../components/WalkingArea";
import AudioSource from "../components/AudioSource";
import Audio from "../components/Audio";
import Model from "../components/Model";
import Utilities from "../utils/Utilities";
/**
 * ThreeSystem heriting from ASystem
 * @system ThreeSystem
 * @function onInit function automatically called at the initialization of the system
 * @function onUpdate function automatically called at each main loop tour
 * @function onClose function calles when the system is shutted down
 */
class ThreeSystem extends ASystem {
    private readonly scene : THREE.Scene;
    private readonly renderer : THREE.WebGLRenderer;
    private readonly stats : Stats;

    /**
     * Constuctor of the ThreeSystem
     * @param name name of the system
     */
    constructor(name : string) {
        super(name);

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.getContext().getExtension('EXT_color_buffer_half_float');
        this.stats = new Stats();

        this.registerEvent("keyDown", (event: any) => {
            FullScreen.keyDown(this.renderer, this.scene);
        });
    }

    onInit(): void {
        LightUtilities.AddLight(this.scene, -1,  2,  4);
        LightUtilities.AddLight(this.scene, 1, -1, -2);

        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x222233, 5);

        document.body.appendChild(this.renderer.domElement);

        this.initializePlayer();

        ECSWrapper.entities.applyToEach(["Box"], (entity) => {
            this.scene.add(entity.getComponent(Box).mesh);
        });

        this.stats.showPanel(0);
        document.body.appendChild( this.stats.dom );
    }

    onUpdate(elapsedTime: number): void {
        this.stats.begin();

        this.stats.end();

        ECSWrapper.entities.applyToEach(["Transform", "Box"], (entity) => {
            const transform = entity.getComponent(Transform);
            const box = entity.getComponent(Box);

            box.mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
        });

        ECSWrapper.entities.applyToEach(["Transform", "Model"], (entity) => {
            const transform = entity.getComponent(Transform);
            const model = entity.getComponent(Model);

            model.getObject().then(obj => {
                obj.position.set(transform.position.x, transform.position.y, transform.position.z);
                obj.quaternion.set(transform.quaternion.x, transform.quaternion.y, transform.quaternion.z, transform.quaternion.w);
            })
        });

        ECSWrapper.entities.applyToEach(["Transform", "Camera"], (entity) => {
            const camera = entity.getComponent(Camera);
            const transform = entity.getComponent(Transform);

            camera.camera.position.set(
                transform.position.x,
                transform.position.y,
                transform.position.z
            );

            camera.camera.quaternion.set(
                transform.quaternion.x,
                transform.quaternion.y,
                transform.quaternion.z,
                transform.quaternion.w
            );
        });

        requestAnimationFrame(() => {
            ECSWrapper.systems.run();
        });

        this.renderer.render(
            this.scene,
            ECSWrapper.entities.getByName("Player")[0].getComponent(Camera).camera
        );
    }

    onClose(): void {

    }

    private initializePlayer(): void {
        ECSWrapper.entities.create("Player");

        const playerEntity: IEntity = ECSWrapper.entities.getByName("Player")[0];
        playerEntity.assignComponent<Transform>(new Transform(playerEntity));

        playerEntity.getComponent(Transform).position.x = 64 * 2 + 10;
        playerEntity.getComponent(Transform).position.y = 60;
        playerEntity.getComponent(Transform).position.z = 64 * 2 + 10;

        playerEntity.assignComponent<FirstPersonController>(
            new FirstPersonController(
                playerEntity,
                new THREE.Vector2(0.005, 0.005),
                new THREE.Vector2(5, 5)
            )
        );
        playerEntity.assignComponent<Box>(new Box(
            playerEntity,
            new THREE.Vector3(1, 3, 1),
            new THREE.Vector3(64 * 2 + 10, 60, 64 * 2 + 10))
        );
        playerEntity.assignComponent<Camera>(
            new Camera(
                playerEntity,
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            )
        );
        playerEntity.assignComponent<AudioSource>(new AudioSource(playerEntity));
        playerEntity.assignComponent<Audio>(new Audio(playerEntity, {
            listener: playerEntity.getComponent(AudioSource).listener,
            path: "../../assets/audio/music.ogg",
            loop: true,
            volume: 1
        }));
        playerEntity.assignComponent<BoxCollider>(new BoxCollider(
            playerEntity,
            playerEntity.getComponent(Box).mesh.position,
            playerEntity.getComponent(Box).size,
            10
        ));
        playerEntity.assignComponent<WalkingArea>(new WalkingArea(playerEntity, 3));
        playerEntity.assignComponent<PointerLock>(new PointerLock(playerEntity, playerEntity.getComponent(Camera).camera));
        playerEntity.getComponent(Camera).camera.position.set(-32 * .3, 32 * .8, -32 * .3);

        playerEntity.assignComponent<Life>(new Life(playerEntity, 9, playerEntity.getComponent(Box).position, 0.30));
    }

    getScene(): THREE.Scene {
        return this.scene;
    }

    get Renderer(): THREE.WebGLRenderer {
        return this.renderer;
    }
}

export default ThreeSystem;
