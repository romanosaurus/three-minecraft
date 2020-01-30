import * as THREE from 'three';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import IEntity from "../ecs/interfaces/IEntity";
import Voxel from "../components/Voxel";
import ThreeSystem from "./ThreeSystem";

class WorldGenerationSystem extends ASystem {
    constructor(name: string) {
        super(name);
    }

    onInit(): void {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        ecsWrapper.entityManager.createEntity("world");
        const worldEntity: IEntity = ecsWrapper.entityManager.getEntity("world");

        worldEntity.assignComponent<Voxel>(
            new Voxel(
                worldEntity,
                {cellSize: 128, tileTextureWidth: 256, tileTextureHeight: 64, tileSize: 16}
            )
        );

        ecsWrapper.entityManager.applyToEach(["Voxel"], (entity) => {
            entity.getComponent(Voxel).displayVoxelWorld(ecsWrapper.systemManager.getSystem(ThreeSystem).getScene());
        });
    }

    onUpdate(elapsedTime: number): void {

    }

    onClose(): void {

    }
}

export default WorldGenerationSystem;
