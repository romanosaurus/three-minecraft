import Vector3D from "../maths/Vector3D";
import Quaternion from "../maths/Quaternion";
import Euler from "../maths/Euler";

import AComponent from "../ecs/abstract/AComponent";

export default class Transform extends AComponent {
    public position: Vector3D = new Vector3D;
    public rotation: Euler = new Euler;
    public scale: Vector3D = new Vector3D(1, 1, 1);
    public quaternion: Quaternion = new Quaternion;
}