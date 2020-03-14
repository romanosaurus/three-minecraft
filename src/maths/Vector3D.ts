import Quaternion from './Quaternion';
import Euler from './Euler';

const quaternion = new Quaternion();

/**
 * Our vector 3d for all implementation
 */

export default class Vector3D {
    public x: number;
    public y: number;
    public z: number;

    /**
     * Constructor of the Vector3D
     *
     * @constructor
     *
     * @param x
     * @param y
     * @param z
     */
    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * @static
     * @brief Create a vector 3D with x = 0 & y = 0 & z = 0
     */
    static ZERO = new Vector3D();

    /**
     * @static
     * @brief Create a vector 3D with x = 1 & y = 1 & z = 1
     */
    static ONE = new Vector3D(1, 1, 1);

    /**
     * @static
     * @brief Create a vector 3d with x = 0 & y = 0 & z = 1
     */
    static FORWARD = new Vector3D(0, 0, 1);

    /**
     * @static
     * @brief Create a vector 3D with x = 0 & y = 0 & z = -1
     */
    static BACK = new Vector3D(0, 0, -1);

    /**
     * @static
     * @brief Create a vector 3d with x = 0 & y = -1 & z = 0
     */
    static DOWN = new Vector3D(0, -1, 0);

    /**
     * @static
     * @brief Create a vector 3d with x = 0 & y = 1 & z = 0
     */
    static UP = new Vector3D(0, 1, 0);

    /**
     * @static
     * @brief Create a vector 3d with x = -1 & y = 0 & z = 0
     */
    static LEFT = new Vector3D(-1, 0, 0);

    /**
     * @static
     * @brief Create a vector 3d with x = 1 & y = 0 & z = 0
     */
    static RIGHT = new Vector3D(1, 0, 0);

    public set(x: number, y: number, z: number): void {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
     * Normalize Vector
     */
    public normalize(): number {
        let x = this.x, y = this.y, z = this.z;

        let normalized: number = Math.sqrt(x * x + y * y + z * z);

        if (normalized > 0) {
            let normalizedInverse = 1 / normalized;

            this.x *= normalizedInverse;
            this.y *= normalizedInverse;
            this.z *= normalizedInverse;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }
        return normalized;
    }

    /**
     * Add a vector to another
     * @param v other vector
     */
    public add(v: Vector3D): Vector3D {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;
    }

    /**
     * Substract a vector to another
     * @param v other vector
     */
    public sub(v: Vector3D): Vector3D {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;
    }

    /**
     * Multiply a vector to another
     * @param v other vector
     */
    public multiply(v: Vector3D): Vector3D {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;

        return this;
    }

    /**
     * Divide a vector to another
     * @param v other vector
     */
    public divide(v: Vector3D): Vector3D {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;

        return this;
    }

    /**
     * Apply an euler to the vector 3
     * @param euler
     */
    public applyEuler(euler: Euler): Vector3D {
        return this.applyQuaternion(quaternion.setFromEuler(euler));
    }

    /**
     * Apply a quaternion to the vector
     * @param quaternion
     */
    public applyQuaternion(quaternion: Quaternion): Vector3D {
        this.normalize();

        let i = new Quaternion(
            quaternion.w * this.x + quaternion.y * this.z - quaternion.z * this.y,
            quaternion.w * this.y + quaternion.z * this.x - quaternion.x * this.z,
            quaternion.w * this.z + quaternion.x * this.y - quaternion.y * this.x,
            -quaternion.x * this.x - quaternion.y * this.y - quaternion.z * this.z
        );
        return new Vector3D(
            i.x * quaternion.w + i.w * -quaternion.x + i.y * -quaternion.z - i.z * -quaternion.y,
            i.y * quaternion.w + i.w * -quaternion.y + i.z * -quaternion.x - i.x * -quaternion.z,
            i.z * quaternion.w + i.w * -quaternion.z + i.x * -quaternion.y - i.y * -quaternion.x
        );
    }
}