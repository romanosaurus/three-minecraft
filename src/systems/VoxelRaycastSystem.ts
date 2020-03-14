import * as THREE from 'three';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";

import Voxel from "../components/Voxel";
import Camera from '../components/Camera';
import ThreeSystem from './ThreeSystem';
import IEntity from '../ecs/interfaces/IEntity';
import Chunk from '../utils/Chunk';
import WorldGenerationSystem from './WorldGenerationSystem';
import Audio, { AudioState } from '../components/audio/Audio';
import AudioSource from '../components/audio/AudioSource';

/**
 * @interface Intersection
 * used to check intersections
 */
interface Intersection {
    position: [number, number, number],
    normal: [number, number, number],
    voxel: number
};

/**
 * VoxelRaycastSystem heriting from ASystem
 * @system VoxelRaycastSystem
 * @function onInit function automatically called at the initialization of the system
 * @function onUpdate function automatically called at each main loop tour
 * @function onClose function calles when the system is shutted down
 */
export default class VoxelRaycastSystem extends ASystem {
    private size: THREE.Vector2;
    private far: number;
    private voxelId: number;

    /**
     * Constuctor of the VoxelRaycastSystem
     * @param name name of the system
     */
    constructor(name: string) {
        super(name);

        this.size = new THREE.Vector2;
        const threeSystem = ECSWrapper.systems.get(ThreeSystem);
        threeSystem.Renderer.getSize(this.size);

        this.far = 5;
        this.voxelId = 0;

        this.registerEvent("click", (event) => {
            this.launchRaycast();
        })

        this.registerEvent("keyDown", (event: any) => {
            if (event.key === "p") {
                if (this.voxelId === 16)
                    this.voxelId = 0;
                else
                    this.voxelId++;
            }
        })
    }

    onInit(): void {
        ECSWrapper.entities.create("breakSound");
        const breakBlockEntity = ECSWrapper.entities.getByName("breakSound")[0];
        breakBlockEntity.assignComponent<AudioSource>(new AudioSource(breakBlockEntity));
        ECSWrapper.entities.getByName('Player')[0].getComponent(Camera).camera.add(breakBlockEntity.getComponent(AudioSource).listener);
        breakBlockEntity.assignComponent<Audio>(new Audio(breakBlockEntity, {
            listener: breakBlockEntity.getComponent(AudioSource).listener,
            path: "../../assets/sound/minecraft-grass-sound-effect.ogg",
            loop: false,
            volume: 1
        }));
        breakBlockEntity.getComponent(Audio).state = AudioState.SOUND;
    }

    onUpdate(elapsedTime: number): void {}

    onClose(): void {}

    private intersectRay(start: THREE.Vector3, end: THREE.Vector3, voxelComponent: Voxel): Intersection | null {
        let delta: THREE.Vector3 = new THREE.Vector3(
            end.x - start.x,
            end.y - start.y,
            end.z - start.z
        );
        const lenSq: number = delta.x * delta.x + delta.y * delta.y + delta.z * delta.z;
        const len: number = Math.sqrt(lenSq);
        delta.x /= len;
        delta.y /= len;
        delta.z /= len;

        let t: number = 0.0;
        let i: THREE.Vector3 = new THREE.Vector3(
            Math.floor(start.x),
            Math.floor(start.y),
            Math.floor(start.z)
        );

        const step: THREE.Vector3 = new THREE.Vector3(
            (delta.x > 0) ? 1 : -1,
            (delta.y > 0) ? 1 : -1,
            (delta.z > 0) ? 1 : -1
        );

        const tDelta: THREE.Vector3 = new THREE.Vector3(
            Math.abs(1 / delta.x),
            Math.abs(1 / delta.y),
            Math.abs(1 / delta.z),
        );

        const dist: THREE.Vector3 = new THREE.Vector3(
            (step.x > 0) ? (i.x + 1 - start.x) : (start.x - i.x),
            (step.y > 0) ? (i.y + 1 - start.y) : (start.y - i.y),
            (step.z > 0) ? (i.z + 1 - start.z) : (start.z - i.z)
        );

        // location of nearest voxel boundary, in units of t
        let tMax: THREE.Vector3 = new THREE.Vector3(
            (tDelta.x < Infinity) ? tDelta.x * dist.x : Infinity,
            (tDelta.y < Infinity) ? tDelta.y * dist.y : Infinity,
            (tDelta.z < Infinity) ? tDelta.z * dist.z : Infinity
        );

        let steppedIndex: number = -1;

        // main loop along raycast vector
        while (t <= this.far) {
            const voxel: number = voxelComponent.getVoxel(i.x, i.y, i.z, voxelComponent.getMeshByPosition(i.x, i.z));
            if (voxel) {
                return {
                    position: [
                        start.x + t * delta.x,
                        start.y + t * delta.y,
                        start.z + t * delta.z,
                    ],
                    normal: [
                        steppedIndex === 0 ? -step.x : 0,
                        steppedIndex === 1 ? -step.y : 0,
                        steppedIndex === 2 ? -step.z : 0,
                    ],
                    voxel,
                };
            }

            // advance t to next nearest voxel boundary
            if (tMax.x < tMax.y) {
                if (tMax.x < tMax.z) {
                    i.x += step.x;
                    t = tMax.x;
                    tMax.x += tDelta.x;
                    steppedIndex = 0;
                } else {
                    i.z += step.z;
                    t = tMax.z;
                    tMax.z += tDelta.z;
                    steppedIndex = 2;
                }
            } else {
                if (tMax.y < tMax.z) {
                    i.y += step.y;
                    t = tMax.y;
                    tMax.y += tDelta.y;
                    steppedIndex = 1;
                } else {
                    i.z += step.z;
                    t = tMax.z;
                    tMax.z += tDelta.z;
                    steppedIndex = 2;
                }
            }
        }
        return null;
    }

    private launchRaycast() {
        const playerEntity: IEntity = ECSWrapper.entities.getByName("Player")[0];
        const x: number = ((this.size.x / 2) / this.size.x) * 2 - 1;
        const y: number = ((this.size.y / 2) / this.size.y) * -2 + 1;
        const start: THREE.Vector3 = new THREE.Vector3();
        const end: THREE.Vector3 = new THREE.Vector3();
        start.setFromMatrixPosition(playerEntity.getComponent(Camera).camera.matrixWorld);
        end.set(x, y, 1).unproject(playerEntity.getComponent(Camera).camera);
        const worldEntity: IEntity = ECSWrapper.entities.getByName("world")[0];
        const voxelComponent: Voxel = worldEntity.getComponent(Voxel);
        const intersection: Intersection | null = this.intersectRay(start, end, voxelComponent);
        if (intersection) {
            const sound = ECSWrapper.entities.getByName("breakSound")[0].getComponent(Audio);
            sound.sound.play();
            const pos = intersection.position.map((v, ndx) => {
                return v + intersection.normal[ndx] * (this.voxelId > 0 ? 0.5 : -0.5)
            });
            const currentChunk: Chunk = voxelComponent.getMeshByPosition(pos[0], pos[2], true);
            voxelComponent.setVoxel(pos[0], pos[1], pos[2], this.voxelId, currentChunk);
            ECSWrapper.systems.get(WorldGenerationSystem).updateVoxelGeometry(pos[0], pos[1], pos[2], currentChunk, voxelComponent);
        }
    }
}
