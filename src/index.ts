import * as THREE from "three";
import * as CANNON from "cannon";

import { PhysicsSystem } from "./components/utils/PhysicsSystem";
import { Box } from "./components/physics_objects/Box";
import CannonDebugRenderer from "./components/utils/CannonDebugger";

import CameraMovement from "./components/camera/CameraMovement";
import PlayerMovement from "./components/game/PlayerMovement";
import Voxel from "./components/utils/Voxel";
import LightningUtilities from "./components/lights/LightningUtilities";

class Window
{
    // ThreeJS utils
    private readonly scene : THREE.Scene;
    private readonly camera : THREE.PerspectiveCamera;
    private readonly renderer : THREE.WebGLRenderer;

    // Physics
    private readonly world : CANNON.World;
    private readonly physicsSystem : PhysicsSystem;
    private readonly debugger;

    // First person camera
    private firstPersonUtils : CameraMovement;
    private playerMovement : PlayerMovement;

    // Time handling
    private clock : THREE.Clock;
    private deltaTime : number;
    private voxelGenerator : Voxel = new Voxel({cellSize: 128, tileTextureWidth: 256, tileTextureHeight: 64, tileSize: 16});

    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer();
        this.world = new CANNON.World();
        this.physicsSystem = new PhysicsSystem();
        this.debugger = new CannonDebugRenderer(this.scene, this.world, null);
        this.playerMovement = new PlayerMovement();
        this.clock = new THREE.Clock();
        this.deltaTime = 0;
    }

    private InitCannon() : void {
        this.world.gravity.set(0, -9.82, 0); // m/s²
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 5;
        this.world.defaultContactMaterial.contactEquationStiffness = 1e6;
        this.world.defaultContactMaterial.contactEquationRelaxation = 10;
    }

    private InitThree() : void {
        this.camera.position.set(-32 * .3, 32 * .8, -32 * .3)

        this.scene.add(this.camera);

        this.physicsSystem.AddPhysicsObject(new Box({
            name: "First box",
            x: 10.5,
            y: 13,
            z: 10.5,
            width: 1,
            height: 2,
            depth: 1,
            color: 0xFFFF00,
            rigid: true,
            mass: 100
        }));
        this.physicsSystem.AddPhysicsObject(new Box({
            name: "Second box",
            x: 3,
            y: 0,
            z: 8,
            width: 1.5,
            height: 2.5,
            depth: 1,
            color: 0xFFFF00,
            rigid: true,
            mass: 0
        }));

        this.scene.add(this.physicsSystem.GetPhysicsObject(0).mesh);
        this.scene.add(this.physicsSystem.GetPhysicsObject(1).mesh);
        this.world.addBody(this.physicsSystem.GetPhysicsObject(0).body);
        this.world.addBody(this.physicsSystem.GetPhysicsObject(1).body);

        LightningUtilities.AddLight(this.scene, -1,  2,  4);
        LightningUtilities.AddLight(this.scene, 1, -1, -2);

        this.voxelGenerator.displayVoxelWorld(this.scene, this.world);

        this.firstPersonUtils = new CameraMovement(this.physicsSystem.GetPhysicsObject(0).mesh, this.camera);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor('lightblue');
        document.body.appendChild(this.renderer.domElement);

        this.playerMovement.Listeners();
        this.firstPersonUtils.CameraListeners(this.camera);
        this.physicsSystem.GetPhysicsObject(0).body.addEventListener("collide", (e) => {this.playerMovement.setJumping(false)})
    }

    private Update() : void {
        requestAnimationFrame(() => { this.Update() });

        this.world.step(1/60);
        this.deltaTime = this.clock.getDelta();
        this.physicsSystem.Update();

        this.playerMovement.Rotation(this.physicsSystem.GetPhysicsObject(0).mesh, this.camera);
        this.playerMovement.Movement(this.physicsSystem.GetPhysicsObject(0).body, this.camera, this.deltaTime);
        this.firstPersonUtils.Update(this.camera, this.physicsSystem.GetPhysicsObject(0).mesh);
        this.voxelGenerator.Update(this.physicsSystem.GetPhysicsObject(0).body, this.world);
        //this.debugger.update();

        this.Render();
    }

    private Render() : void {
        this.renderer.render(this.scene, this.camera);
    }

    public Main() : void {
        this.InitThree();
        this.InitCannon();
        this.Update();

    }
}

// Debug Version
const Voxels = new Window();
Voxels.Main();
