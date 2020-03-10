import * as CANNON from 'cannon';

import ASystem from "../ecs/abstract/ASystem";
import CannonDebugRenderer from "../utils/CannonDebugger";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import Box from "../components/Box";
import BoxCollider from "../components/BoxCollider";

/**
 * CannonSystem heriting from ASystem
 * @system CannonSystem
 * @function onInit function automatically called at the initialization of the system
 * @function onUpdate function automatically called at each main loop tour
 * @function onClose function calles when the system is shutted down
 */
class CannonSystem extends ASystem {
    public readonly world: CANNON.World;
    private readonly debugger: any;
    private debuggerActivated: boolean;

    /**
     *  Constuctor of the CannonSystem
     * @param name name of the system
     */
    constructor(name: string) {
        super(name);
        this.world = new CANNON.World();
        this.debuggerActivated = false;
        this.debugger = new CannonDebugRenderer(
            ECSWrapper.systems.get(ThreeSystem).getScene(),
            this.world,
            null
        );
        this.registerEvent("keyDown", (event: any) => {
            if (event.key === "b")
                this.toggleDebugging();
        })
    }

    onInit(): void {
        this.world.gravity.set(0, -9.82, 0); // m/s²
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 5;
        this.world.defaultContactMaterial.contactEquationStiffness = 1e6;
        this.world.defaultContactMaterial.contactEquationRelaxation = 10;
    }

    onUpdate(elapsedTime: number): void {
        this.world.step(1 / 60);

        if (this.debuggerActivated) {
            this.debugger.update();
        }

        ECSWrapper.entities.applyToEach(["BoxCollider"], (entity) => {
            this.world.addBody(entity.getComponent(BoxCollider).body);
        });

        ECSWrapper.entities.applyToEach(["Box", "BoxCollider"], (entity) => {
            const box: Box = entity.getComponent(Box);
            const boxCollider: BoxCollider = entity.getComponent(BoxCollider);

            box.mesh.position.copy(boxCollider.body.position as any);
            box.mesh.quaternion.copy(boxCollider.body.quaternion as any);
        });
    }

    onClose(): void {

    }

    toggleDebugging(): void {
        this.debuggerActivated = true;
    }
}

export default CannonSystem;
