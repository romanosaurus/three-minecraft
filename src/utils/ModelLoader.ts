import * as THREE from 'three';
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { MtlObjBridge} from "three/examples/jsm/loaders/obj2/bridge/MtlObjBridge"

export default class ModelLoader
{
    private objLoader: OBJLoader2;
    private textureLoader: MTLLoader;

    constructor()
    {
        this.objLoader = new OBJLoader2();
        this.textureLoader = new MTLLoader();
    }

    public load(modelName: string, texturePath: string)
    {
        return this.textureLoader.load(texturePath, (materials) => {
            const mat = MtlObjBridge.addMaterialsFromMtlLoader(materials);
            this.objLoader.addMaterials(mat, false);
            this.objLoader.load(modelName, function(object) {
            }, onprogress, onerror);
        });
    }
}
