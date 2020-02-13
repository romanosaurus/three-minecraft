import * as THREE from "three";

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import IEntity from "../ecs/interfaces/IEntity";

import FirstPersonController from "../components/FirstPersonController";
import Box from "../components/Box";
import Camera from "../components/Camera";
import BoxCollider from "../components/BoxCollider";
import PointerLock from "../components/PointerLock";
import Life from "../components/Life";
import FullScreen from "../utils/FullScreen";

import * as Stats from 'stats.js';
import LightUtilities from "../utils/LightUtilities";
import WalkingArea from "../components/WalkingArea";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

class ThreeSystem extends ASystem {
    private readonly scene : THREE.Scene;
    private readonly renderer : THREE.WebGLRenderer;
    private readonly stats : Stats;

    constructor(name : string) {
        super(name);

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.stats = new Stats();
    }

    onInit(): void {
        LightUtilities.AddLight(this.scene, -1,  2,  4);
        LightUtilities.AddLight(this.scene, 1, -1, -2);

        ECSWrapper.entities.create("Player");

        const playerEntity: IEntity = ECSWrapper.entities.getByName("Player")[0];
        playerEntity.assignComponent<FirstPersonController>(
            new FirstPersonController(
                playerEntity,
                new THREE.Vector2(0.005, 0.005),
                new THREE.Vector2(0.005, 0.005)
            )
        );
        playerEntity.assignComponent<Box>(new Box(
            playerEntity,
            new THREE.Vector3(1, 3, 1),
            new THREE.Vector3(128 * 2 + 10, 50, 128 * 2 + 10))
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
        playerEntity.assignComponent<BoxCollider>(new BoxCollider(
            playerEntity,
            playerEntity.getComponent(Box).mesh.position,
            playerEntity.getComponent(Box).getSize(),
            10
        ));
        playerEntity.assignComponent<WalkingArea>(new WalkingArea(playerEntity));
        playerEntity.assignComponent<PointerLock>(new PointerLock(playerEntity, playerEntity.getComponent(Camera).camera));
        playerEntity.getComponent(Camera).camera.position.set(-32 * .3, 32 * .8, -32 * .3);

        playerEntity.assignComponent<Life>(new Life(playerEntity, 9));


        ECSWrapper.entities.applyToEach(["Box"], (entity) => {
            this.scene.add(entity.getComponent(Box).mesh);
        });

        ECSWrapper.entities.applyToEach(["BoxCollider", "FirstPersonController"], (entity) => {
            entity.getComponent(BoxCollider).body.addEventListener("collide", (e) => {
                entity.getComponent(FirstPersonController).jumping = false
            });
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor('lightblue');
        document.body.appendChild(this.renderer.domElement);

        this.stats.showPanel(0);

        document.body.appendChild(this.stats.dom);
    }

    onUpdate(elapsedTime: number): void {
        const keyDown = this.events["keyDown"];

        this.stats.begin();

        this.stats.end();

        if (keyDown)
            FullScreen.keyDown(this.renderer, this.scene);

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

    getScene(): THREE.Scene {
        return this.scene;
    }

    get Renderer(): THREE.WebGLRenderer {
        return this.renderer;
    }
}

export default ThreeSystem;
