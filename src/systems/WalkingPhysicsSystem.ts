import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import Voxel from "../components/Voxel";
import BoxCollider from "../components/BoxCollider";
import CannonSystem from "./CannonSystem";

class WalkingPhysicsSystem extends ASystem {
    constructor(name: string) {
        super(name);
    }

    onInit(): void {

    }

    onUpdate(elapsedTime: number): void {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        ecsWrapper.entityManager.applyToEach(["FirstPersonController", "BoxCollider"], (entity) => {
            ecsWrapper.entityManager.applyToEach(["Voxel"], (voxelEntity) => {
                voxelEntity.getComponent(Voxel).Update(entity.getComponent(BoxCollider).body, ecsWrapper.systemManager.getSystem(CannonSystem).world);
            })
        });
    }

    onClose(): void {

    }
}

export default WalkingPhysicsSystem;
