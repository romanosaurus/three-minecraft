import * as THREE from 'three';

import ECSWrapper from '../../ecs/wrapper/ECSWrapper';

import { Animal, AnimalType } from '../../components/Animal';
import ASystem from '../../ecs/abstract/ASystem';
import ParticleSystem from '../../components/ParticleSystem';
import AnimalSpawningSystem from './AnimalSpawningSystem';
import ThreeSystem from '../ThreeSystem';
import Utilities from "../../utils/Utilities";
import Rigidbody from '../../components/physics/Rigidbody';
import Transform from '../../components/Transform';

export default class AnimalReproductionSystem extends ASystem {
    onInit(): void {
    }

    onUpdate(elapsedTime: number): void {
        const elapsedTimeAsSeconds: number = elapsedTime / 1000;

        ECSWrapper.entities.applyToEach(["Animal"], (entity) => {
            const animalComponent = entity.getComponent(Animal);
            const randomPick = Math.random();

            if (!entity.getName().includes("Baby") && randomPick > 0.3454 && randomPick < 0.3456 && ECSWrapper.systems.get(ThreeSystem).getScene().getObjectByName(entity.getName()))
                this.setAnimalInHeat(animalComponent, true);

            this.makeBaby(animalComponent);
            // Find partner
            this.findPartner(animalComponent);
        });
    }

    setAnimalInHeat(animal: Animal, isInHeat: boolean) {
        animal.isInHeat = isInHeat;

        // Set particles
        const animalEntity = animal.getEntity();

        if (isInHeat) {
            animalEntity.getComponent(ParticleSystem).enable();
            ECSWrapper.systems.get(ThreeSystem).getScene().add(animalEntity.getComponent(ParticleSystem).particleEmitter)
        } else {
            animalEntity.getComponent(ParticleSystem).disable();
            ECSWrapper.systems.get(ThreeSystem).getScene().remove(animalEntity.getComponent(ParticleSystem).particleEmitter)
        }
    }

    findPartner(animal: Animal) {
        if (animal.isInHeat && !animal.partner) {
            ECSWrapper.entities.applyToEach(["Animal"], (entity) => {
                const otherAnimal = entity.getComponent(Animal);

                const animalPosition = animal.getEntity().getComponent(Transform).position;
                const potentialPartnerPosition = otherAnimal.getEntity().getComponent(Transform).position;

                if (Utilities.vectorCollide(animalPosition, potentialPartnerPosition, 30)) {
                    if (otherAnimal !== animal && otherAnimal.type === animal.type && otherAnimal.isInHeat) {
                        otherAnimal.partner = animal;
                        animal.partner = otherAnimal;
                        console.log(`${animal.getEntity().getName()} found ${otherAnimal.getEntity().getName()} as partner!`);
                    }
                }
            });
        }
    }

    makeBaby(animal: Animal) {
        if (animal.makeBaby && animal.partner && animal.isInHeat && animal.partner.isInHeat) {
            ECSWrapper.systems.get(AnimalSpawningSystem).spawnBaby(animal.getEntity().getComponent(Transform).position, animal.type);

            animal.makeBaby = false;
            this.setAnimalInHeat(animal, false);
            this.setAnimalInHeat(animal.partner, false);
            animal.partner = null;
        }
    }
}
