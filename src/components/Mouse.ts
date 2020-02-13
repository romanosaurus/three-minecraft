import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

interface IMouse {
    x: number,
    y: number,
    moveX: number,
    moveY: number
};

export default class Mouse extends AComponent {
    private _mouse: IMouse;

    constructor(entity: IEntity, startX: number, startY: number) {
        super(entity);
        this._mouse = { x: startX, y: startY, moveX: 0, moveY: 0};
    }

    get position(): IMouse {
        return this._mouse;
    }
}