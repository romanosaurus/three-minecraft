import * as CANNON from 'cannon';

import AComponent from '../../ecs/abstract/AComponent';
import IEntity from '../../ecs/interfaces/IEntity';
import Vector3D from '../../maths/Vector3D';
import Quaternion from '../../maths/Quaternion';

export default class Rigidbody extends AComponent {
    public skeleton: CANNON.Body;

    constructor(entity: IEntity, mass: number) {
        super(entity);

        this.skeleton = new CANNON.Body({ mass: mass });
        this.skeleton.fixedRotation = true;
    }

    public addShape(shape: CANNON.Shape): void {
        this.skeleton.addShape(shape);
    }

    get position(): Vector3D {
        return new Vector3D(this.skeleton.position.x, this.skeleton.position.y, this.skeleton.position.z);
    }

    set position(np: Vector3D) {
        this.skeleton.position.set(np.x, np.y, np.z);
    }

    get quaternion(): Quaternion {
        return new Quaternion(
            this.skeleton.quaternion.x,
            this.skeleton.quaternion.y,
            this.skeleton.quaternion.z,
            this.skeleton.quaternion.w
        );
    }

    set quaternion(nq: Quaternion) {
        this.skeleton.quaternion.set(nq.x, nq.y, nq.z, nq.w);
    }
}