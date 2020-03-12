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

        this._size = 4 * size;
        this._thickness = size;
        this.createTree();
    }

    private createTree() {
        //create tree here
        let counter: number = 0;
        const startX: number = 150;
        const startZ: number = 50;
        const startY: number = 110;

        const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({color: 'brown'});
        
        for (let y = 0; y < this._thickness; y++) {
          for (let z = 0; z < this._size; z++) {
            for (let x = 0; x < this._thickness; x++) {
              const mesh = new THREE.Mesh(geometry, material);
              mesh.position.set(x + startX, z + startZ, y + startY);
              this._meshArray.push(mesh);
            }
          }
        }
        //feuillage
        const materialLeaf = new THREE.MeshPhongMaterial({color: 'green'});

        for (let y = 0; y < (this._thickness + 4 * this._thickness); y++) {
          for (let z = 0; z < this._thickness; z++) {
            for (let x = 0; x < (this._thickness + 4 * this._thickness); x++) {
              const mesh = new THREE.Mesh(geometry, materialLeaf);
              mesh.position.set((x + startX) - (this._thickness * 2), z + startZ + this._size, (y + startY) - (this._thickness * 2));
              this._meshArray.push(mesh);
            }
          }
        }
        for (let y = 0; y < (this._thickness + 2 * this._thickness); y++) {
          for (let z = 0; z < this._thickness; z++) {
            for (let x = 0; x < (this._thickness + 2 * this._thickness); x++) {
              const mesh = new THREE.Mesh(geometry, materialLeaf);
              mesh.position.set((x + startX) - (this._thickness), z + startZ + this._size + this._thickness, (y + startY) - (this._thickness));
              this._meshArray.push(mesh);
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