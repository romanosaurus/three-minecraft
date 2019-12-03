import { Vector3D } from "./utils/Vector";

export default class Transform
{
    private _position: Vector3D;
    private _rotation: Vector3D;
    private _scale: Vector3D;

    constructor() {
        this._position = { x: 0, y: 0, z: 0 };
        this._rotation = { x: 0, y: 0, z: 0 };
        this._scale = { x: 0, y: 0, z: 0 };
    }

    get position(): Vector3D {
        return this._position;
    }

    set position(value: Vector3D) {
        this._position = value;
    }

    get rotation(): Vector3D {
        return this._rotation;
    }

    set rotation(value: Vector3D) {
        this._rotation = value;
    }

    get scale(): Vector3D {
        return this._scale;
    }

    set scale(value: Vector3D) {
        this._scale = value;
    }
}
