import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import Voxel from "../components/Voxel";
import BoxCollider from "../components/BoxCollider";
import CannonSystem from "./CannonSystem";
import SystemManager from "../ecs/managers/SystemManager";
import ThreeSystem from "./ThreeSystem";

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
                voxelEntity.getComponent(Voxel).Update(entity.getComponent(BoxCollider).body, ecsWrapper.systemManager.getSystem(CannonSystem).world, ecsWrapper.systemManager.getSystem(ThreeSystem).getScene());
            })
        });
    }

    onClose(): void {

    }
}

export default WalkingPhysicsSystem;
