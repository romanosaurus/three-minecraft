import ECSWrapper from "./ecs/wrapper/ECSWrapper";

import ThreeSystem from "./systems/ThreeSystem";
import CannonSystem from "./systems/CannonSystem";
import FirstPersonSystem from "./systems/FirstPersonSystem";
import WalkingPhysicsSystem from "./systems/WalkingPhysicsSystem";

class Window {
    run() : void {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();

        ecsWrapper.systemManager.newSystem<ThreeSystem>(new ThreeSystem("ThreeSystem"));
        ecsWrapper.systemManager.newSystem<CannonSystem>(new CannonSystem("CannonSystem"));
        ecsWrapper.systemManager.newSystem<FirstPersonSystem>(new FirstPersonSystem("FirstPersonSystem"));
        ecsWrapper.systemManager.newSystem<WalkingPhysicsSystem>(new WalkingPhysicsSystem("WalkingPhysicsSystem"));
        ecsWrapper.systemManager.startSystem("ThreeSystem");
        ecsWrapper.systemManager.startSystem("CannonSystem");
        ecsWrapper.systemManager.startSystem("FirstPersonSystem");
        ecsWrapper.systemManager.startSystem("WalkingPhysicsSystem");

        document.addEventListener( 'mousemove', ( mouseEvent ) => { ecsWrapper.systemManager.setEvent("mouseEvent", mouseEvent); });
        document.addEventListener('keydown', (keyDown) => { ecsWrapper.systemManager.setEvent("keyDown", keyDown); });
        document.addEventListener('keyup', (keyUp) => { ecsWrapper.systemManager.setEvent("keyUp", keyUp); });

        ecsWrapper.systemManager.run();
    }
}

const window: Window = new Window();
window.run();
