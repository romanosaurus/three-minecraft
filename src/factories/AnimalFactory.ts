import ECSWrapper from "../ecs/wrapper/ECSWrapper";

import Vector3D from "../maths/Vector3D";

import { AnimalType, Animal } from "../components/Animal";
import Model from "../components/Model";
import Controller from "../components/controllers/Controller";
import Transform from "../components/Transform";
import Rigidbody from "../components/physics/Rigidbody";
import BoxCollider from "../components/physics/BoxCollider";
import WalkingArea from "../components/WalkingArea";
import ParticleSystem from "../components/ParticleSystem";

interface Information {
    species: AnimalType,
    path: string,
    size: Vector3D,
    offset: Vector3D
}

const speciesInformation: Information[] = [
    { species: AnimalType.PIG, path: "../assets/models/pig/pig", size: new Vector3D(1, 2, 2),  offset: new Vector3D(0, -0.2, 0) },
    { species: AnimalType.SHEEP, path: "../assets/models/sheep/sheep", size: new Vector3D(1, 2, 2), offset: new Vector3D(0, 0.2, 0) }
];

const particlePath: string = "../../assets/ui/heart.png";

class AnimalFactory {
    private population: number = 0;

    public createAnimal(type: AnimalType, position: Vector3D, isBaby: boolean = false) {
        const animalInformations: Information = speciesInformation.filter((tuple) => type === tuple.species)[0];

        const animalID = `Animal${this.population}`;

        ECSWrapper.entities.create(animalID);
        const animalEntity = ECSWrapper.entities.getByName(animalID)[0];

        animalEntity.assignComponent<Animal>(new Animal(animalEntity, type));

        // Create Model
        animalEntity.assignComponent<Model>(new Model(animalEntity, animalID, `${animalInformations.path}.obj`, `${animalInformations.path}.mtl`));

        // Utils
        animalEntity.assignComponent<Controller>(new Controller(animalEntity, 1));
        animalEntity.assignComponent<Transform>(new Transform(animalEntity));

        const animalTransform = animalEntity.getComponent(Transform);

        animalTransform.position = position;
        if (isBaby)
            animalTransform.scale.set(0.5, 0.5, 0.5);

        // Physics
        animalEntity.assignComponent<Rigidbody>(new Rigidbody(animalEntity, 10));
        animalEntity.assignComponent<BoxCollider>(new BoxCollider(animalEntity, animalInformations.size, animalInformations.offset));
        animalEntity.assignComponent<WalkingArea>(new WalkingArea(animalEntity, 2));

        // Particles
        animalEntity.assignComponent<ParticleSystem>(new ParticleSystem(
            animalEntity,
            10,
            { color: 0xFFFFFF, size: 1, image: particlePath },
            new Vector3D(position.x - 5, position.y - 5, position.z - 5),
            new Vector3D(position.x + 5, position.y + 5, position.z + 5)
        ));
        animalEntity.getComponent(ParticleSystem).bodyToFollow = animalEntity.getComponent(Rigidbody).skeleton;
        animalEntity.getComponent(ParticleSystem).disable();

        this.population += 1;
    }
}

export default new AnimalFactory;