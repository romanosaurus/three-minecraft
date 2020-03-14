import ASystem from "../ecs/abstract/ASystem";

import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import Camera from "../components/Camera";
import AudioSource from "../components/audio/AudioSource";
import Audio, { AudioState } from "../components/audio/Audio";

class AudioSystem extends ASystem {
    onInit() {
        ECSWrapper.entities.applyToEach(["AudioSource", "Audio", "Camera"], (entity) => {
            const cameraComponent = entity.getComponent(Camera);
            const audioSourceComponent = entity.getComponent(AudioSource);

            cameraComponent.camera.add(audioSourceComponent.listener);
        });
    }

    onUpdate(elapsedTime: number) {
        ECSWrapper.entities.applyToEach(["AudioSource", "Audio"], (entity) => {
            const audioComponent = entity.getComponent(Audio);

            switch (audioComponent.state) {
                case AudioState.PLAY:
                    if (!audioComponent.sound.isPlaying && audioComponent.sound.buffer) {
                        audioComponent.sound.play();
                    }
                    break;
                case AudioState.STOP:
                    if (audioComponent.sound.isPlaying)
                        audioComponent.sound.stop();
                    break;
                case AudioState.PAUSE:
                    audioComponent.sound.pause();
                    break;
            }
        });
    }

    onClose() {

    }
}

export default AudioSystem;