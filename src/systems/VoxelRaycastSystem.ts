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
                /*if (this.currentTime > 1) {
            const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

            const playerEntity = ECSWrapper.entities.getByName("Player")[0];
            const threeSystem = ecsWrapper.systemManager.getSystem(ThreeSystem);

            const camera: THREE.Camera = playerEntity.getComponent(Camera).camera;
            this.raycaster.setFromCamera(new THREE.Vector2(this.size.width / 2, this.size.height / 2), camera);

            let intersects = this.raycaster.intersectObjects(threeSystem.getScene().children);

            if (intersects.length > 0) {
                let intersect = intersects[0];
                let face = intersect.face;

                console.log(face);
            }
            this.currentTime = 0;
        }
        this.currentTime += elapsedTimeAsSeconds;*/
    }

    onClose(): void {

    }

    private intersectRay(start: THREE.Vector3, end: THREE.Vector3, voxelComponent: Voxel): any {
        /*let delta: THREE.Vector3 = new THREE.Vector3(
            end.x - start.x,
            end.y - start.y,
            end.z - start.z
        );
        const lenSq: number = Math.pow(delta.x, 2) + Math.pow(delta.y, 2) + Math.pow(delta.z, 2);
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
            Math.abs(1 / delta.z)
        );
        const dist: THREE.Vector3 = new THREE.Vector3(
            (step.x > 0) ? (i.x + 1 - start.x) : (start.x - i.x),
            (step.y > 0) ? (i.y + 1 - start.y) : (start.y - i.y),
            (step.z > 0) ? (i.z + 1 - start.z) : (start.z - i.z)
        );
        let tMax: THREE.Vector3 = new THREE.Vector3(
            (tDelta.x < Infinity) ? tDelta.x * dist.x : Infinity,
            (tDelta.y < Infinity) ? tDelta.y * dist.y : Infinity,
            (tDelta.z < Infinity) ? tDelta.z * dist.z : Infinity
        );
        let steppedIndex: number = -1;
        while (t <= len) {
            const voxel: number = voxelComponent.getVoxel(i.x, i.y, i.z, voxelComponent.getMeshByPosition(i.x, i.z), true);
            if (voxel) {
                return {
                    position: [
                        start.x + t * delta.x,
                        start.y + t * delta.y,
                        start.z + t * delta.z
                    ],
                    normal: [
                        steppedIndex === 0 ? -step.x : 0,
                        steppedIndex === 1 ? -step.y : 0,
                        steppedIndex === 2 ? -step.z : 0
                    ],
                    voxel
                };
            }
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
            return null;
        }
    }*/
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
