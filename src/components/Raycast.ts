import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

class Raycast extends AComponent {
    private _start: THREE.Vector3;
    private _end: THREE.Vector3;

    constructor(entity: IEntity, start: THREE.Vector3, end: THREE.Vector3) {
        super(entity);

        this._start = start;
        this._end = end;
    }

    get start(): THREE.Vector3 {
        return this._start;
    }

    set start(newStart: THREE.Vector3) {
        this._start = newStart;
    }

    get end(): THREE.Vector3 {
        return this._end;
    }

    set end(newEnd: THREE.Vector3) {
        this._end = newEnd;
    }
}

export default Raycast;
