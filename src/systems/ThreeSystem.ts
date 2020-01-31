import * as THREE from "three";

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import IEntity from "../ecs/interfaces/IEntity";

import FirstPersonController from "../components/FirstPersonController";
import Box from "../components/Box";
import Camera from "../components/Camera";
import BoxCollider from "../components/BoxCollider";
import PointerLock from "../components/PointerLock";

import Voxel from "../components/Voxel";

import Stats = require('stats.js');
import LightUtilities from "../utils/LightUtilities";

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
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        LightUtilities.AddLight(this.scene, -1,  2,  4);
        LightUtilities.AddLight(this.scene, 1, -1, -2);

        ecsWrapper.entityManager.createEntity("Player");

        const playerEntity: IEntity = ecsWrapper.entityManager.getEntity("Player");
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
        playerEntity.assignComponent<PointerLock>(new PointerLock(playerEntity, playerEntity.getComponent(Camera).camera));
        playerEntity.getComponent(Camera).camera.position.set(-32 * .3, 32 * .8, -32 * .3);


        ecsWrapper.entityManager.applyToEach(["Box"], (entity) => {
            this.scene.add(entity.getComponent(Box).mesh);
        });

        ecsWrapper.entityManager.applyToEach(["BoxCollider", "FirstPersonController"], (entity) => {
            entity.getComponent(BoxCollider).body.addEventListener("collide", (e) => {entity.getComponent(FirstPersonController).jumping = false});
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor('lightblue');
        document.body.appendChild(this.renderer.domElement);

        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    onUpdate(elapsedTime: number): void {
        this.stats.begin();

        this.stats.end();

        requestAnimationFrame(() => {
            const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();
            ecsWrapper.systemManager.run();
        });

        this.renderer.render(
            this.scene,
            ECSWrapper.getInstance().entityManager.getEntity("Player").getComponent(Camera).camera
        );
    }

    onClose(): void {

    }

    getScene(): THREE.Scene {
        return this.scene;
    }
}

export default ThreeSystem;
