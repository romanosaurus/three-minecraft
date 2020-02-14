import * as THREE from 'three';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";

import Voxel from "../components/Voxel";
import Raycast from "../components/Raycast";
import PointerLock from "../components/PointerLock";
import Camera from '../components/Camera';
import ThreeSystem from './ThreeSystem';
import IEntity from '../ecs/interfaces/IEntity';
import Chunk from '../utils/Chunk';
import WorldGenerationSystem from './WorldGenerationSystem';

export default class VoxelRaycastSystem extends ASystem {
    private raycaster: THREE.Raycaster;
    private size: THREE.Vector2;
    private currentTime: number;

    constructor(name: string) {
        super(name);

        this.raycaster = new THREE.Raycaster;

        this.size = new THREE.Vector2;
        const threeSystem = ECSWrapper.systems.get(ThreeSystem);
        threeSystem.Renderer.getSize(this.size);
        this.currentTime = 0;
    }
    onInit(): void {
        this.raycaster.near = 1;
        this.raycaster.far = 5;
    }

    onUpdate(elapsedTime: number): void {
        const elapsedTimeAsSeconds: number = elapsedTime / 1000;

        if (this.events["click"] && this.currentTime > 1) {
            let voxelId = 1;

            if (this.events["keyDown"])
                if (this.events["click"] && this.events["keyDown"].key === "Shift")
                    voxelId = 0;
            const playerEntity: IEntity = ECSWrapper.entities.getByName("Player")[0];
            const x: number = ((this.size.x / 2) / this.size.x) * 2 - 1;
            const y: number = ((this.size.y / 2) / this.size.y) * -2 + 1;

            const start: THREE.Vector3 = new THREE.Vector3();
            const end: THREE.Vector3 = new THREE.Vector3();

            start.setFromMatrixPosition(playerEntity.getComponent(Camera).camera.matrixWorld);
            end.set(x, y, 1).unproject(playerEntity.getComponent(Camera).camera);

            const worldEntity = ECSWrapper.entities.getByName("world")[0];
            const voxelComponent = worldEntity.getComponent(Voxel);
            const intersection = this.intersectRay(start, end, voxelComponent);

            if (intersection) {
                const pos = intersection.position.map((v, ndx) => {
                    return v + intersection.normal[ndx] * (voxelId > 0 ? 0.5 : -0.5)
                });

                const currentChunk: Chunk = voxelComponent.getMeshByPosition(pos[0], pos[2], true);
                voxelComponent.setVoxel(pos[0], pos[1], pos[2], voxelId, currentChunk);
                ECSWrapper.systems.get(WorldGenerationSystem).updateVoxelGeometry(pos[0], pos[1], pos[2], currentChunk, voxelComponent);
            }
            this.currentTime = 0;
        }
        this.currentTime += elapsedTimeAsSeconds
    }

    onClose(): void {

    }

    private intersectRay(start: THREE.Vector3, end: THREE.Vector3, voxelComponent: Voxel): any {
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let dz = end.z - start.z;
        const lenSq = dx * dx + dy * dy + dz * dz;
        const len = Math.sqrt(lenSq);

        dx /= len;
        dy /= len;
        dz /= len;

        let t = 0.0;
        let ix = Math.floor(start.x);
        let iy = Math.floor(start.y);
        let iz = Math.floor(start.z);

        const stepX = (dx > 0) ? 1 : -1;
        const stepY = (dy > 0) ? 1 : -1;
        const stepZ = (dz > 0) ? 1 : -1;

        const txDelta = Math.abs(1 / dx);
        const tyDelta = Math.abs(1 / dy);
        const tzDelta = Math.abs(1 / dz);

        const xDist = (stepX > 0) ? (ix + 1 - start.x) : (start.x - ix);
        const yDist = (stepY > 0) ? (iy + 1 - start.y) : (start.y - iy);
        const zDist = (stepZ > 0) ? (iz + 1 - start.z) : (start.z - iz);

        // location of nearest voxel boundary, in units of t
        let txMax = (txDelta < Infinity) ? txDelta * xDist : Infinity;
        let tyMax = (tyDelta < Infinity) ? tyDelta * yDist : Infinity;
        let tzMax = (tzDelta < Infinity) ? tzDelta * zDist : Infinity;

        let steppedIndex = -1;

    // main loop along raycast vector
        while (t <= len) {
            const voxel = voxelComponent.getVoxel(ix, iy, iz, voxelComponent.getMeshByPosition(ix, iz));
            if (voxel) {
                return {
                    position: [
                        start.x + t * dx,
                        start.y + t * dy,
                        start.z + t * dz,
                    ],
                    normal: [
                        steppedIndex === 0 ? -stepX : 0,
                        steppedIndex === 1 ? -stepY : 0,
                        steppedIndex === 2 ? -stepZ : 0,
                    ],
                    voxel,
                };
            }

            // advance t to next nearest voxel boundary
            if (txMax < tyMax) {
                if (txMax < tzMax) {
                    ix += stepX;
                    t = txMax;
                    txMax += txDelta;
                    steppedIndex = 0;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            } else {
                if (tyMax < tzMax) {
                    iy += stepY;
                    t = tyMax;
                    tyMax += tyDelta;
                    steppedIndex = 1;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            }
        }
        return null;
    }
}
