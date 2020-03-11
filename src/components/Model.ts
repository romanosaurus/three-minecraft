import * as THREE from 'three';
import AComponent from '../ecs/abstract/AComponent';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import IEntity from '../ecs/interfaces/IEntity';


export default class Model extends AComponent {
    private _objLoader: OBJLoader;
    private _materialLoader: MTLLoader;

    private _objPath: string;
    private _mtlPath: string;
    private _name: string;

    private _mesh;

    constructor(entity: IEntity, name: string, objPath: string, mtlPath: string)
    {
        super(entity);
        this._name = name;
        this._objPath = objPath;
        this._mtlPath = mtlPath;

        this._objLoader = new OBJLoader();
        this._materialLoader = new MTLLoader();
        this._mesh = this.load();
    }

    private load()
    {
        return new Promise((resolve, reject) => {
            this._materialLoader.load(this._mtlPath, async (materials) => {
                materials.preload();
                this._objLoader.setMaterials(materials);
                this._objLoader.load(this._objPath, resolve, onprogress, reject);
            }, onprogress, reject);
        });
    }

    public getObject()
    {
        return this._mesh;
    }

}