import * as CANNON from 'cannon';
import Quaternion from '../maths/Quaternion';
import Vector3D from '../maths/Vector3D';

/**
 * Utilities class where all functions
 * independant from the ECS are stocked.
 */
class Utilities {
    /**
     * Know if a point is in an area around another point
     *
     * @param source source point
     * @param point destination point
     * @param radius size of the radius
     */
    public static vectorCollide(source: Vector3D, point: Vector3D, radius: number): boolean {
        return (point.x >= source.x - radius && point.x <= source.x + radius) &&
            (point.y >= source.y - radius && point.y <= source.y + radius) &&
            (point.z >= source.z - radius && point.z <= source.z + radius)
    }

    /**
     * 
     */
    public static didQuaternionEqual(source: Quaternion, comp: THREE.Quaternion | CANNON.Quaternion): boolean {
        if (source.x === comp.x && source.y === comp.y && source.z === comp.z && source.w === comp.w)
            return true;
        return false;
    }
}

export default Utilities;
