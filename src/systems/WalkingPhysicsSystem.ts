import * as CANNON from 'cannon';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import Voxel from "../components/Voxel";
import BoxCollider from "../components/BoxCollider";
import CannonSystem from "./CannonSystem";
import SystemManager from "../ecs/managers/SystemManager";
import ThreeSystem from "./ThreeSystem";
import Chunk from "../utils/Chunk";
import WalkingArea from "../components/WalkingArea";
import IEntity from "../ecs/interfaces/IEntity";

/**
 * WalkingPhysicsSystem heriting from ASystem
 * @system WalkingPhysicsSystem
 * @function onInit function automatically called at the initialization of the system
 * @function onUpdate function automatically called at each main loop tour
 * @function onClose function calles when the system is shutted down
 */
class WalkingPhysicsSystem extends ASystem {
    private stock;

    /**
     * Constuctor of the WalkingPhysicsSystem
     * @param name name of the system
     */
    constructor(name: string) {
        super(name);
        this.stock = [];
    }

    onInit(): void {

    }

    onUpdate(elapsedTime: number): void {
        ECSWrapper.entities.applyToEach(["BoxCollider", "WalkingArea"], (entity) => {
            const boxCollider: BoxCollider = entity.getComponent(BoxCollider);
            const walkingArea: WalkingArea = entity.getComponent(WalkingArea);

            ECSWrapper.entities.applyToEach(["Voxel"], (voxelEntities) => {
                this.handleWalkingArea(boxCollider, walkingArea, voxelEntities);
                this.handleDeletionOfWalkingArea(walkingArea);
            });
        });
        this.stock = [];
    }

    onClose(): void {

    }

    private handleWalkingArea(boxCollider: BoxCollider, walkingArea: WalkingArea, voxelEntities: IEntity): void {
        const boxColliderSize: number = 1;
        const physicsRadius: number = 3;
        const playerPosition: CANNON.Vec3 = boxCollider.position;
        const voxelComponent: Voxel = voxelEntities.getComponent(Voxel);
        const activeMesh: Chunk = voxelComponent.getMeshByPosition(playerPosition.x, playerPosition.z)

        if (activeMesh === undefined)
            return
        for (let zPos = Math.round(playerPosition.z) - physicsRadius; zPos <= Math.round(playerPosition.z) + physicsRadius; zPos += 1) {
            for (let xPos = Math.round(playerPosition.x) - physicsRadius; xPos <= Math.round(playerPosition.x) + physicsRadius; xPos += 1) {
                for (let yPos = Math.round(playerPosition.y) - physicsRadius; yPos <= Math.round(playerPosition.y) + physicsRadius; yPos += 1) {
                    const cell: number = voxelComponent.getVoxel(xPos, yPos, zPos, activeMesh)
                    if (cell === 0)
                        continue
                    let exist: boolean = false;
                    let newBody: CANNON.Body = new CANNON.Body({ mass: 0 });
                    newBody.position = voxelComponent.getVoxelPosition(xPos, yPos, zPos);
                    newBody.addShape(new CANNON.Box(
                        new CANNON.Vec3(
                            boxColliderSize / 2,
                            boxColliderSize / 2,
                            boxColliderSize / 2
                        )
                    ));
                    this.stock.push(newBody.position);
                    if (walkingArea.areaAlreadyExists(newBody.position))
                        exist = true;
                    if (!exist) {
                        walkingArea.newArea(newBody.position, newBody);
                        ECSWrapper.systems.get(CannonSystem).world.addBody(newBody);
                    }
                }
            }
        }
    }

    private handleDeletionOfWalkingArea(walkingArea: WalkingArea): void {
        let indexToDelete: Array<number> = [];

        for (let i = 0; i < walkingArea.area.length; i++) {
            let toPush: boolean = true;
            for (let j = 0; j < this.stock.length; j++) {
                let tmpPosition: CANNON.Vec3 = walkingArea.area[i].position;

                if (tmpPosition.x === this.stock[j].x && tmpPosition.y === this.stock[j].y && tmpPosition.z === this.stock[j].z)
                    toPush = false;
            }

            if (toPush) {
                indexToDelete.push(i);
            }
        }
        for (let i = 0; i < indexToDelete.length; i += 1) {
            if (walkingArea.area[indexToDelete[i]] !== undefined)
                ECSWrapper.systems.get(CannonSystem).world.remove(walkingArea.area[indexToDelete[i]].body);
            walkingArea.area.splice(indexToDelete[i], 1);
        }
    }
}

export default WalkingPhysicsSystem;
