import * as THREE from 'three';

import ECSWrapper from '../../ecs/wrapper/ECSWrapper';

import { Animal, AnimalType } from '../../components/Animal';
import ASystem from '../../ecs/abstract/ASystem';
import ParticleSystem from '../../components/ParticleSystem';
import AnimalSpawningSystem from './AnimalSpawningSystem';
import ThreeSystem from '../ThreeSystem';

export default class AnimalReproductionSystem extends ASystem {
    onInit(): void {
        this.registerEvent("keyDown", (event: any) => {
            if (event.key === "t")
                ECSWrapper.entities.applyToEach(["Animal"], (entity) => {
                    const animalComponent = entity.getComponent(Animal);
                    if (animalComponent.isInHeat)
                        this.setAnimalInHeat(animalComponent, false);
                    else
                        this.setAnimalInHeat(animalComponent, true);
                });
        })
    }

    onUpdate(elapsedTime: number): void {
        const elapsedTimeAsSeconds: number = elapsedTime / 1000;

        ECSWrapper.entities.applyToEach(["Animal"], (entity) => {
            const animalComponent = entity.getComponent(Animal);


            //this.setAnimalInHeat(animalComponent, true);


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

                // TODO: Security for find the nearest one
                if (otherAnimal !== animal && otherAnimal.type === animal.type && otherAnimal.isInHeat) {
                    otherAnimal.partner = animal;
                    animal.partner = otherAnimal;
                    console.log(`${animal.getEntity().getName()} found ${otherAnimal.getEntity().getName()} as partner!`);
                }
            });
        }
    }
}