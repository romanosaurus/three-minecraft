import * as THREE from "three";
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';

import Voxel from "./components/utils/Voxel";
import LightningUtilities from "./components/lights/LightningUtilities";

class Window
{
    private readonly camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private windowNeedToResize: boolean;
    private readonly mainScene: THREE.Scene;
    private controllers: OrbitControls;

    constructor()
    {
        this.renderer = new THREE.WebGLRenderer();
        this.windowNeedToResize = false;
        this.camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
        this.mainScene = new THREE.Scene();
        this.controllers = new OrbitControls( this.camera, this.renderer.domElement );
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
        const voxelWorld : Voxel = new Voxel(chunkSize);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.controllers.target.set(chunkSize / 2, chunkSize / 3, chunkSize / 2);
        this.controllers.update();

        LightningUtilities.AddLight(this.mainScene, -1,  2,  4);
        LightningUtilities.AddLight(this.mainScene, 1, -1, -2);

        voxelWorld.displayVoxelWorld(this.mainScene);
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
