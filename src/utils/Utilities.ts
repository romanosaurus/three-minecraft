import * as CANNON from 'cannon';

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

    public static vectorCollide(source: CANNON.Vec3, point: CANNON.Vec3, radius: number): boolean {
        return (point.x >= source.x - radius && point.x <= source.x + radius) &&
            (point.y >= source.y - radius && point.y <= source.y + radius) &&
            (point.z >= source.z - radius && point.z <= source.z + radius)
    }
}

export default Utilities;
