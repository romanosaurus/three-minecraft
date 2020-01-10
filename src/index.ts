import * as THREE from "three";
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';

import Voxel from "./components/utils/Voxel";
import LightningUtilities from "./components/lights/LightningUtilities";
import CameraMovement from "./components/camera/CameraMovement";
import PlayerMovement from "./components/game/PlayerMovement";
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
    private CameraMovement: CameraMovement;
    private PlayerMovement: PlayerMovement;

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

        this.CameraMovement = new CameraMovement( this.steve, this.camera );
        this.PlayerMovement = new PlayerMovement( 1, 1 );
    }

    private InitScene()
    {
        this.mainScene.background = new THREE.Color('lightblue');
    }

    private UpdateViewPort()
    {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    private Listeners(): void
    {
        window.addEventListener('resize', () => { this.windowNeedToResize = true });
        this.PlayerMovement.PlayerListener( this.steve, this.camera );
        this.CameraMovement.CameraListeners( this.camera );
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
        this.Init();

        this.InitScene();

        this.Update();

        this.Listeners();
    }
}

// Debug Version
const Voxels = new Window();
Voxels.Main();
