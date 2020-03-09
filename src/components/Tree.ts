import * as THREE from "three";

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";

export default class Tree extends AComponent {
    private _size : number;

    //tmp variable to delete
    private _meshArray : any = [];

    constructor(entity: IEntity, size : number) {
        super(entity);

        this._size = size;
        this.createTree();
    }

    private createTree() {
        //create tree here
        let counter: number = 0;
        const startX: number = 0;
        const startZ: number = 0;
        const startY: number = 100;

        const cell = new Uint8Array(3 * 3 * 3);
    
        for (let z = 0; z < this._size; z += 1) {
            cell[z] = 1;
        }

        const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({color: 'brown'});
         
        for (let y = 0; y < 3; ++y) {
          for (let z = 0; z < 3; ++z) {
            for (let x = 0; x < 3; ++x) {
              const offset = y * 3 * 3 +
                             z * 3 +
                             x;
              const block = cell[offset];
              if (block) {
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(x, y, z);
                this._meshArray.push(mesh);
//                scene.add(mesh);
              }
            }
          }
        }
    }
}