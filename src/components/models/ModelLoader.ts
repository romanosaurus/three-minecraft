import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

export default class ModelLoader
{
    private objLoader: OBJLoader;
    private textureLoader: MTLLoader;

    constructor()
    {
        this.objLoader = new OBJLoader();
        this.textureLoader = new MTLLoader();
    }

    public load(modelName: string, texturePath: string, scene: THREE.Scene)
    {
        this.textureLoader.load(texturePath, (materials) => {
            materials.preload();
            this.objLoader.setMaterials(materials);
            this.objLoader.load(modelName, function(object) {
                object.scale.x = 0.2;
                object.scale.y = 0.2;
                object.scale.z = 0.2;

                object.position.y = 20;
                scene.add(object);
            }, onprogress, onerror);
        });
    }

    p
}
