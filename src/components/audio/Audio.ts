import * as THREE from 'three';

import AComponent from "../../ecs/abstract/AComponent";
import IEntity from '../../ecs/interfaces/IEntity';

interface AudioOptions {
    listener: THREE.AudioListener,
    path: string,
    loop?: boolean,
    volume?: number
};

export enum AudioState {
    PLAY,
    PAUSE,
    STOP,
    SOUND
};
export default class Audio extends AComponent {
    private _audio: THREE.Audio;
    private readonly _loader: THREE.AudioLoader;
    private _state: AudioState;

    constructor(entity: IEntity, options: AudioOptions) {
        super(entity);

        this._audio = new THREE.Audio(options.listener);
        this._loader = new THREE.AudioLoader();

        this._loader.load(options.path, (buffer) => {
            this._audio.setBuffer(buffer);
            this._audio.setLoop(options.loop);
            this._audio.setVolume(options.volume);
        });

        this._state = AudioState.PLAY;
    }

    set state(ns: AudioState) {
        this._state = ns;
    }

    get state(): AudioState {
        return this._state;
    }

    get sound(): THREE.Audio {
        return this._audio;
    }
}