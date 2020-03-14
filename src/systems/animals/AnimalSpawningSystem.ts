import * as THREE from 'three';

import {Animal, AnimalType} from "../../components/Animal";
import BoxCollider from "../../components/physics/BoxCollider";
import WalkingArea from "../../components/WalkingArea";

import ASystem from '../../ecs/abstract/ASystem';
import ECSWrapper from "../../ecs/wrapper/ECSWrapper";
import IEntity from '../../ecs/interfaces/IEntity';
import ThreeSystem from '../ThreeSystem';
import Model from '../../components/Model';
import ParticleSystem from "../../components/ParticleSystem";
import Chunk from "../../utils/Chunk";
import Utilities from "../../utils/Utilities";
import AudioSource from '../../components/AudioSource';
import Audio, { AudioState } from '../../components/Audio';
import Camera from '../../components/Camera';
import WalkingPhysicsSystem from '../WalkingPhysicsSystem';
import CannonSystem from '../CannonSystem';
import Transform from '../../components/Transform';
import Vector3D from '../../maths/Vector3D';
import Controller from '../../components/controllers/Controller';
import Rigidbody from '../../components/physics/RigidBody';

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
        ECSWrapper.entities.create("pigSound");
        const pigSoundEntity = ECSWrapper.entities.getByName("pigSound")[0];
        pigSoundEntity.assignComponent<AudioSource>(new AudioSource(pigSoundEntity));
        ECSWrapper.entities.getByName('Player')[0].getComponent(Camera).camera.add(pigSoundEntity.getComponent(AudioSource).listener);
        pigSoundEntity.assignComponent<Audio>(new Audio(pigSoundEntity, {
            listener: pigSoundEntity.getComponent(AudioSource).listener,
            path: "../../../assets/sound/minecraft-sound-effects-pig-sound-effects.ogg",
            loop: false,
            volume: 1
        }));
        pigSoundEntity.getComponent(Audio).state = AudioState.SOUND;

        ECSWrapper.entities.create("sheepSound");
        const sheepSoundEntity = ECSWrapper.entities.getByName("sheepSound")[0];
        sheepSoundEntity.assignComponent<AudioSource>(new AudioSource(sheepSoundEntity));
        ECSWrapper.entities.getByName('Player')[0].getComponent(Camera).camera.add(sheepSoundEntity.getComponent(AudioSource).listener);
        sheepSoundEntity.assignComponent<Audio>(new Audio(sheepSoundEntity, {
            listener: sheepSoundEntity.getComponent(AudioSource).listener,
            path: "../../../assets/sound/minecraft-sheep-sound-affect.ogg",
            loop: false,
            volume: 1
        }));
        sheepSoundEntity.getComponent(Audio).state = AudioState.SOUND;
    }

    onUpdate(elapsedTime: number): void {
        const elapsedTimeAsSeconds: number = elapsedTime / 1000;
        const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();

        // Remove from scene animals who are outside of the player radius
        ECSWrapper.entities.applyToEach(["FirstPersonController"], (entity) => {
            const playerPosition: CANNON.Vec3 = entity.getComponent(Rigidbody).skeleton.position;
            ECSWrapper.entities.applyToEach(["Animal"], (animal: IEntity) => {
                const animalPosition: CANNON.Vec3 = animal.getComponent(Rigidbody).skeleton.position;

                if (Utilities.vectorCollide(playerPosition, animalPosition, 60)) {
                    animal.getComponent(Controller).speed = 2;
                    ECSWrapper.systems.get(CannonSystem).world.addBody(animal.getComponent(Rigidbody).skeleton)
                    ECSWrapper.systems.get(WalkingPhysicsSystem).setWalkingArea(animal.getComponent(WalkingArea), true);
                    if (!scene.getObjectByName(animal.getName())) {
                        animal.getComponent(Model).getObject().then((obj) => {
                            if (animal.getComponent(ParticleSystem).isEnable())
                                scene.add(animal.getComponent(ParticleSystem).particleEmitter)
                            scene.add(obj);
                        });
                    }
                } else {
                    animal.getComponent(Controller).speed = 0;
                    ECSWrapper.systems.get(CannonSystem).world.remove(animal.getComponent(Rigidbody).skeleton)
                    ECSWrapper.systems.get(WalkingPhysicsSystem).setWalkingArea(animal.getComponent(WalkingArea), false);
                    if (scene.getObjectByName(animal.getName())) {
                        animal.getComponent(Model).getObject().then((obj) => {
                            if (animal.getComponent(ParticleSystem).isEnable())
                                scene.remove(animal.getComponent(ParticleSystem).particleEmitter)
                            scene.remove(obj);
                        });
                    }
                }

                // playing sound of animal
                if (Utilities.vectorCollide(playerPosition, animalPosition, 30)) {
                    if (animal.getComponent(Animal).type === AnimalType.PIG) {
                        const pigSound = ECSWrapper.entities.getByName("pigSound")[0].getComponent(Audio);
                        let number = THREE.MathUtils.randInt(1, 10000);
                        if (number > 70 && number < 80) {
                            pigSound.sound.play();
                        }
                    } else if (animal.getComponent(Animal).type === AnimalType.SHEEP) {
                        const sheepSound = ECSWrapper.entities.getByName("sheepSound")[0].getComponent(Audio);
                        let number = THREE.MathUtils.randInt(1, 10000);
                        if (number > 70 && number < 80) {
                            sheepSound.sound.play();
                        }
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

            newAnimalEntity.assignComponent<Controller>(new Controller(newAnimalEntity, 2));
            newAnimalEntity.assignComponent<Transform>(new Transform(newAnimalEntity));
            newAnimalEntity.getComponent(Transform).position = new Vector3D(spawningZones[i].x, spawningZones[i].y, spawningZones[i].z);

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

            if (animalComponent.type === AnimalType.PIG) {
                newAnimalEntity.assignComponent<Rigidbody>(new Rigidbody(newAnimalEntity, 10));
                newAnimalEntity.assignComponent<BoxCollider>(new BoxCollider(newAnimalEntity, new Vector3D(1, 2, 2), new Vector3D(0, -0.2, 0)));
            } else {
                newAnimalEntity.assignComponent<Rigidbody>(new Rigidbody(newAnimalEntity, 10));
                newAnimalEntity.assignComponent<BoxCollider>(new BoxCollider(newAnimalEntity, new Vector3D(1, 2, 2), new Vector3D(0, 0.2, 0)));
            }

            newAnimalEntity.assignComponent<WalkingArea>(new WalkingArea(newAnimalEntity, 2));
            newAnimalEntity.assignComponent<ParticleSystem>(new ParticleSystem(
                newAnimalEntity,
                10,
                {color: 0xFFFFFF, size: 1, image: "../../assets/ui/heart.png"},
                new THREE.Vector3(spawningZones[i].x - 5, spawningZones[i].y - 5, spawningZones[i].z - 5),
                new THREE.Vector3(spawningZones[i].x + 5, spawningZones[i].y + 5, spawningZones[i].z + 5)
            ));
            newAnimalEntity.getComponent(ParticleSystem).bodyToFollow = newAnimalEntity.getComponent(Rigidbody).skeleton;

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

        newAnimalEntity.assignComponent<Controller>(new Controller(newAnimalEntity, 2));
        newAnimalEntity.assignComponent<Transform>(new Transform(newAnimalEntity));
        newAnimalEntity.getComponent(Transform).position = new Vector3D(position.x + 2, position.y, position.z);
        newAnimalEntity.getComponent(Transform).scale.x /= 2;
        newAnimalEntity.getComponent(Transform).scale.y /= 2;
        newAnimalEntity.getComponent(Transform).scale.z /= 2;

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

        if (animalComponent.type === AnimalType.PIG) {
            newAnimalEntity.assignComponent<Rigidbody>(new Rigidbody(newAnimalEntity, 10));
            newAnimalEntity.assignComponent<BoxCollider>(new BoxCollider(newAnimalEntity, new Vector3D(1, 2, 2), new Vector3D(0, -0.2, 0)));
        } else {
            newAnimalEntity.assignComponent<Rigidbody>(new Rigidbody(newAnimalEntity, 10));
            newAnimalEntity.assignComponent<BoxCollider>(new BoxCollider(newAnimalEntity, new Vector3D(1, 2, 2), new Vector3D(0, 0.2, 0)));
        }

        newAnimalEntity.assignComponent<WalkingArea>(new WalkingArea(newAnimalEntity, 2));
        newAnimalEntity.assignComponent<ParticleSystem>(new ParticleSystem(
            newAnimalEntity,
            10,
            {color: 0xFFFFFF, size: 1, image: "../../assets/ui/heart.png"},
            new THREE.Vector3(position.x - 3, position.y - 5, position.z - 5),
            new THREE.Vector3(position.x + 3, position.y + 5, position.z + 5)
        ));
        newAnimalEntity.getComponent(ParticleSystem).bodyToFollow = newAnimalEntity.getComponent(Rigidbody).skeleton;

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
