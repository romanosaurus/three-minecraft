import * as THREE from 'three';

import AComponent from '../ecs/abstract/AComponent';
import IEntity from '../ecs/interfaces/IEntity';

export default class Life extends AComponent {
    private _globalLife : number;
    private _currentLife : number;
    private _isDead : boolean;
    private _respawnPosition : THREE.Vector3;
    private _regenerationLifeTime: number;

    constructor(entity: IEntity, lifePoint : number, spawnPosition: THREE.Vector3) {
        super(entity);

        if (lifePoint < 0 || lifePoint > 13) {
            this._globalLife = 13;
            this._currentLife = 13;
        } else {
            this._globalLife = lifePoint;
            this._currentLife = lifePoint;
        }
        this._isDead = false;
        this._regenerationLifeTime = 0;
        this._respawnPosition = spawnPosition;
    }

    get regenerationLifeTime(): number {
        return this._regenerationLifeTime;
    }

    set regenerationLifeTime(newTime: number) {
        this._regenerationLifeTime = newTime;
    }

    get respawnPosition(): THREE.Vector3 {
        return this._respawnPosition;
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

    set takeDamage(damageTaken: number) {
        if (damageTaken >= this._globalLife) {
            this._currentLife = 0
        } else if (damageTaken <= 0) {
            this._currentLife = this._currentLife
        } else {
            this._currentLife -= damageTaken
        }
    }
}
