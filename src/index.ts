/*
    .-. .-. .----..-.  .-..----..-.
    | | | |/  {}  \\ \/ / | {_  | |
    \ \_/ /\      // /\ \ | {__ | `--.
    `---'  `----'`-'  `-'`----'`----'
*/

import ECSWrapper from "./ecs/wrapper/ECSWrapper";

import ThreeSystem from "./systems/ThreeSystem";
import CannonSystem from "./systems/CannonSystem";
import FirstPersonSystem from "./systems/FirstPersonSystem";
import WalkingPhysicsSystem from "./systems/WalkingPhysicsSystem";
import WorldGenerationSystem from "./systems/WorldGenerationSystem";
import LifeSystem from "./systems/LifeSystem";
import CloudSystem from "./systems/CloudSystem";
import VoxelRaycastSystem from "./systems/VoxelRaycastSystem";
import CircadianRhythmSystem from "./systems/CircadianRhythmSystem";
import PointerLock from "./components/PointerLock";
import NatureSystem from "./systems/NatureSystem";
import AnimalSpawningSystem from "./systems/animals/AnimalSpawningSystem";
import AnimalMovementSystem from "./systems/animals/AnimalMovementSystem";
import ParticleSystem from "./components/ParticleSystem";
import ParticleSystemManager from "./systems/ParticleSystemManager";
import AnimalReproductionSystem from "./systems/animals/AnimalReproductionSystem";
import AudioSystem from "./systems/AudioSystem";

class Window {
    run() : void {
        ECSWrapper.systems.initialize<NatureSystem>(new NatureSystem("NatureSystem"));
        ECSWrapper.systems.initialize<ThreeSystem>(new ThreeSystem("ThreeSystem"));
        ECSWrapper.systems.initialize<CannonSystem>(new CannonSystem("CannonSystem"));
        ECSWrapper.systems.initialize<FirstPersonSystem>(new FirstPersonSystem("FirstPersonSystem"));
        ECSWrapper.systems.initialize<WalkingPhysicsSystem>(new WalkingPhysicsSystem("WalkingPhysicsSystem"));
        ECSWrapper.systems.initialize<WorldGenerationSystem>(new WorldGenerationSystem("WorldGenerationSystem"));
        ECSWrapper.systems.initialize<LifeSystem>(new LifeSystem("LifeSystem"));
        ECSWrapper.systems.initialize<CloudSystem>(new CloudSystem("CloudSystem"));
        ECSWrapper.systems.initialize<VoxelRaycastSystem>(new VoxelRaycastSystem("VoxelRaycastSystem"));
        ECSWrapper.systems.initialize<AnimalSpawningSystem>(new AnimalSpawningSystem("AnimalSpawningSystem"));
        ECSWrapper.systems.initialize<AnimalMovementSystem>(new AnimalMovementSystem("AnimalMovementSystem"));
        ECSWrapper.systems.initialize<AnimalReproductionSystem>(new AnimalReproductionSystem("AnimalReproductionSystem"));
        ECSWrapper.systems.initialize<ParticleSystemManager>(new ParticleSystemManager("ParticleSystemManager"));
        ECSWrapper.systems.initialize<CircadianRhythmSystem>(new CircadianRhythmSystem("CircadianRhythm"));
        ECSWrapper.systems.initialize<AudioSystem>(new AudioSystem("AudioSystem"));

        ECSWrapper.systems.start("ThreeSystem");
        ECSWrapper.systems.start("NatureSystem");
        ECSWrapper.systems.start("CannonSystem");
        ECSWrapper.systems.start("WorldGenerationSystem");
        ECSWrapper.systems.start("FirstPersonSystem");
        ECSWrapper.systems.start("WalkingPhysicsSystem");
        ECSWrapper.systems.start("LifeSystem");
        ECSWrapper.systems.start("CloudSystem");
        ECSWrapper.systems.start("VoxelRaycastSystem");
        ECSWrapper.systems.start("AnimalSpawningSystem");
        ECSWrapper.systems.start("AnimalMovementSystem");
        ECSWrapper.systems.start("AnimalReproductionSystem");
        ECSWrapper.systems.start("ParticleSystemManager");
        ECSWrapper.systems.start("CircadianRhythm");
        ECSWrapper.systems.start("AudioSystem");

        document.addEventListener('mousemove', ( mouseEvent ) => { ECSWrapper.systems.dispatch("mouseEvent", mouseEvent) });
        document.addEventListener('keydown', (keyDown) => { ECSWrapper.systems.dispatch("keyDown", keyDown); });
        document.addEventListener('keyup', (keyUp) => { ECSWrapper.systems.dispatch("keyUp", keyUp); });
        document.addEventListener('click', ( clickEvent ) => {
            ECSWrapper.systems.dispatch("click", clickEvent);
            ECSWrapper.entities.applyToEach(["PointerLock"], (entity) => {
                entity.getComponent(PointerLock).lockPointer();
            });
        });

        ECSWrapper.systems.run();
    }
}

const window: Window = new Window();
window.run();
