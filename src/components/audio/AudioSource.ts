import * as THREE from 'three';
import AComponent from '../../ecs/abstract/AComponent';

export default class AudioSource extends AComponent {
    private _listener: THREE.AudioListener = new THREE.AudioListener();

    get listener(): THREE.AudioListener {
        return this._listener;
    }
}