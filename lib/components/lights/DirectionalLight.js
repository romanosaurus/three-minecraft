"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
class DirectionalLight extends THREE.DirectionalLight {
    constructor(transform, color, intensity = 1.0) {
        super(color, intensity);
        this.position.set(transform.position.x, transform.position.y, transform.position.y);
    }
}
exports.default = DirectionalLight;
