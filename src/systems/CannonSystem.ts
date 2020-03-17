import * as CANNON from 'cannon';

import ASystem from "../ecs/abstract/ASystem";
import CannonDebugRenderer from "../utils/CannonDebugger";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import BoxCollider from "../components/physics/BoxCollider";
import FirstPersonController from "../components/controllers/FirstPersonController";
import Transform from '../components/Transform';
import Vector3D from '../maths/Vector3D';
import Controller from '../components/controllers/Controller';
import Rigidbody from '../components/physics/Rigidbody';

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

        ECSWrapper.entities.applyToEach(["BoxCollider", "Rigidbody", "Transform"], (entity) => {
            const boxCollider = entity.getComponent(BoxCollider);
            const rigidbody = entity.getComponent(Rigidbody);
            const transform = entity.getComponent(Transform);

            rigidbody.addShape(boxCollider.collider);
            rigidbody.position = transform.position;
        });

        ECSWrapper.entities.applyToEach(["Rigidbody", "FirstPersonController"], (entity) => {
            let contactNormal = new CANNON.Vec3();
            let upAxis = new CANNON.Vec3(0,1,0);

            entity.getComponent(Rigidbody).skeleton.addEventListener("collide", (e) => {
                let contact = e.contact;

                if (contact.bi.id == entity.getComponent(Rigidbody).skeleton.id)
                    contact.ni.negate(contactNormal);
                else
                    contactNormal.copy(contact.ni);

                if (contactNormal.dot(upAxis) > 0.5) {
                    entity.getComponent(FirstPersonController).canJump = true;
                }
            });
        });
    }

    onUpdate(elapsedTime: number): void {
        this.world.step(1 / 60);

        if (this.debuggerActivated) {
            this.debugger.update();
        }

        ECSWrapper.entities.applyToEach(["BoxCollider", "Rigidbody", "Transform"], (entity) => {
            const boxCollider = entity.getComponent(BoxCollider);
            const rigidbody = entity.getComponent(Rigidbody);
            const transform = entity.getComponent(Transform);

            if (rigidbody.skeleton.shapes.length === 0) {
                rigidbody.addShape(boxCollider.collider);
                rigidbody.position = transform.position;
            }
        });

        ECSWrapper.entities.applyToEach(["Rigidbody", "BoxCollider", "Transform"], (entity) => {
            const transform = entity.getComponent(Transform);
            const rigidbody = entity.getComponent(Rigidbody);
            const boxCollider = entity.getComponent(BoxCollider);

            const positionOffsetted: Vector3D = new Vector3D(
                rigidbody.skeleton.position.x + boxCollider.offset.x,
                rigidbody.skeleton.position.y + boxCollider.offset.y,
                rigidbody.skeleton.position.z + boxCollider.offset.z
            );
            transform.position = positionOffsetted;

            if (!entity.hasComponent("Box"))
                rigidbody.quaternion = transform.quaternion;
        });

        ECSWrapper.entities.applyToEach(["Rigidbody", "FirstPersonController"], (entity) => {
            const rigidbody = entity.getComponent(Rigidbody);
            const firstPersonController = entity.getComponent(FirstPersonController);

            rigidbody.skeleton.position.x += firstPersonController.velocity.x;
            rigidbody.skeleton.velocity.y = (firstPersonController.velocity.y === 0) ? rigidbody.skeleton.velocity.y : firstPersonController.velocity.y;
            rigidbody.skeleton.position.z += firstPersonController.velocity.z;
        });

        ECSWrapper.entities.applyToEach(["Rigidbody", "Controller"], (entity) => {
            const collider = entity.getComponent(Rigidbody);
            const controller = entity.getComponent(Controller);

            collider.skeleton.position.x += controller.velocity.x;
            collider.skeleton.position.y += controller.velocity.y;
            collider.skeleton.position.z += controller.velocity.z;
        });

        ECSWrapper.entities.applyToEach(["Rigidbody"], (entity) => {
            this.world.addBody(entity.getComponent(Rigidbody).skeleton);
        });
    }

    onClose(): void {

    }

    toggleDebugging(): void {
        this.debuggerActivated = true;
    }
}

export default CannonSystem;
