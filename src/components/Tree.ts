import * as THREE from "three";

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

export default class Tree extends AComponent {
    private _size : number;
    private _thickness : number;

    //tmp variable to delete
    private _meshArray : any = [];

    constructor(entity: IEntity, size : number) {
        super(entity);

        this._size = 3 * size;
        this._thickness = size;
        this.createTree();
    }

    private createTree() {
        //create tree here
        let counter: number = 0;
        const startX: number = 0;
        const startZ: number = 0;
        const startY: number = 100;

        const cell = new Uint8Array(this._size * this._size * this._size);
        cell.fill(1);

        const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({color: 'brown'});
        
        for (let y = 0; y < this._thickness; y++) {
          for (let z = 0; z < this._size; z++) {
            for (let x = 0; x < this._thickness; x++) {
              const offset = y * this._thickness * this._thickness +
                          z * (this._size === 3 ? 1 : this._size) + x;
              const block = cell[offset];
              if (block) {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x + 150, z + 50, y + 110);
                this._meshArray.push(mesh);
              }
            }
          }
        }
    }
    public addToScene(scene : THREE.Scene) {
        this._meshArray.forEach(element => {
            console.log("adding to scene");
            scene.add(element);
        });
    }
}