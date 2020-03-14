import Vector3D from "./Vector3D";
import Quaternion from "./Quaternion";

export default class Matrix4 {
    public elements: number[] = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    public rotateFromQuaternion(quaternion: Quaternion): Matrix4 {
        return this.compose(Vector3D.ZERO, quaternion, Vector3D.ONE);
    }

    public compose(position: Vector3D, quaternion: Quaternion, scale: Vector3D): Matrix4 {
        let te = this.elements;

        let x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
        let x2 = x + x,	y2 = y + y, z2 = z + z;
		let xx = x * x2, xy = x * y2, xz = x * z2;
		let yy = y * y2, yz = y * z2, zz = z * z2;
		let wx = w * x2, wy = w * y2, wz = w * z2;

        let sx = scale.x, sy = scale.y, sz = scale.z;

        te[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
		te[ 1 ] = ( xy + wz ) * sx;
		te[ 2 ] = ( xz - wy ) * sx;
		te[ 3 ] = 0;

		te[ 4 ] = ( xy - wz ) * sy;
		te[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
		te[ 6 ] = ( yz + wx ) * sy;
		te[ 7 ] = 0;

		te[ 8 ] = ( xz + wy ) * sz;
		te[ 9 ] = ( yz - wx ) * sz;
		te[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
		te[ 11 ] = 0;

		te[ 12 ] = position.x;
		te[ 13 ] = position.y;
		te[ 14 ] = position.z;
        te[ 15 ] = 1;

        return this;
    }
}