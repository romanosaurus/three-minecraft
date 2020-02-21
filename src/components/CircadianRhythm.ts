import * as THREE from "three";

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";
import ThreeSystem from "../systems/ThreeSystem";

export default class CircadianRhythm extends AComponent {
    private _switchingTime : number;
    private DaysEnum = {"day":1, "night":2};
    private _isDay: number;
    private _time: number;

    constructor(entity: IEntity, switchTime : number) {
        super(entity);

        if (switchTime <= 0)
            this._switchingTime = 10;
        else
            this._switchingTime = switchTime;

        this._isDay = this.DaysEnum.day;
        this._time = 0;
    }
    
    get switchingTime(): number {
        return this._switchingTime;
    }

    get isDay(): number {
        return this._isDay;
    }

    get istime(): number {
        return this._time;
    }

    set time(newTime: number) {
        this._time = newTime;
    }

    public switchDay() {
        if (this._isDay == this.DaysEnum.day)
            this._isDay = this.DaysEnum.night
        else
            this._isDay = this.DaysEnum.day
    }
}