import ECSWrapper from "./ecs/wrapper/ECSWrapper";

import ThreeSystem from "./systems/ThreeSystem";
import CannonSystem from "./systems/CannonSystem";
import FirstPersonSystem from "./systems/FirstPersonSystem";
import WalkingPhysicsSystem from "./systems/WalkingPhysicsSystem";
import WorldGenerationSystem from "./systems/WorldGenerationSystem";
import LifeSystem from "./systems/LifeSystem";
import CloudSystem from "./systems/CloudSystem";
import PointerLock from "./components/PointerLock";

class Window {
    run() : void {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        ecsWrapper.systemManager.newSystem<ThreeSystem>(new ThreeSystem("ThreeSystem"));
        ecsWrapper.systemManager.newSystem<CannonSystem>(new CannonSystem("CannonSystem"));
        ecsWrapper.systemManager.newSystem<FirstPersonSystem>(new FirstPersonSystem("FirstPersonSystem"));
        ecsWrapper.systemManager.newSystem<WalkingPhysicsSystem>(new WalkingPhysicsSystem("WalkingPhysicsSystem"));
        ecsWrapper.systemManager.newSystem<WorldGenerationSystem>(new WorldGenerationSystem("WorldGenerationSystem"));
        ecsWrapper.systemManager.newSystem<LifeSystem>(new LifeSystem("LifeSystem"));
        ecsWrapper.systemManager.newSystem<CloudSystem>(new CloudSystem("CloudSystem"));
        ecsWrapper.systemManager.startSystem("ThreeSystem");
        ecsWrapper.systemManager.startSystem("CannonSystem");
        ecsWrapper.systemManager.startSystem("WorldGenerationSystem");
        ecsWrapper.systemManager.startSystem("FirstPersonSystem");
        ecsWrapper.systemManager.startSystem("WalkingPhysicsSystem");
        ecsWrapper.systemManager.startSystem("LifeSystem");
        ecsWrapper.systemManager.startSystem("CloudSystem");

        document.addEventListener('mousemove', ( mouseEvent ) => { ecsWrapper.systemManager.setEvent("mouseEvent", mouseEvent); });
        document.addEventListener('keydown', (keyDown) => { ecsWrapper.systemManager.setEvent("keyDown", keyDown); });
        document.addEventListener('keyup', (keyUp) => { ecsWrapper.systemManager.setEvent("keyUp", keyUp); });
        document.addEventListener('resize', (resize) => { ecsWrapper.systemManager.setEvent("resize", resize); });
        document.addEventListener('click', ( clickEvent ) => {
            ecsWrapper.entityManager.applyToEach(["PointerLock"], (entity) => {
                entity.getComponent(PointerLock).lockPointer();
            });
        });

        ecsWrapper.systemManager.run();
    }
}

const window: Window = new Window();
window.run();
