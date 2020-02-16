import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from '../ecs/interfaces/IEntity';

import ModelLoader from "../utils/ModelLoader";

export enum AnimalType {
    PIG,
    SHEEP
};

export class Animal extends AComponent {

    private _animalType: AnimalType;

    private _inHeat: boolean;
    private _lastBaby: number;

    private _hasToMove: boolean;
    private _currentMovingTime: number;

    constructor(entity: IEntity, animalType: AnimalType) {
        super(entity);

        this._animalType = animalType;

        this._inHeat = false;
        this._lastBaby = 0;

        this._hasToMove = false;
        this._currentMovingTime = 0;
    }


    get type(): AnimalType {
        return this._animalType;
    }

    get hasToMove(): boolean {
        return this._hasToMove;
    }

    set hasToMove(value: boolean) {
        this._hasToMove = value;
    }

    get currentMovingTime(): number {
        return this._currentMovingTime;
    }

    set currentMovingTime(newMovingTime: number) {
        this._currentMovingTime = newMovingTime;
    }
}