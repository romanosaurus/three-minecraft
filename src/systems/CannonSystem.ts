import * as CANNON from 'cannon';

import ASystem from "../ecs/abstract/ASystem";
import CannonDebugRenderer from "../utils/CannonDebugger";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import Box from "../components/Box";
import BoxCollider from "../components/BoxCollider";
import Model from '../components/Model';
import FirstPersonController from "../components/controllers/FirstPersonController";
import Transform from '../components/Transform';
import Vector3D from '../maths/Vector3D';
import Controller from '../components/controllers/Controller';

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

        let solver = new CANNON.GSSolver();
        solver.iterations = 7;
        solver.tolerance = 0.1;
        this.world.solver = new CANNON.SplitSolver(solver);

        ECSWrapper.entities.applyToEach(["BoxCollider", "FirstPersonController"], (entity) => {
            let contactNormal = new CANNON.Vec3();
            let upAxis = new CANNON.Vec3(0,1,0);
            entity.getComponent(BoxCollider).body.addEventListener("collide", (e) => {
                let contact = e.contact;

                if (contact.bi.id == entity.getComponent(BoxCollider).body.id)
                    contact.ni.negate(contactNormal);
                else
                    contactNormal.copy(contact.ni);

                if (contactNormal.dot(upAxis) > 0.5) {
                    entity.getComponent(FirstPersonController).canJump = true;
                }
            });
        });

        ECSWrapper.entities.applyToEach(["BoxCollider", "Transform"], (entity) => {
            const transform = entity.getComponent(Transform);
            const boxCollider = entity.getComponent(BoxCollider);

            boxCollider.body.position.set(transform.position.x, transform.position.y, transform.position.z);
        });
    }

    onUpdate(elapsedTime: number): void {
        this.world.step(1 / 60);

        if (this.debuggerActivated) {
            this.debugger.update();
        }

        ECSWrapper.entities.applyToEach(["BoxCollider", "Transform"], (entity) => {
            const transform = entity.getComponent(Transform);
            const boxCollider = entity.getComponent(BoxCollider);

            const positionOffsetted: Vector3D = new Vector3D(
                boxCollider.body.position.x + boxCollider.offset.x,
                boxCollider.body.position.y + boxCollider.offset.y,
                boxCollider.body.position.z + boxCollider.offset.z
            );
            transform.position.x = positionOffsetted.x;
            transform.position.y = positionOffsetted.y;
            transform.position.z = positionOffsetted.z;

            if (!entity.hasComponent("Box"))
                boxCollider.body.quaternion.set(
                    transform.quaternion.x,
                    transform.quaternion.y,
                    transform.quaternion.z,
                    transform.quaternion.w
                );
        });

        ECSWrapper.entities.applyToEach(["BoxCollider", "FirstPersonController"], (entity) => {
            const boxCollider = entity.getComponent(BoxCollider);
            const firstPersonController = entity.getComponent(FirstPersonController);

            boxCollider.body.position.x += firstPersonController.velocity.x;
            boxCollider.body.velocity.y = (firstPersonController.velocity.y === 0) ? boxCollider.body.velocity.y : firstPersonController.velocity.y;
            boxCollider.body.position.z += firstPersonController.velocity.z;

            //boxCollider.body.velocity.set(firstPersonController.velocity.x, firstPersonController.velocity.y, firstPersonController.velocity.z);
        });

        ECSWrapper.entities.applyToEach(["BoxCollider", "Controller"], (entity) => {
            const collider = entity.getComponent(BoxCollider);
            const controller = entity.getComponent(Controller);

            collider.body.position.x += controller.velocity.x;
            collider.body.position.y += controller.velocity.y;
            collider.body.position.z += controller.velocity.z;
        });

        ECSWrapper.entities.applyToEach(["BoxCollider"], (entity) => {
            this.world.addBody(entity.getComponent(BoxCollider).body);
        });

        ////////////////////////////////

        /*ECSWrapper.entities.applyToEach(["Box", "BoxCollider"], (entity) => {
            const box: Box = entity.getComponent(Box);
            const boxCollider: BoxCollider = entity.getComponent(BoxCollider);

            const positionOffsetted: CANNON.Vec3 = new CANNON.Vec3(
                boxCollider.body.position.x + boxCollider.offset.x,
                boxCollider.body.position.y + boxCollider.offset.y,
                boxCollider.body.position.z + boxCollider.offset.z
            );
            //box.mesh.position.copy(positionOffsetted as any);
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

        });*/
    }

    onClose(): void {

    }

    toggleDebugging(): void {
        this.debuggerActivated = true;
    }
}

export default CannonSystem;
