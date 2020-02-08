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

class WorldGenerationSystem extends ASystem {
    private generatedArray: Object;
    private perlinGenerator: PerlinGenerator;
    private worldOptions: {cellSize: number, tileTextureWidth: number, tileTextureHeight: number, tileSize: number};

    constructor(name: string) {
        super(name);

        this.generatedArray = {};
        this.worldOptions = { cellSize: 128, tileTextureWidth: 256, tileTextureHeight: 64, tileSize: 16 };
        this.perlinGenerator = new PerlinGenerator(this.worldOptions.cellSize, this.worldOptions.cellSize, THREE.MathUtils.randInt(0, 3000));
    }

    onInit(): void {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        ecsWrapper.entityManager.createEntity("world");
        const worldEntity: IEntity = ecsWrapper.entityManager.getEntity("world");

        worldEntity.assignComponent<Voxel>(
            new Voxel(
                worldEntity,
                this.worldOptions
            )
        );

        ecsWrapper.entityManager.applyToEach(["Voxel"], (entity) => {
            entity.getComponent(Voxel).displayMeshs(ecsWrapper.systemManager.getSystem(ThreeSystem).getScene(), this.perlinGenerator);
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
        const currentZPlayerPosition = Math.floor(playerPosition.z / voxelComponent.CellSize);
        const currentXPlayerPosition = Math.floor(playerPosition.x / voxelComponent.CellSize);
        const meshContainer: MeshContainer = voxelComponent.getMeshContainer();

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
                        const gen = await generation.meshWorker(voxelComponent.CellSize, z, x, this.perlinGenerator);
                        await Thread.terminate(generation);

                        let meshFromWorker: MyMesh = new MyMesh(gen.size, gen.HeightOffset, gen.WidthOffset, this.perlinGenerator, gen.data);
                        voxelComponent.displayVoxelWorld(scene, meshFromWorker);
                    }
                    drawed.push(currentId);

                }
            }
            meshContainer.deleteToSceneUselessDrawing(scene, drawed);
        }
    }
}

export default WorldGenerationSystem;
