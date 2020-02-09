import * as THREE from 'three';

import { spawn, Thread, Worker } from "threads";

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import IEntity from "../ecs/interfaces/IEntity";
import Voxel from "../components/Voxel";
import ThreeSystem from "./ThreeSystem";
import BoxCollider from '../components/BoxCollider';
import MeshContainer from "../utils/MeshContainer";
import MyMesh from '../utils/Mesh';
import PerlinGenerator from '../utils/PerlinGenerator';
import Faces from "../utils/Faces";

class WorldGenerationSystem extends ASystem {
    private generatedArray: Object;
    private perlinGenerator: PerlinGenerator;
    private worldOptions: {cellSize: number, tileTextureWidth: number, tileTextureHeight: number, tileSize: number};

    // Materials and textures
    private textureLoader: THREE.TextureLoader;
    private texture: THREE.Texture;
    private material: THREE.MeshLambertMaterial;

    constructor(name: string) {
        super(name);

        this.generatedArray = {};
        this.worldOptions = { cellSize: 128, tileTextureWidth: 256, tileTextureHeight: 64, tileSize: 16 };
        this.perlinGenerator = new PerlinGenerator(this.worldOptions.cellSize, this.worldOptions.cellSize, THREE.MathUtils.randInt(0, 3000));
    
        this.textureLoader = new THREE.TextureLoader();
        this.texture = this.textureLoader.load('../../assets/textures/textures.png');
        this.texture.magFilter = THREE.NearestFilter;
        this.texture.minFilter = THREE.NearestFilter;

        this.material = new THREE.MeshLambertMaterial({
            map: this.texture,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
            transparent: true
        });
    }

    onInit(): void {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        const scene: THREE.Scene = ecsWrapper.systemManager.getSystem(ThreeSystem).getScene();

        ecsWrapper.entityManager.create("world");
        const worldEntity: IEntity = ecsWrapper.entityManager.getByName("world")[0];

        worldEntity.assignComponent<Voxel>(
            new Voxel(
                worldEntity,
                this.worldOptions
            )
        );

        ecsWrapper.entityManager.applyToEach(["Voxel"], (entity) => {
            const mesh: MyMesh = new MyMesh(this.worldOptions.cellSize, 2, 2, this.perlinGenerator);

            this.displayWorld(worldEntity.getComponent(Voxel), scene, mesh);
        });
    }

    onUpdate(elapsedTime: number): void {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();
        const scene: THREE.Scene = ecsWrapper.systemManager.getSystem(ThreeSystem).getScene();

        ecsWrapper.entityManager.applyToEach(["BoxCollider"], (entity) => {
            const boxCollider: BoxCollider = entity.getComponent(BoxCollider);

            ecsWrapper.entityManager.applyToEach(["Voxel"], (voxelEntity) => {
                const voxelComponent: Voxel = voxelEntity.getComponent(Voxel);

                this.generateFromPlayerPosition(boxCollider.body.position, voxelComponent, scene);
            });
        });
    }

    onClose(): void {

    }

    public async generateFromPlayerPosition(playerPosition: CANNON.Vec3, voxelComponent: Voxel, scene: THREE.Scene): Promise<void> {
        const currentZPlayerPosition = Math.floor(playerPosition.z / voxelComponent.cellSize);
        const currentXPlayerPosition = Math.floor(playerPosition.x / voxelComponent.cellSize);
        const meshContainer: MeshContainer = voxelComponent.meshContainer;

        if (meshContainer.needToUpdate(currentZPlayerPosition, currentXPlayerPosition, voxelComponent.fov)) {
            let drawed = [];

            for (let z = currentZPlayerPosition - voxelComponent.fov; z <= currentZPlayerPosition + voxelComponent.fov; z += 1) {
                for (let x = currentXPlayerPosition - voxelComponent.fov; x <= currentXPlayerPosition + voxelComponent.fov; x += 1) {
                    const currentId: string = `${x},${z}`;
                    const container: any = meshContainer.getContainerAtPos(currentId);

                    if (container && !container.isDrawed) {
                        scene.add(container.drawedMesh);
                        meshContainer.setDrawedStatus(currentId, true);
                    }

                    if (!container && (this.generatedArray[currentId] === undefined || this.generatedArray[currentId] !== true)) {
                        this.generatedArray[currentId] = true;

                        const generation = await spawn(new Worker('../workers/generation'));
                        const gen = await generation.meshWorker(voxelComponent.cellSize, z, x, this.perlinGenerator);
                        await Thread.terminate(generation);

                        let meshFromWorker: MyMesh = new MyMesh(gen.size, gen.HeightOffset, gen.WidthOffset, this.perlinGenerator, gen.data);
                        this.displayWorld(voxelComponent, scene, meshFromWorker);
                    }
                    drawed.push(currentId);

                }
            }
            meshContainer.deleteToSceneUselessDrawing(scene, drawed);
        }
    }

    public async displayWorld(voxelComponent: Voxel, scene: THREE.Scene, mesh: MyMesh) {
        const perlinArray: any = mesh.getMeshData();
        const counterOffset: number = 4;

        if (!perlinArray)
            return;

        let counter: number = 0;
        const startX: number = mesh.getWidthOffset() * this.worldOptions.cellSize;
        const startZ: number = mesh.getHeightOffset() * this.worldOptions.cellSize;

        for (let z = 0; z < mesh.getMeshSize(); z += 1) {
            for (let x = 0; x < mesh.getMeshSize(); x += 1) {
                for (let height = perlinArray[counter] * (64 / 255); height >= 0; height--) {
                    voxelComponent.setVoxel(startX + x, height, startZ + z, 14, mesh);
                }
                counter += counterOffset;
            }
        }

        const generation = await spawn(new Worker('../workers/generation'));
        const serializedMeshArray = voxelComponent.meshContainer.serialize();
        const {positions, normals, uvs, indices} = await generation.generateGeometryDataForCell(mesh.getWidthOffset(), 0, mesh.getHeightOffset(), mesh.size, mesh.data, {
            cellSize: this.worldOptions.cellSize,
            tileSize: this.worldOptions.tileSize,
            tileTextureWidth: this.worldOptions.tileTextureWidth,
            tileTextureHeight: this.worldOptions.tileTextureHeight,
            meshArray: serializedMeshArray,
            cellSliceSize: this.worldOptions.cellSize * this.worldOptions.cellSize,
            faces: Faces
        });
        await Thread.terminate(generation);

        const geometry : THREE.BufferGeometry = new THREE.BufferGeometry();

        const numComponent: {position: number, normal: number, uv: number} = {
            position: 3,
            normal: 3,
            uv: 2
        }

        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), numComponent.position)
        );
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(new Float32Array(normals), numComponent.normal)
        );
        geometry.setAttribute(
            'uv',
            new THREE.BufferAttribute(new Float32Array(uvs), numComponent.uv));
        geometry.setIndex(indices);

        const drawMesh = new THREE.Mesh(geometry, this.material);
        drawMesh.position.set(mesh.getWidthOffset() * this.worldOptions.cellSize, 0, mesh.getHeightOffset() * this.worldOptions.cellSize);
        scene.add(drawMesh);
        voxelComponent.meshContainer.addMeshToSceneId(mesh.getWidthOffset() + ',' + mesh.getHeightOffset(), drawMesh);
    }
}

export default WorldGenerationSystem;
