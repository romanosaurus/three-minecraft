import * as CANNON from 'cannon';

/**
 * Utilities class where all functions
 * independant from the ECS are stocked.
 */
class Utilities {
    /**
     * Function to handle the multiplication between
     * a quaternion and a vector
     *
     * @param initialVector source vector
     * @param quaternion source quaternion
     */
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

    /**
     * Know if a point is in an area around another point
     *
     * @param source source point
     * @param point destination point
     * @param radius size of the radius
     */
    public static vectorCollide(source: CANNON.Vec3, point: CANNON.Vec3, radius: number): boolean {
        return (point.x >= source.x - radius && point.x <= source.x + radius) &&
            (point.y >= source.y - radius && point.y <= source.y + radius) &&
            (point.z >= source.z - radius && point.z <= source.z + radius)
    }
}

export default Utilities;
