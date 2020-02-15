import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

import IEntity from "../ecs/interfaces/IEntity";
import AComponent from '../ecs/abstract/AComponent';

class PointerLock extends AComponent {
    private _controls: PointerLockControls;
    private _pointerLockActivated: boolean;

    constructor(entity: IEntity, camera : THREE.Camera) {
        super(entity);

        this._pointerLockActivated = false;
        this._controls = new PointerLockControls( camera, document.body );
        this.controls.addEventListener( 'lock', () => { this.pointerLockActivated = true });
        this.controls.addEventListener( 'unlock', () => { this.pointerLockActivated = false });
    }

    set pointerLockActivated(newState: boolean) {
        this._pointerLockActivated = newState;
    }

    get pointerLockActivated(): boolean {
        return this._pointerLockActivated;
    }

    get controls(): PointerLockControls {
        return this._controls;
    }

    public lockPointer(): void {
        this.controls.lock();
    }
}

export default PointerLock;