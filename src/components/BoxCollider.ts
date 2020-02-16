import * as THREE from 'three';
import * as CANNON from 'cannon';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

class BoxCollider extends AComponent {
    private _shape: CANNON.Box;
    private _body: CANNON.Body;

    private _offset: {x: number, y: number, z: number};

    constructor(entity: IEntity, position: THREE.Vector3, size: THREE.Vector3, mass: number, offset: {x: number, y: number, z: number} = {x: 0, y: 0, z: 0}) {
        super(entity);

        this._shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        this._body = new CANNON.Body({ mass: mass });
        this._body.fixedRotation = true;
        this._body.addShape(this._shape);
        this._body.position.set(position.x + offset.x, position.y + offset.y, position.z + offset.z);
        this._offset = offset;
    }

    get body(): CANNON.Body {
        return this._body;
    }

    get position(): CANNON.Vec3 {
        return this.body.position;
    }

    get offset(): {x: number, y: number, z: number} {
        return this._offset;
    }
}

export default BoxCollider;
