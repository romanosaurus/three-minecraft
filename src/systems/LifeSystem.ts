import * as THREE from 'three';

import ASystem from '../ecs/abstract/ASystem';
import ECSWrapper from '../ecs/wrapper/ECSWrapper';

import FirstPersonController from '../components/FirstPersonController';
import Life from '../components/Life';

/**
 * LifeSystem heriting from ASystem
 * @system LifeSystem
 * @function onInit function automatically called at the initialization of the system
 * @function onUpdate function automatically called at each main loop tour
 * @function onClose function calles when the system is shutted down
 */
class LifeSystem extends ASystem {

    /**
     * Constuctor of the LifeSystem
     * @param name name of the system
     */
    constructor(name: string) {
        super(name)
    }

    onInit() {
        ECSWrapper.entities.applyToEach(["Life", "FirstPersonController"], (entity) => {
            const LifeComponent = entity.getComponent(Life);
            var currentDiv = document.getElementById('life-bar-cell');
            let globalLife = LifeComponent.globalLife;
            let marginLeft = -150;

            for (let index = 1; index <= globalLife; index++) {
                var element = document.createElement('div');
                element.className = "life-bar-cell";
                element.id = "life" + index;
                element.style.marginLeft = marginLeft.toString() + "px";
                document.body.insertBefore(element, currentDiv);
                marginLeft += 25;
            }
        });
    }

    onUpdate(elapsedTime: number): void {
        ECSWrapper.entities.applyToEach(["Life", "FirstPersonController"], (entity) => {
            const LifeComponent = entity.getComponent(Life);
            let globalLife = LifeComponent.globalLife;
            let currentLife = LifeComponent.currentLife;

            if (currentLife <= globalLife) {
                for (let index = 1; index <= globalLife; index++) {
                    if (index > currentLife) {
                        var heart = document.getElementById("life" + index);
                        heart.style.backgroundPositionY = "72px";
                    } else if (index <= currentLife) {
                        var fullheart = document.getElementById("life" + index);
                        fullheart.style.backgroundPositionY = "0px";
                    }
                }
            }
            if (currentLife === 0) {
                LifeComponent.isDead = true;
            }
        });

    }

    onClose() {}
}

export default LifeSystem;