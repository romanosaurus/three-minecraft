import AComponent from "../../ecs/abstract/AComponent";
import Vector3D from "../../maths/Vector3D";
import IEntity from "../../ecs/interfaces/IEntity";

export default class Controller extends AComponent {
    public velocity: Vector3D = new Vector3D;
    public speed: number;

    constructor(entity: IEntity, speed: number) {
        super(entity);

        this.speed = speed;
    }
}