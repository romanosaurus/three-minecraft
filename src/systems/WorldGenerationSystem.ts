import * as THREE from 'three';

import { spawn, Thread, Worker } from "threads";

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import IEntity from "../ecs/interfaces/IEntity";
import Voxel from "../components/Voxel";
import CircadianRhythm from "../components/CircadianRhythm";
import ThreeSystem from "./ThreeSystem";
import MeshContainer from "../utils/MeshContainer";
import Chunk from '../utils/Chunk';
import PerlinGenerator from '../utils/PerlinGenerator';
import Faces from "../utils/Faces";
import Rigidbody from '../components/physics/Rigidbody';
import Vector3D from '../maths/Vector3D';

/**
 * @interface WorldOptions
 * containing voxel world options
 */
interface WorldOptions {
    cellSize: number,
    tileTextureWidth: number,
    tileTextureHeight: number,
    tileSize: number
};

/**
 * WorldGenerationSystem heriting from ASystem
 * @system WorldGenerationSystem
 * @function onInit function automatically called at the initialization of the system
 * @function onUpdate function automatically called at each main loop tour
 * @function onClose function calles when the system is shutted down
 */
class WorldGenerationSystem extends ASystem {
    private generatedArray: Object;
    private perlinGenerator: PerlinGenerator;
    private worldOptions: WorldOptions;

    // Materials and textures
    private textureLoader: THREE.TextureLoader;
    private texture: THREE.Texture;
    private material: THREE.MeshLambertMaterial;

    /**
     * Constuctor of the WorldGenerationSystem
     * @param name name of the system
     */
    constructor(name: string) {
        super(name);

        this.generatedArray = {};
        this.worldOptions = { cellSize: 64, tileTextureWidth: 272, tileTextureHeight: 64, tileSize: 16 };
        this.perlinGenerator = new PerlinGenerator(this.worldOptions.cellSize, this.worldOptions.cellSize, THREE.MathUtils.randInt(0, 3000));

        this.textureLoader = new THREE.TextureLoader();
        this.texture = this.textureLoader.load('../../assets/textures/textures.png');
        this.texture.magFilter = THREE.NearestFilter;
        this.texture.minFilter = THREE.NearestFilter;

        this.material = new THREE.MeshLambertMaterial({
            map: this.texture,
            side: THREE.DoubleSide,
            alphaTest: 0.1,
            transparent: false
        });
    }

    onInit(): void {
        const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();

        ECSWrapper.entities.create("world");
        const worldEntity: IEntity = ECSWrapper.entities.getByName("world")[0];

        worldEntity.assignComponent<Voxel>(
            new Voxel(
                worldEntity,
                this.worldOptions
            )
        );

        ECSWrapper.entities.applyToEach(["Voxel"], (entity) => {
        worldEntity.assignComponent<CircadianRhythm>(new CircadianRhythm(worldEntity, 5));
            const mesh: Chunk = new Chunk(this.worldOptions.cellSize, 2, 2, this.perlinGenerator);

            this.displayWorld(worldEntity.getComponent(Voxel), scene, mesh);
        });
    }

    onUpdate(elapsedTime: number): void {
        const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();

        ECSWrapper.entities.applyToEach(["FirstPersonController", "Rigidbody"], (entity) => {
            const boxCollider: Rigidbody = entity.getComponent(Rigidbody);

            ECSWrapper.entities.applyToEach(["Voxel"], (voxelEntity) => {
                const voxelComponent: Voxel = voxelEntity.getComponent(Voxel);

                this.generateFromPlayerPosition(boxCollider.position, voxelComponent, scene);
            });
        });
    }

    onClose(): void {

    }

