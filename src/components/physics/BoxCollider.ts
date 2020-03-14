import * as CANNON from 'cannon';

import AComponent from "../../ecs/abstract/AComponent";
import Vector3D from '../../maths/Vector3D';
import IEntity from '../../ecs/interfaces/IEntity';

export default class BoxCollider extends AComponent {
    private _collider: CANNON.Box;
    private _offset: Vector3D;

    constructor(entity: IEntity, size: Vector3D, offset?: Vector3D) {
        super(entity);

        this._collider = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        this._offset = offset || Vector3D.ZERO;
    }

    get collider(): CANNON.Box {
        return this._collider;
    }

    get offset(): Vector3D {
        return this._offset;
    }
}