import Matrix4 from "./Matrix4";
import MathUtils from "./MathUtils";
import Quaternion from "./Quaternion";

const matrix = new Matrix4;

export default class Euler {
    public x: number;
    public y: number;
    public z: number;
    public order: string;
    readonly isEuler: boolean;

    constructor(x: number = 0, y: number = 0, z: number = 0, order: string = 'XYZ') {
        this.x = x;
        this.y = y;
        this.z = z;
        this.order = order;
        this.isEuler = true;
    }

    public setFromQuaternion(quaternion: Quaternion) {
        matrix.rotateFromQuaternion(quaternion);

        return this.setFromRotationMatrix(matrix);
    }

    public setFromRotationMatrix(m: Matrix4): Euler {
        let te = m.elements;
        let m11 = te[0], m12 = te[4], m13 = te[8];
        let m21 = te[1], m22 = te[5], m23 = te[9];
        let m31 = te[2], m32 = te[6], m33 = te[10];

        if (this.order === 'XYZ') {
            this.y = Math.asin(MathUtils.clamp(m13, -1, 1));

            if (Math.abs(m13) < 0.9999999) {
                this.x = Math.atan2(-m23, m33);
                this.z = Math.atan2(-m12, m11);
            } else {
                this.x = Math.atan2(m32, m22);
                this.z = 0;
            }
        } else if (this.order === 'YXZ') {
			this.x = Math.asin(-MathUtils.clamp(m23, -1, 1));

			if ( Math.abs( m23 ) < 0.9999999 ) {
				this.y = Math.atan2( m13, m33 );
				this.z = Math.atan2( m21, m22 );
			} else {
				this.y = Math.atan2( - m31, m11 );
				this.z = 0;
			}
        }

        return this;
    }
}