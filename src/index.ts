import ECSWrapper from "./ecs/wrapper/ECSWrapper";

import ThreeSystem from "./systems/ThreeSystem";
import CannonSystem from "./systems/CannonSystem";
import FirstPersonSystem from "./systems/FirstPersonSystem";
import WalkingPhysicsSystem from "./systems/WalkingPhysicsSystem";
import WorldGenerationSystem from "./systems/WorldGenerationSystem";
import LifeSystem from "./systems/LifeSystem";
import CloudSystem from "./systems/CloudSystem";
import VoxelRaycastSystem from "./systems/VoxelRaycastSystem";
import PointerLock from "./components/PointerLock";

class Window {
    run() : void {
        ECSWrapper.systems.initialize<ThreeSystem>(new ThreeSystem("ThreeSystem"));
        ECSWrapper.systems.initialize<CannonSystem>(new CannonSystem("CannonSystem"));
        ECSWrapper.systems.initialize<FirstPersonSystem>(new FirstPersonSystem("FirstPersonSystem"));
        ECSWrapper.systems.initialize<WalkingPhysicsSystem>(new WalkingPhysicsSystem("WalkingPhysicsSystem"));
        ECSWrapper.systems.initialize<WorldGenerationSystem>(new WorldGenerationSystem("WorldGenerationSystem"));
        ECSWrapper.systems.initialize<LifeSystem>(new LifeSystem("LifeSystem"));
        ECSWrapper.systems.initialize<CloudSystem>(new CloudSystem("CloudSystem"));
        ECSWrapper.systems.initialize<VoxelRaycastSystem>(new VoxelRaycastSystem("VoxelRaycastSystem"));
        ECSWrapper.systems.start("ThreeSystem");
        ECSWrapper.systems.start("CannonSystem");
        ECSWrapper.systems.start("WorldGenerationSystem");
        ECSWrapper.systems.start("FirstPersonSystem");
        ECSWrapper.systems.start("WalkingPhysicsSystem");
        ECSWrapper.systems.start("LifeSystem");
        ECSWrapper.systems.start("CloudSystem");
        ECSWrapper.systems.start("VoxelRaycastSystem");

        document.addEventListener('mousemove', ( mouseEvent ) => { ECSWrapper.systems.setEvent("mouseEvent", mouseEvent); });
        document.addEventListener('keydown', (keyDown) => { ECSWrapper.systems.setEvent("keyDown", keyDown); });
        document.addEventListener('keyup', (keyUp) => { ECSWrapper.systems.setEvent("keyUp", keyUp); });
        document.addEventListener('resize', (resize) => { ECSWrapper.systems.setEvent("resize", resize); });
        document.addEventListener('click', ( clickEvent ) => {
            ECSWrapper.systems.setEvent("click", clickEvent);
            ECSWrapper.entities.applyToEach(["PointerLock"], (entity) => {
                entity.getComponent(PointerLock).lockPointer();
            });
        });

        ECSWrapper.systems.run();
    }
}

const window: Window = new Window();
window.run();
