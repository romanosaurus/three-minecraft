import Euler from "./Euler";

export default class Quaternion {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public setFromEuler(euler: Euler): Quaternion {
        let x = euler.x, y = euler.y, z = euler.z;
        let c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2);
        let s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);

        this.x = s1 * c2 * c3 + c1 * s2 * s3;
		this.y = c1 * s2 * c3 - s1 * c2 * s3;
		this.z = c1 * c2 * s3 + s1 * s2 * c3;
        this.w = c1 * c2 * c3 - s1 * s2 * s3;

        return this;
    }
}