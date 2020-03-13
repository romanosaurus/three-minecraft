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
        let x = this.x, y = this.y, z = this.z;
        let qx = quaternion.x, qy = quaternion.y, qz = quaternion.z, qw = quaternion.w;

        var ix = qw * x + qy * z - qz * y;
		var iy = qw * y + qz * x - qx * z;
		var iz = qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;
    }
}