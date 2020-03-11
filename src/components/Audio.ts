import * as THREE from 'three';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from '../ecs/interfaces/IEntity';

interface SoundOptions {
    listener: THREE.AudioListener,
    path: string,
    loop?: boolean,
    volume?: number
};

export default class Audio extends AComponent {
    private _audio: THREE.Audio;
    private readonly _loader: THREE.AudioLoader;

    constructor(entity: IEntity, options: SoundOptions) {
        super(entity);

        this._audio = new THREE.Audio(options.listener);
        this._loader = new THREE.AudioLoader();

        this._loader.load(options.path, (buffer) => {
            this._audio.setBuffer(buffer);
            this._audio.setLoop(options.loop);
            this._audio.setVolume(options.volume);
        });
    }

    play(): void {
        this._audio.play();
    }

    stop(): void {
        this._audio.stop();
    }

    pause(): void {
        this._audio.pause();
    }
}