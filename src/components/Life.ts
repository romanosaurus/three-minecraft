import * as THREE from 'three';

import AComponent from '../ecs/abstract/AComponent';
import IEntity from '../ecs/interfaces/IEntity';

export default class Life extends AComponent {
    private _globalLife : number;
    private _currentLife : number;
    private _isDead : boolean;

    constructor(entity: IEntity, lifePoint : number) {
        super(entity);

        if (lifePoint < 0 || lifePoint > 13) {
            this._globalLife = 13;
            this._currentLife = 13;
        } else {
            this._globalLife = lifePoint;
            this._currentLife = lifePoint;
        }
        this._isDead = false;
    }

    get globalLife(): number {
        return this._globalLife;
    }

    get currentLife(): number {
        return this._currentLife;
    }

    get isPlayerDead(): boolean {
        return this._isDead;
    }

    set isDead(newState: boolean) {
        this._isDead = newState;
    }

    set changeCurrentLife(newNumber: number) {
        if (newNumber >= this._globalLife) {
            this._currentLife = this._globalLife;
        } else if (newNumber <= 0) {
            this._currentLife = 0;
        } else {
            this._currentLife = newNumber;
        }
    }
}