    public async generateFromPlayerPosition(playerPosition: Vector3D, voxelComponent: Voxel, scene: THREE.Scene): Promise<void> {
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

                        let meshFromWorker: Chunk = new Chunk(gen.size, gen.HeightOffset, gen.WidthOffset, this.perlinGenerator, gen.data);
                        this.displayWorld(voxelComponent, scene, meshFromWorker);

                        ECSWrapper.systems.dispatch("newChunk", new CustomEvent("newChunk", { detail: meshFromWorker }));
                    }
                    drawed.push(currentId);

                }
            }
            meshContainer.deleteToSceneUselessDrawing(scene, drawed);
        }
    }

    private createTree(thickness : number, voxelComponent: Voxel, chunk: Chunk, startX: number, startZ: number, startY: number) {
        let size : number = thickness * THREE.MathUtils.randInt(4, 6);

        const offsetX: number = 0;
        const offsetZ: number = 0;

        //remplissage dessous tronc
        for (let y = 0; y < thickness; y++) {
            for (let x = 0; x < thickness; x++) {
                if (voxelComponent.getVoxel(startX + x + offsetX, startZ - 1, y + startY + offsetZ, chunk) === 0) {
                    voxelComponent.setVoxel(startX + x + offsetX, startZ - 1, y + startY + offsetZ, 14, chunk);
                }
            }
        }
        //tronc
        for (let y = 0; y < thickness; y++) {
            for (let z = 0; z < size; z++) {
                for (let x = 0; x < thickness; x++) {
                    voxelComponent.setVoxel(startX + x + offsetX, startZ + z, y + startY + offsetZ, 10, chunk);
                }
            }
        }
        //feuillage
        let leafColor = THREE.MathUtils.randInt(0, 1) === 0 ? 12 : 17;
        for (let y = 0; y < (thickness + 4 * thickness); y++) {
            for (let z = 0; z < thickness; z++) {
                for (let x = 0; x < (thickness + 4 * thickness); x++) {
                    voxelComponent.setVoxel((x + startX) - (thickness * 2) + offsetX, z + startZ + size, (y + startY) - (thickness * 2) + offsetZ, leafColor, chunk);
                }
            }
        }
        for (let y = 0; y < (thickness + 2 * thickness); y++) {
            for (let z = 0; z < thickness; z++) {
                for (let x = 0; x < (thickness + 2 * thickness); x++) {
                    voxelComponent.setVoxel((x + startX) - thickness + offsetX, z + startZ + size + thickness, (y + startY) + offsetZ - thickness, leafColor, chunk);
                }
            }
        }
        //procedural generation
        let randomBranchIteration = THREE.MathUtils.randInt(10 * thickness, 20 * thickness);
        for (let i = 0; i < randomBranchIteration; i++) {
            let basicPosY = startX - (thickness * 2) + offsetX;
            let basicPosX = startY + offsetZ - thickness * 2;
            let randomPosY = THREE.MathUtils.randInt(basicPosY, basicPosY + (thickness + 2 * thickness) - 1);
            let randomPosX = THREE.MathUtils.randInt(basicPosX, basicPosX + (thickness + 2 * thickness) - 1);

            let randomIterations = THREE.MathUtils.randInt(1 * thickness, 8 * thickness);
            let Zpos = startZ + size;
            for (let j = 0; j < randomIterations; j++) {
                voxelComponent.setVoxel(randomPosY, Zpos, randomPosX, leafColor, chunk);
                if (THREE.MathUtils.randInt(0, 1) === 0) {
                    for (let k = 0; k < thickness; k++)
                        voxelComponent.setVoxel(randomPosY + THREE.MathUtils.randInt(-1, 1), Zpos + THREE.MathUtils.randInt(-1, 1), randomPosX + THREE.MathUtils.randInt(-1, 1), leafColor, chunk);
                }
                basicPosY += THREE.MathUtils.randInt(0, 1) === 1 ? 1 : -1;
                basicPosX += THREE.MathUtils.randInt(0, 1) === 1 ? 1 : -1;
                Zpos += THREE.MathUtils.randInt(-1, 1);
            }
        }
    }
    public async displayWorld(voxelComponent: Voxel, scene: THREE.Scene, chunk: Chunk) {
        const perlinArray: any = chunk.getMeshData();
        const counterOffset: number = 4;

        if (!perlinArray)
            return;

        let counter: number = 0;
        const startX: number = chunk.getWidthOffset() * this.worldOptions.cellSize;
        const startZ: number = chunk.getHeightOffset() * this.worldOptions.cellSize;

        let randomPosX = THREE.MathUtils.randInt(10, chunk.size - 10);
        let randomPosY = THREE.MathUtils.randInt(10, chunk.size - 10);;
        for (let z = 0; z < chunk.size; z += 1) {
            for (let x = 0; x < chunk.size; x += 1) {
                let firstIteration = 0;
                for (let height = perlinArray[counter] * (this.worldOptions.cellSize / 255); height >= 0; height--) {
                    voxelComponent.setVoxel(startX + x, height, startZ + z, 14, chunk);
                    //random number of tree + random position + check if not too close
                    if (x === randomPosX && z === randomPosY && firstIteration === 0) {
                        firstIteration = 1;
                        this.createTree(THREE.MathUtils.randInt(1, 2), voxelComponent, chunk, startX + x, height + 1, startZ + z);
                    }
                }
                counter += counterOffset;
            }
        }

        const generation = await spawn(new Worker('../workers/generation'));
        const serializedMeshArray = voxelComponent.meshContainer.serialize();
        const {positions, normals, uvs, indices} = await generation.generateGeometryDataForCell(chunk.getWidthOffset(), 0, chunk.getHeightOffset(), chunk.size, chunk.data, {
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
        geometry.computeBoundingSphere();

        const drawMesh = new THREE.Mesh(geometry, this.material);
        drawMesh.castShadow = true;
        drawMesh.receiveShadow = true;
        drawMesh.position.set(chunk.getWidthOffset() * this.worldOptions.cellSize, 0, chunk.getHeightOffset() * this.worldOptions.cellSize);
        drawMesh.castShadow = true;
        drawMesh.receiveShadow = true;
        scene.add(drawMesh);
        voxelComponent.meshContainer.addMeshToSceneId(chunk.getWidthOffset() + ',' + chunk.getHeightOffset(), drawMesh, geometry);
    }

    private async updateChunkGeometry(x: number, y: number, z: number, voxelComponent: Voxel,chunk: Chunk) {

        const cellX: number = Math.floor(x / this.worldOptions.cellSize);
        const cellY: number = Math.floor(y / this.worldOptions.cellSize);
        const cellZ: number = Math.floor(z / this.worldOptions.cellSize);

        const geometry: THREE.BufferGeometry = voxelComponent.meshContainer.getContainerAtPos(`${cellX},${cellZ}`).geometry;

        const generation = await spawn(new Worker('../workers/generation'));
        const serializedMeshArray = voxelComponent.meshContainer.serialize();
        const {positions, normals, uvs, indices} = await generation.generateGeometryDataForCell(chunk.getWidthOffset(), 0, chunk.getHeightOffset(), chunk.size, chunk.data, {
            cellSize: this.worldOptions.cellSize,
            tileSize: this.worldOptions.tileSize,
            tileTextureWidth: this.worldOptions.tileTextureWidth,
            tileTextureHeight: this.worldOptions.tileTextureHeight,
            meshArray: serializedMeshArray,
            cellSliceSize: this.worldOptions.cellSize * this.worldOptions.cellSize,
            faces: Faces
        });
        await Thread.terminate(generation);

        const positionNumComponents = 3;
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
        const normalNumComponents = 3;
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
        const uvNumComponents = 2;
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
        geometry.setIndex(indices);
        geometry.computeBoundingSphere();
    }

    public async updateVoxelGeometry(x: number, y: number, z: number, chunk: Chunk, voxelComponent) {
        const updatedCellIds = {};

        const neighborOffsets = [
            [ 0,  0,  0], // self
            [-1,  0,  0], // left
            [ 1,  0,  0], // right
            [ 0, -1,  0], // down
            [ 0,  1,  0], // up
            [ 0,  0, -1], // back
            [ 0,  0,  1], // front
        ];
        for (const offset of neighborOffsets) {
            const ox = x + offset[0];
            const oy = y + offset[1];
            const oz = z + offset[2];
            const cellId = `${chunk.getWidthOffset()},${chunk.getHeightOffset()}`;
            if (!updatedCellIds[cellId]) {
                updatedCellIds[cellId] = true;
                this.updateChunkGeometry(ox, oy, oz, voxelComponent, chunk);
            }
        }
    }
}

export default WorldGenerationSystem;
