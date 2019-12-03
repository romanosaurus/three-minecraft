"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Transform {
    constructor() {
        this._position = { x: 0, y: 0, z: 0 };
        this._rotation = { x: 0, y: 0, z: 0 };
        this._scale = { x: 0, y: 0, z: 0 };
    }
    get position() {
        return this._position;
    }
    set position(value) {
        this._position = value;
    }
    get rotation() {
        return this._rotation;
    }
    set rotation(value) {
        this._rotation = value;
    }
    get scale() {
        return this._scale;
    }
    set scale(value) {
        this._scale = value;
    }
}
exports.default = Transform;
