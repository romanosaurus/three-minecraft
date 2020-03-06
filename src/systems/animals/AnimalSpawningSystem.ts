import * as THREE from 'three';

import {Animal, AnimalType} from "../../components/Animal";
import BoxCollider from "../../components/BoxCollider";
import WalkingArea from "../../components/WalkingArea";

import ASystem from '../../ecs/abstract/ASystem';
import ECSWrapper from "../../ecs/wrapper/ECSWrapper";
import IEntity from '../../ecs/interfaces/IEntity';
import ThreeSystem from '../ThreeSystem';
import Model from '../../components/Model';
import ParticleSystem from "../../components/ParticleSystem";

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
            newAnimalEntity.assignComponent<Animal>(new Animal(newAnimalEntity, i % 2));

            const animalComponent: Animal = newAnimalEntity.getComponent(Animal);

            if (animalComponent.type === AnimalType.PIG)
                newAnimalEntity.assignComponent<Model>(new Model(newAnimalEntity, "pig", "../../assets/models/pig/pig.obj", "../../assets/models/pig/pig.mtl"));
            else if (animalComponent.type === AnimalType.SHEEP)
                newAnimalEntity.assignComponent<Model>(new Model(newAnimalEntity, "sheep", "../../assets/models/sheep/sheep.obj", "../../assets/models/sheep/sheep.mtl"));

            const animalModel: Model = newAnimalEntity.getComponent(Model);
            animalModel.getObject().then((object) => {
                object.position.x = spawningZones[i].x;
                object.position.y = spawningZones[i].y;
                object.position.z = spawningZones[i].z;
                object.traverse(o => {
                    if (o.isMesh) {
                        o.material.map.magFilter = THREE.NearestFilter;
                        o.material.map.minFilter = THREE.LinearMipMapLinearFilter;
                    }
                })
                ECSWrapper.systems.get(ThreeSystem).getScene().add(object)
            });

            if (animalComponent.type === AnimalType.PIG)
                newAnimalEntity.assignComponent<BoxCollider>(new BoxCollider(
                    newAnimalEntity,
                    spawningZones[i],
                    new THREE.Vector3(1, 2, 2),
                    10,
                    {x: 0, y: -0.2, z: 0}
                ));
            else
                newAnimalEntity.assignComponent<BoxCollider>(new BoxCollider(
                    newAnimalEntity,
                    spawningZones[i],
                    new THREE.Vector3(1, 2, 2),
                    10,
                    {x: 0, y: 0.2, z: 0}
                ));

            newAnimalEntity.assignComponent<WalkingArea>(new WalkingArea(newAnimalEntity));
            /*newAnimalEntity.assignComponent<ParticleSystem>(new ParticleSystem(
                newAnimalEntity,
                10,
                {color: 0xFFFFFF, size: 1, image: "../../assets/ui/heart.png"},
                new THREE.Vector3(spawningZones[i].x - 5, spawningZones[i].y - 5, spawningZones[i].z - 5),
                new THREE.Vector3(spawningZones[i].x + 5, spawningZones[i].y + 5, spawningZones[i].z + 5)
            ));*/
            //newAnimalEntity.getComponent(ParticleSystem).bodyToFollow = newAnimalEntity.getComponent(BoxCollider).body;
            this.spawningAnimals++;
        }
    }

    private generateSpawningZones(initialPosition: THREE.Vector3, spawningNumber: number): THREE.Vector3[] {
        const spawningZones: THREE.Vector3[] = [];
        const xRange: {xMin: number, xMax: number} = {
            xMin: initialPosition.x - 5,
            xMax: initialPosition.x + 5
        };
        const zRange: {zMin: number, zMax: number} = {
            zMin: initialPosition.z - 5,
            zMax: initialPosition.z + 5
        };

        for (let i = 0; i < spawningNumber; i++) {
            const xPosition: number = Math.floor(Math.random() * (+xRange.xMax - +xRange.xMin)) + +xRange.xMin;
            const zPosition: number = Math.floor(Math.random() * (+zRange.zMax - +zRange.zMin)) + +zRange.zMin;

            const positionVector: THREE.Vector3 = new THREE.Vector3(xPosition, initialPosition.y, zPosition);
            spawningZones.push(positionVector);
        }
        return spawningZones;
    }
}
