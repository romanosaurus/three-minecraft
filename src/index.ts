import * as THREE from "three";
import * as CANNON from "cannon";

import { PhysicsSystem } from "./components/utils/PhysicsSystem";
import { Box, BoxOptions } from "./components/physics_objects/Box";
import CannonDebugRenderer from "./components/utils/CannonDebugger";

class Window
{
    // ThreeJS utils
    private readonly scene : THREE.Scene = new THREE.Scene();
    private readonly camera : THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    private readonly renderer : THREE.WebGLRenderer = new THREE.WebGLRenderer();

    // Physics
    private readonly world : CANNON.World = new CANNON.World();
    private readonly physicsSystem : PhysicsSystem = new PhysicsSystem();
    private readonly debugger = new CannonDebugRenderer(this.scene, this.world, null);

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
            y: 0,
            z: 8,
            width: 1.5,
            height: 2.5,
            depth: 1,
            color: 0xFFFF00,
            rigid: true,
            mass: 20
        }));
        this.physicsSystem.AddPhysicsObject(new Box({
            name: "Second box",
            x: 2,
            y: 0,
            z: 8,
            width: 1.5,
            height: 2.5,
            depth: 1,
            color: 0xFF0000,
            rigid: true,
            mass: 10
        }));
        this.physicsSystem.AddPhysicsObject(new Box({
            name: "Ground",
            x: 0,
            y: -10,
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

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    private Update() : void {
        requestAnimationFrame(() => { this.Update() });

        this.world.step(1/60);
        this.physicsSystem.Update();
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
