import * as CANNON from 'cannon';

import ASystem from "../ecs/abstract/ASystem";
import CannonDebugRenderer from "../utils/CannonDebugger";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import Box from "../components/Box";
import BoxCollider from "../components/BoxCollider";
import Model from '../components/Model';

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
        this.world.broadphase.useBoundingBoxes = true;
        this.world.defaultContactMaterial.friction = 0.4;
        this.world.defaultContactMaterial.restitution = 0.0;
        //this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        //this.world.defaultContactMaterial.contactEquationRelaxation = 5;

        let solver = new CANNON.GSSolver();
        solver.iterations = 7;
        solver.tolerance = 0.1;
        this.world.solver = new CANNON.SplitSolver(solver);

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

            const positionOffsetted: CANNON.Vec3 = new CANNON.Vec3(
                boxCollider.body.position.x + boxCollider.offset.x,
                boxCollider.body.position.y + boxCollider.offset.y,
                boxCollider.body.position.z + boxCollider.offset.z
            );
            box.mesh.position.copy(positionOffsetted as any);
            box.mesh.quaternion.copy(boxCollider.body.quaternion as any);
        });

        ECSWrapper.entities.applyToEach(["Model", "BoxCollider"], (entity) => {
            const box: Model = entity.getComponent(Model);
            const boxCollider: BoxCollider = entity.getComponent(BoxCollider);

            const positionOffsetted: CANNON.Vec3 = new CANNON.Vec3(
                boxCollider.body.position.x + boxCollider.offset.x,
                boxCollider.body.position.y + boxCollider.offset.y,
                boxCollider.body.position.z + boxCollider.offset.z
            );
            box.getObject().then((object) => {
                object.position.copy(positionOffsetted as any);
                object.quaternion.copy(boxCollider.body.quaternion as any);
            });

        });
    }

    onClose(): void {

    }

    toggleDebugging(): void {
        this.debuggerActivated = true;
    }
}

export default CannonSystem;
