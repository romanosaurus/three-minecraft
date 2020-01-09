import * as THREE from "three";
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';

import Voxel from "./components/utils/Voxel";
import LightningUtilities from "./components/lights/LightningUtilities";
import ModelLoader from "./components/models/ModelLoader";
import Object3 from "./components/models/Object3";
import { MOUSE } from "three";

class Window
{
    private readonly camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private windowNeedToResize: boolean;
    private readonly mainScene: THREE.Scene;
    private modelLoader: ModelLoader;

    private steve: Object3;

    constructor()
    {
        this.modelLoader = new ModelLoader();
        this.renderer = new THREE.WebGLRenderer();
        this.windowNeedToResize = false;
        this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
        this.mainScene = new THREE.Scene();

        this.steve =  new Object3("Steve", "./assets/steve/minecraft-steve.obj", "./assets/steve/minecraft-steve.mtl");
        this.steve.getObject().then(object => {
            object.position.x = 50;
            object.position.z = 40;
            object.position.y = 20;
        });
    }

    private onDocumentKeyDown(e)
    {
        // init basic speed x and y
        var xSpeed = 1;
        var ySpeed = 1;
   
        // Update steve and camera position
        this.steve.getObject().then(object => {
            if (e.key == "s")
                object.position.x -= xSpeed;                
            if (e.key == "z")
                object.position.x += xSpeed;
            if (e.key == "q")
                object.position.z -= ySpeed;
            if (e.key == "d")
                object.position.z += ySpeed;
            this.camera.position.set(object.position.x + 1, object.position.y + 8, object.position.z);
        });
    }


    private CameraMovement(eventMouse)
    {
        const euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
        var PI_2 = Math.PI / 2;
        const movementX = eventMouse.movementX || eventMouse.mozMovementX || eventMouse.webkitMovementX || 0;
        const movementY = eventMouse.movementY || eventMouse.mozMovementY || eventMouse.webkitMovementY || 0;

        euler.setFromQuaternion( this.camera.quaternion );

		euler.y -= movementX * 0.005;
		euler.x -= movementY * 0.005;

        euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );
       
        // fix limit for camera vision
        if (euler.x < -1 || euler.x > 1 || euler.y < -3)
            return;
        else if (euler.y < -2.5 || euler.y > - 0.50)
            return;
        else {
            this.camera.quaternion.setFromEuler(euler);
        }
    }

    private InitScene()
    {
        this.mainScene.background = new THREE.Color('lightblue');
    }

    private InitCamera()
    {
        this.steve.getObject().then(object => {
            this.camera.position.set(object.position.x + 1, object.position.y + 8, object.position.z);
            this.camera.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
            const euler = new THREE.Euler(0, 0, 0, 'YXZ');
            euler.x = object.rotation.x;
            euler.y = object.rotation.y - 1.6;
            this.camera.quaternion.setFromEuler(euler);
        });
    }

    private UpdateViewPort()
    {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    private Listeners(): void
    {
        window.addEventListener('resize', () => { this.windowNeedToResize = true });
        window.addEventListener('keydown', (e) => { this.onDocumentKeyDown(e) });
        window.addEventListener("mousemove", (event) => {this.CameraMovement(event)});
    }

    public Update(): void
    {
        requestAnimationFrame(() => { this.Update() });

        if (this.windowNeedToResize) {
            this.windowNeedToResize = false;
            this.UpdateViewPort();
        }

        this.renderer.render(this.mainScene, this.camera);
    }

    public Init(): void
    {
        const chunkSize : number = 32;
        const voxelGenerator : Voxel = new Voxel(chunkSize);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        LightningUtilities.AddLight(this.mainScene, -1,  2,  4);
        LightningUtilities.AddLight(this.mainScene, 1, -1, -2);

        for (let i = 0; i < 4; i++)
            for (let y = 0; y < 4; y++)
                voxelGenerator.displayVoxelWorld(this.mainScene, i * 32, 0, y * 32);

        this.steve.getObject().then(object => {
            this.mainScene.add(object);
        });
    }

    public Main(): void
    {
        this.InitCamera();

        this.Init();

        this.InitScene();

        this.Update();

        this.Listeners();
    }
}

// Debug Version
const Voxels = new Window();
Voxels.Main();
