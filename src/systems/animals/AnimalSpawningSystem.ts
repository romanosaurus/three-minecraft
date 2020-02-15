import * as THREE from 'three';

import { Animal, AnimalRenderer, AnimalType } from "../../components/Animal";
import BoxCollider from "../../components/BoxCollider";
import WalkingArea from "../../components/WalkingArea";

import ASystem from '../../ecs/abstract/ASystem';
import ECSWrapper from "../../ecs/wrapper/ECSWrapper";
import IEntity from '../../ecs/interfaces/IEntity';
import ThreeSystem from '../ThreeSystem';

export default class AnimalSpawningSystem extends ASystem {

    private maxAnimalInGroup: number;
    private spawningAnimals: number;

    constructor(name: string) {
        super(name);

        this.maxAnimalInGroup = 4;
        this.spawningAnimals = 0;
    }

    onInit(): void {
        ECSWrapper.entities.applyToEach(["FirstPersonController"], (entity) => {
            const boxCollider: BoxCollider = entity.getComponent(BoxCollider);

            const playerPosition: THREE.Vector3 = new THREE.Vector3(boxCollider.position.x, boxCollider.position.y, boxCollider.position.z);
            this.spawnAnimalGroup(playerPosition);
        })
    }

    onUpdate(elapsedTime: number): void {
        const elapsedTimeAsSeconds: number = elapsedTime / 1000;


    }

    onClose() {

    }

    private spawnAnimalGroup(position: THREE.Vector3): void {
        const spawningNumber: number = Math.floor(Math.random() * this.maxAnimalInGroup) + 1;
        const spawningZones: THREE.Vector3[] = this.generateSpawningZones(position, spawningNumber);

        for (let i = 0; i < spawningNumber; i++) {
            const animalId: string = `Animal${this.spawningAnimals}`;
            ECSWrapper.entities.create(animalId);

            const newAnimalEntity: IEntity = ECSWrapper.entities.getByName(animalId)[0];

            // TODO RANDOMIZE ANIMAL TYPE
            newAnimalEntity.assignComponent<Animal>(new Animal(newAnimalEntity, AnimalType.PIG));

            const animalComponent: Animal = newAnimalEntity.getComponent(Animal);

            animalComponent.position = spawningZones[i];

            const playerEntity: IEntity = ECSWrapper.entities.getByName("Player")[0];
            newAnimalEntity.assignComponent<BoxCollider>(new BoxCollider(
                newAnimalEntity,
                spawningZones[i],
                new THREE.Vector3(1, 1, 1),
                10
            ));

            //newAnimalEntity.getComponent(BoxCollider).position.set()

            newAnimalEntity.assignComponent<WalkingArea>(new WalkingArea(newAnimalEntity));

            ECSWrapper.systems.get(ThreeSystem).getScene().add(animalComponent.mesh);
            this.spawningAnimals++;
        }
    }

    private generateSpawningZones(intialPosition: THREE.Vector3, spawningNumber: number): THREE.Vector3[] {
        const spawningZones: THREE.Vector3[] = [];
        const xRange: {xMin: number, xMax: number} = {
            xMin: intialPosition.x - 5,
            xMax: intialPosition.y + 5
        };
        const zRange: {zMin: number, zMax: number} = {
            zMin: intialPosition.z - 5,
            zMax: intialPosition.z + 5
        };

        for (let i = 0; i < spawningNumber; i++) {
            const xPosition: number = Math.floor(Math.random() * xRange.xMin) + xRange.xMax;
            const zPosition: number = Math.floor(Math.random() * zRange.zMin) + zRange.zMax;

            const positionVector: THREE.Vector3 = new THREE.Vector3(xPosition, intialPosition.y, zPosition);
            spawningZones.push(positionVector);
        }
        return spawningZones;
    }
}