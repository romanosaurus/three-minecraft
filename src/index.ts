import * as THREE from "three";
import * as CANNON from "cannon";

import { PhysicsSystem } from "./components/utils/PhysicsSystem";
import { Box } from "./components/physics_objects/Box";
import CannonDebugRenderer from "./components/utils/CannonDebugger";

import CameraMovement from "./components/camera/CameraMovement";
import PlayerMovement from "./components/game/PlayerMovement";

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
        this.camera.position.z = 30;

        this.scene.add(this.camera);

        this.physicsSystem.AddPhysicsObject(new Box({
            name: "First box",
            x: 0,
            y: 4,
            z: 8,
            width: 1,
            height: 1,
            depth: 1,
            color: 0xFFFF00,
            rigid: true,
            mass: 20
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
        this.physicsSystem.AddPhysicsObject(new Box({
            name: "Ground",
            x: 0,
            y: 0,
            z: 0,
            width: 20,
            height: .5,
            depth: 20,
            color: 0x00FF00,
            rigid: true,
            mass: 0
        }));

        this.scene.add(this.physicsSystem.GetPhysicsObject(0).mesh);
        this.scene.add(this.physicsSystem.GetPhysicsObject(1).mesh);
        this.scene.add(this.physicsSystem.GetPhysicsObject(2).mesh);
        this.world.addBody(this.physicsSystem.GetPhysicsObject(0).body);
        this.world.addBody(this.physicsSystem.GetPhysicsObject(1).body);
        this.world.addBody(this.physicsSystem.GetPhysicsObject(2).body);

        this.firstPersonUtils = new CameraMovement(this.physicsSystem.GetPhysicsObject(0).mesh, this.camera);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
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