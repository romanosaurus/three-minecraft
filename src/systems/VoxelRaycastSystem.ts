import * as THREE from 'three';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";

import Voxel from "../components/Voxel";
import Raycast from "../components/Raycast";

class VoxelRaycastSystem extends ASystem {
    onInit(): void {

    }

    onUpdate(elapsedTime: number): void {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        ecsWrapper.entityManager.applyToEach(["Voxel", "Raycast"], (entity) => {
            const voxelComponent: Voxel = entity.getComponent(Voxel);
            const raycastComponent: Raycast = entity.getComponent(Raycast);

            let delta: THREE.Vector3 = new THREE.Vector3(
                raycastComponent.end.x - raycastComponent.start.x,
                raycastComponent.end.y - raycastComponent.start.y,
                raycastComponent.end.z - raycastComponent.start.z
            );
            const lenSq: number = Math.pow(delta.x, 2) + Math.pow(delta.y, 2) + Math.pow(delta.z, 2);
            const len: number = Math.sqrt(lenSq);

            delta.x /= len;
            delta.y /= len;
            delta.z /= len;

            let t: number = 0.0;
            let i: THREE.Vector3 = new THREE.Vector3(
                Math.floor(raycastComponent.start.x),
                Math.floor(raycastComponent.start.y),
                Math.floor(raycastComponent.start.z)
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
                (step.x > 0) ? (i.x + 1 - raycastComponent.start.x) : (raycastComponent.start.x - i.x),
                (step.y > 0) ? (i.y + 1 - raycastComponent.start.y) : (raycastComponent.start.y - i.y),
                (step.z > 0) ? (i.z + 1 - raycastComponent.start.z) : (raycastComponent.start.z - i.z)
            );
            let tMax: THREE.Vector3 = new THREE.Vector3(
                (tDelta.x < Infinity) ? tDelta.x * dist.x : Infinity,
                (tDelta.y < Infinity) ? tDelta.y * dist.y : Infinity,
                (tDelta.z < Infinity) ? tDelta.z * dist.z : Infinity
            );
            let steppedIndex: number = -1;

            while (t <= len) {
                const voxel = voxelComponent.getVoxel(i.x, i.y, i.z);

                if (voxel) {
                    return {
                        position: [
                            raycastComponent.start.x + t * delta.x,
                            raycastComponent.start.y + t * delta.y,
                            raycastComponent.start.z + t * delta.z
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
                        tMax.y += tDelta.y;
                        steppedIndex = 1;
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
        });
    }

    onClose(): void {

    }
}
