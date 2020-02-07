import * as CANNON from 'cannon';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from '../ecs/interfaces/IEntity';

interface BoxArea {
    position: CANNON.Vec3,
    body: CANNON.Body
}

class WalkingArea extends AComponent {
    private _area: Array<BoxArea>;

    constructor(entity: IEntity) {
        super(entity);
        this._area = [];
    }

    public newArea(position: CANNON.Vec3, body: CANNON.Body): void {
        this._area.push({ position: position, body: body });
    }

    public areaAlreadyExists(position: CANNON.Vec3): boolean {
        for (let col = 0; col < this._area.length; col++) {
            let boxPosition: CANNON.Vec3 = this._area[col].position;

            if (boxPosition.x === position.x && boxPosition.y === position.y && boxPosition.z === position.z)
                return true;
        }
        return false;
    }

    get area(): Array<BoxArea> {
        return this._area;
    }
}

export default WalkingArea;