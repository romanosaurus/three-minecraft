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
import AudioSource from '../../components/audio/AudioSource';
import Audio, { AudioState } from '../../components/audio/Audio';
import Camera from '../../components/Camera';
import WalkingPhysicsSystem from '../WalkingPhysicsSystem';
import CannonSystem from '../CannonSystem';
import Transform from '../../components/Transform';
import Vector3D from '../../maths/Vector3D';
import Controller from '../../components/controllers/Controller';
import Rigidbody from '../../components/physics/Rigidbody';
import AnimalFactory from '../../factories/AnimalFactory';

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
            const animalSpawnArea = new Vector3D(
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
        const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();

        // Remove from scene animals who are outside of the player radius
        ECSWrapper.entities.applyToEach(["FirstPersonController"], (entity) => {
            const playerPosition = entity.getComponent(Transform).position;
            ECSWrapper.entities.applyToEach(["Animal"], (animal: IEntity) => {
                const animalPosition = animal.getComponent(Transform).position;

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
                        if (number > 70 && number < 80 && !pigSound.sound.isPlaying) {
                            pigSound.sound.play();
                        }
                    } else if (animal.getComponent(Animal).type === AnimalType.SHEEP) {
                        const sheepSound = ECSWrapper.entities.getByName("sheepSound")[0].getComponent(Audio);
                        let number = THREE.MathUtils.randInt(1, 10000);
                        if (number > 70 && number < 80 && !sheepSound.sound.isPlaying) {
                            sheepSound.sound.play();
                        }
                    }
                }
            });
        });
    }

    onClose() {

    }

    private spawnAnimalGroup(position: Vector3D): void {
        const spawningNumber: number = Math.floor(Math.random() * this.maxAnimalInGroup) + 1;
        const spawningZones: Vector3D[] = AnimalSpawningSystem.generateSpawningZones(position, spawningNumber);

        for (let i = 0; i < spawningNumber; i++) {
            AnimalFactory.createAnimal(i % 2, spawningZones[i]);
        }

    }

    public spawnBaby(position: Vector3D, type: AnimalType) {
        AnimalFactory.createAnimal(type, position, true);
    }

    private static generateSpawningZones(initialPosition: Vector3D, spawningNumber: number): Vector3D[] {
        const spawningZones: Vector3D[] = [];
        const xRange: {xMin: number, xMax: number} = {
            xMin: initialPosition.x - 5,
            xMax: initialPosition.x + 5
        };
        const zRange: {zMin: number, zMax: number} = {
            zMin: initialPosition.z - 5,
            zMax: initialPosition.z + 5
        };

        for (let i = 0; i < spawningNumber; i++) {
            const xPosition = Math.floor(Math.random() * (+xRange.xMax - +xRange.xMin)) + +xRange.xMin;
            const zPosition = Math.floor(Math.random() * (+zRange.zMax - +zRange.zMin)) + +zRange.zMin;

            const positionVector = new Vector3D(xPosition, initialPosition.y, zPosition);
            spawningZones.push(positionVector);
        }
        return spawningZones;
    }

    get animalAmount(): number {
        return this.spawningAnimals;
    }
}
