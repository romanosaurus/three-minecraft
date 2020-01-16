import { PhysicsSystem, PhysicsObject } from "../utils/PhysicsSystem";
import * as THREE from 'three';
import * as CANNON from 'cannon';

export interface BoxOptions {
    name: string,
    x: number,
    y: number,
    z: number
    width: number,
    height: number,
    depth: number,
    color: number,
    rigid: boolean,
    mass: number
}

export class Box extends PhysicsObject {
    private readonly geometry : THREE.BoxGeometry;
    private readonly material : THREE.MeshBasicMaterial;
    public readonly mesh : THREE.Mesh;
    public readonly body : CANNON.Body;

    constructor(options : BoxOptions) {
        super();

        this.name = options.name;
        this.geometry = new THREE.BoxGeometry(
            options && options.width || 1,
            options && options.height || 1,
            options && options.depth || 1
        );
        this.material = new THREE.MeshBasicMaterial(
            { color: options.color, wireframe: true }
        );
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(
            options && options.x || 0,
            options && options.y || 0,
            options && options.z || 0
        );

        let boxShape : CANNON.Box = new CANNON.Box(new CANNON.Vec3(
            this.geometry.parameters.width / 2,
            this.geometry.parameters.height / 2,
            this.geometry.parameters.depth / 2
        ));

        if (options && options.rigid) {
            this.body = new CANNON.Body({mass: options && options.mass || 0 });
        } else {
            this.body = new CANNON.Body({mass: options && options.mass || 0 });
        }

        this.body.addShape(boxShape);
        this.body.position.set(
            this.mesh.position.x,
            this.mesh.position.y,
            this.mesh.position.z
        );
    }

    public Update() {
        this.mesh.position.copy(this.body.position as any);
        this.mesh.quaternion.copy(this.body.quaternion as any);
    }
}
