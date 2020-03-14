import AComponent from "../ecs/abstract/AComponent";
import IEntity from '../ecs/interfaces/IEntity';

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

    private _partner: Animal | null;

    private _facingPartner: boolean;
    private _makeBaby: boolean;

    constructor(entity: IEntity, animalType: AnimalType) {
        super(entity);

        this._animalType = animalType;

        this._inHeat = false;
        this._lastBaby = 0;

        this._hasToMove = false;
        this._currentMovingTime = 0;

        this._partner = null;
        this._facingPartner = false;

        this._makeBaby = false;
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

    get partner(): Animal {
        return this._partner;
    }

    set partner(newPartner: Animal) {
        this._partner = newPartner;
    }

    get isInHeat(): boolean {
        return this._inHeat;
    }

    set isInHeat(state: boolean) {
        this._inHeat = state;
    }

    get facingPartner(): boolean {
        return this._facingPartner;
    }

    set facingPartner(state) {
        this._facingPartner = state;
    }

    get makeBaby(): boolean {
        return this._makeBaby;
    }

    set makeBaby(state) {
        this._makeBaby = state;
    }
}
