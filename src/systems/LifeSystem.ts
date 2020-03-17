import * as THREE from 'three';

import ASystem from '../ecs/abstract/ASystem';
import ECSWrapper from '../ecs/wrapper/ECSWrapper';

import FirstPersonController from '../components/controllers/FirstPersonController';
import Life from '../components/Life';
import { printCommonLine } from 'jest-diff/build/printDiffs';
import Camera from '../components/Camera';
import Box from '../components/Box';
import EntityManager from '../ecs/managers/EntityManager';
import Rigidbody from '../components/physics/Rigidbody';

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

            LifeComponent.timer = elapsedTime + LifeComponent.timer;

            let time : number = ((LifeComponent.timer - elapsedTime) / 1000)

            var minuteTime = time / 60;

            if (currentLife < globalLife && minuteTime > LifeComponent.regenerationLifeTime && !LifeComponent.isPlayerDead) {
                LifeComponent.timer = 0;
                LifeComponent.changeCurrentLife = LifeComponent.currentLife + 1;
            }

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
            if (currentLife <= 0 && !LifeComponent.isPlayerDead) {
                LifeComponent.isDead = true;
                var textDeath = document.createElement('div');
                textDeath.id = "text-death"
                textDeath.className = "death-message"
                textDeath.innerHTML = "You are Dead !";
                document.body.appendChild(textDeath);
                var buttonDeath = document.createElement('button');
                buttonDeath.id = "button-death"
                buttonDeath.className = "respawn-button"
                buttonDeath.innerHTML = "RESPAWN"
                buttonDeath.addEventListener("click", this.respawn, false);
                document.body.appendChild(buttonDeath)
            }
        });

    }

    onClose() {}

    respawn(event) {
        const LifeComponent = ECSWrapper.entities.getByName("Player")[0].getComponent(Life);
        LifeComponent.changeCurrentLife = LifeComponent.globalLife;
        var textDeath = document.getElementById("text-death");
        var buttonDeath = document.getElementById("button-death");
        textDeath.parentNode.removeChild(textDeath);
        buttonDeath.parentNode.removeChild(buttonDeath);
        LifeComponent.isDead = false;
        ECSWrapper.entities.getByName("Player")[0].getComponent(Rigidbody).position.x = LifeComponent.respawnPosition.x;
        ECSWrapper.entities.getByName("Player")[0].getComponent(Rigidbody).position.y = LifeComponent.respawnPosition.y;
        ECSWrapper.entities.getByName("Player")[0].getComponent(Rigidbody).position.z = LifeComponent.respawnPosition.z;
      }
}

export default LifeSystem;