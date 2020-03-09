import * as CANNON from 'cannon';
import * as THREE from 'three';

class Utilities {
    public static multiplyVectorByQuaternion(initialVector: CANNON.Vec3, quaternion: CANNON.Quaternion): CANNON.Vec3 {
        initialVector.normalize();
        let i = new CANNON.Quaternion(
            quaternion.w * initialVector.x + quaternion.y * initialVector.z - quaternion.z * initialVector.y,
            quaternion.w * initialVector.y + quaternion.z * initialVector.x - quaternion.x * initialVector.z,
            quaternion.w * initialVector.z + quaternion.x * initialVector.y - quaternion.y * initialVector.x,
            -quaternion.x * initialVector.x - quaternion.y * initialVector.y - quaternion.z * initialVector.z
        );
        return new CANNON.Vec3(
            i.x * quaternion.w + i.w * -quaternion.x + i.y * -quaternion.z - i.z * -quaternion.y,
            i.y * quaternion.w + i.w * -quaternion.y + i.z * -quaternion.x - i.x * -quaternion.z,
            i.z * quaternion.w + i.w * -quaternion.z + i.x * -quaternion.y - i.y * -quaternion.x
        );
    }

    public static lookAt(source: CANNON.Vec3, dest: CANNON.Vec3): CANNON.Quaternion {
        const forwardVector = new CANNON.Vec3(dest.x - source.x, dest.y - source.y, dest.z - source.z);

        forwardVector.normalize();

        const dot: number = forwardVector.dot(new CANNON.Vec3(0, 0, 1));
        if (Math.abs(dot - (-1)) < 0.000001)
            return new CANNON.Quaternion(0, 1, 0, 3.1415926535897932);
        const rotAngle = Math.acos(dot);
        const rotAxis = forwardVector.cross(new CANNON.Vec3(0, 0, 1));
        rotAxis.normalize();
        return Utilities.createFromAxisAngle(rotAxis, rotAngle);
    }

    private static createFromAxisAngle(axis: CANNON.Vec3, angle: number) {
        const halfAngle = 0.5 * angle;
        const s = Math.sin(halfAngle);
        const q: CANNON.Quaternion = new CANNON.Quaternion(axis.x * s, axis.y * s, axis.z * s, Math.cos(halfAngle));
        return q;
    }
}

export default Utilities;
