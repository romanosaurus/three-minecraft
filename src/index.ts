import * as THREE from "three";
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';

import Voxel from "./components/utils/Voxel";
import LightningUtilities from "./components/lights/LightningUtilities";
import ModelLoader from "./components/models/ModelLoader";
import Object3 from "./components/models/Object3";

class Window
{
    private readonly camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private windowNeedToResize: boolean;
    private readonly mainScene: THREE.Scene;
    private controllers: OrbitControls;
    private modelLoader: ModelLoader;

    private steve: Object3;

    constructor()
    {
        this.modelLoader = new ModelLoader();
        this.renderer = new THREE.WebGLRenderer();
        this.windowNeedToResize = false;
        this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
        this.mainScene = new THREE.Scene();
        this.controllers = new OrbitControls( this.camera, this.renderer.domElement );

        this.steve = new Object3("Steve", "./assets/steve/minecraft-steve.obj", "./assets/steve/minecraft-steve.mtl");
    }

    private onDocumentKeyDown(e)
    {
        this.steve.getObject().then(object => {
            switch(e.key) {
                case "s":
                    console.log('lel')
                    object.position.x -= 10;
                    break;
                case "z":
                    object.position.x += 10;
                    break;
                case "q":
                    object.position.z += 10;
                    break;
                case "d":
                    object.position.z -= 10;
                    break;
            }
            object.position.x += 10;
        });

        console.log(e);
    }

    private InitScene()
    {
        this.mainScene.background = new THREE.Color('lightblue');
    }

    private InitCamera()
    {
        this.camera.position.set(-32 * .3, 32 * .8, -32 * .3);
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
    }

    public Update(): void
    {
        requestAnimationFrame(() => { this.Update() });

        if (this.windowNeedToResize) {
            this.windowNeedToResize = false;
            this.UpdateViewPort();
        }

        this.controllers.update();
        this.renderer.render(this.mainScene, this.camera);
    }

    public Init(): void
    {
        const chunkSize : number = 32;
        const voxelGenerator : Voxel = new Voxel(chunkSize);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controllers.target.set(chunkSize / 2, chunkSize / 3, chunkSize / 2);
        this.controllers.update();

        LightningUtilities.AddLight(this.mainScene, -1,  2,  4);
        LightningUtilities.AddLight(this.mainScene, 1, -1, -2);
        voxelGenerator.displayVoxelWorld(this.mainScene, 32, 0, 32);

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
