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
import Chunk from "../../utils/Chunk";
import Utilities from "../../utils/Utilities";

export default class AnimalSpawningSystem extends ASystem {

    private readonly maxAnimalInGroup: number;
    private spawningAnimals: number;

    constructor(name: string) {
        super(name);

        this.maxAnimalInGroup = 4;
        this.spawningAnimals = 0;
    }

    onInit(): void {
        this.registerEvent("newChunk", (event: any) => {
            const chunk: Chunk = event.detail;
            const animalSpawnArea: THREE.Vector3 = new THREE.Vector3(
                chunk.getWidthOffset() * chunk.getMeshSize(),
                50,
                chunk.getHeightOffset() * chunk.getMeshSize()
            );
            if (chunk.getWidthOffset() % 2)
                this.spawnAnimalGroup(animalSpawnArea)
        });

    }

    onUpdate(elapsedTime: number): void {
        const elapsedTimeAsSeconds: number = elapsedTime / 1000;
        const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();

        // Remove from scene animals who are outside of the player radius
        ECSWrapper.entities.applyToEach(["FirstPersonController"], (entity) => {
            const playerPosition: CANNON.Vec3 = entity.getComponent(BoxCollider).body.position;
            ECSWrapper.entities.applyToEach(["Animal"], (animal: IEntity) => {
                const animalPosition: CANNON.Vec3 = animal.getComponent(BoxCollider).body.position;

                if (Utilities.vectorCollide(playerPosition, animalPosition, 60)) {
                    if (!scene.getObjectByName(animal.getName())) {
                        animal.getComponent(Animal).speed = 2;
                        animal.getComponent(BoxCollider).body.mass = 10;
                        animal.getComponent(WalkingArea).enable();
                        animal.getComponent(Model).getObject().then((obj) => {
                            if (animal.getComponent(ParticleSystem).isEnable())
                                scene.add(animal.getComponent(ParticleSystem).particleEmitter)
                            scene.add(obj);
                        });
                    }

                } else {
                    if (scene.getObjectByName(animal.getName())) {
                        animal.getComponent(Animal).speed = 0;
                        animal.getComponent(BoxCollider).body.mass = 0;
                        animal.getComponent(WalkingArea).disable();
                        animal.getComponent(Model).getObject().then((obj) => {
                            if (animal.getComponent(ParticleSystem).isEnable())
                                scene.remove(animal.getComponent(ParticleSystem).particleEmitter)
                            scene.remove(obj);
                        });
                    }
                }
            });
        });
    }

    onClose() {

    }

    private spawnAnimalGroup(position: THREE.Vector3): void {
        const spawningNumber: number = Math.floor(Math.random() * this.maxAnimalInGroup) + 1;
        const spawningZones: THREE.Vector3[] = AnimalSpawningSystem.generateSpawningZones(position, spawningNumber);

        for (let i = 0; i < spawningNumber; i++) {
            const animalId: string = `Animal${this.spawningAnimals}`;
            ECSWrapper.entities.create(animalId);

            const newAnimalEntity: IEntity = ECSWrapper.entities.getByName(animalId)[0];

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
                });
                object.name = animalId;
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

            newAnimalEntity.assignComponent<WalkingArea>(new WalkingArea(newAnimalEntity, 2));
            newAnimalEntity.assignComponent<ParticleSystem>(new ParticleSystem(
                newAnimalEntity,
                10,
                {color: 0xFFFFFF, size: 1, image: "../../assets/ui/heart.png"},
                new THREE.Vector3(spawningZones[i].x - 5, spawningZones[i].y - 5, spawningZones[i].z - 5),
                new THREE.Vector3(spawningZones[i].x + 5, spawningZones[i].y + 5, spawningZones[i].z + 5)
            ));
            newAnimalEntity.getComponent(ParticleSystem).bodyToFollow = newAnimalEntity.getComponent(BoxCollider).body;

            newAnimalEntity.getComponent(ParticleSystem).disable();

            this.spawningAnimals++;
        }
    }

    public spawnBaby(position: THREE.Vector3, type: AnimalType) {
        const animalId: string = `Baby${this.spawningAnimals}`;
        ECSWrapper.entities.create(animalId);

        const newAnimalEntity: IEntity = ECSWrapper.entities.getByName(animalId)[0];

        newAnimalEntity.assignComponent<Animal>(new Animal(newAnimalEntity, type));

        const animalComponent: Animal = newAnimalEntity.getComponent(Animal);

        if (animalComponent.type === AnimalType.PIG)
            newAnimalEntity.assignComponent<Model>(new Model(newAnimalEntity, "pig", "../../assets/models/pig/pig.obj", "../../assets/models/pig/pig.mtl"));
        else if (animalComponent.type === AnimalType.SHEEP)
            newAnimalEntity.assignComponent<Model>(new Model(newAnimalEntity, "sheep", "../../assets/models/sheep/sheep.obj", "../../assets/models/sheep/sheep.mtl"));

        const animalModel: Model = newAnimalEntity.getComponent(Model);
        animalModel.getObject().then((object) => {
            object.position.x = position.x + 2;
            object.position.y = position.y;
            object.position.z = position.z;
            object.scale.x /= 2;
            object.scale.y /= 2;
            object.scale.z /= 2;
            object.traverse(o => {
                if (o.isMesh) {
                    o.material.map.magFilter = THREE.NearestFilter;
                    o.material.map.minFilter = THREE.LinearMipMapLinearFilter;
                }
            });
            object.name = animalId;
        });

        if (type === AnimalType.PIG)
            newAnimalEntity.assignComponent<BoxCollider>(new BoxCollider(
                newAnimalEntity,
                new THREE.Vector3(position.x + 2, position.y, position.z),
                new THREE.Vector3(1, 1, 1),
                10,
                {x: 0, y: -0.2, z: 0}
            ));
        else
            newAnimalEntity.assignComponent<BoxCollider>(new BoxCollider(
                newAnimalEntity,
                new THREE.Vector3(position.x + 2, position.y, position.z),
                new THREE.Vector3(1, 1, 1),
                10,
                {x: 0, y: 0.2, z: 0}
            ));

        newAnimalEntity.assignComponent<WalkingArea>(new WalkingArea(newAnimalEntity, 2));
        newAnimalEntity.assignComponent<ParticleSystem>(new ParticleSystem(
            newAnimalEntity,
            10,
            {color: 0xFFFFFF, size: 1, image: "../../assets/ui/heart.png"},
            new THREE.Vector3(position.x - 3, position.y - 5, position.z - 5),
            new THREE.Vector3(position.x + 3, position.y + 5, position.z + 5)
        ));
        newAnimalEntity.getComponent(ParticleSystem).bodyToFollow = newAnimalEntity.getComponent(BoxCollider).body;

        newAnimalEntity.getComponent(ParticleSystem).disable();

        this.spawningAnimals++;
        console.log('new baby');
    }

    private static generateSpawningZones(initialPosition: THREE.Vector3, spawningNumber: number): THREE.Vector3[] {
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

    get animalAmount(): number {
        return this.spawningAnimals;
    }
}