import * as THREE from 'three';
import * as CANNON from 'cannon';

export class PhysicsObject {
    public ID : number;
    public name : string;

    public mesh : THREE.Mesh;
    public body : CANNON.Body;

    public Update() {

    }
}

export class PhysicsSystem {
    static itemID : number = 0;
    static items : Array<PhysicsObject> = [];

    public AddPhysicsObject(object : PhysicsObject) : void
    {
        object.ID = PhysicsSystem.itemID;

        PhysicsSystem.items[object.ID] = object;

        console.log("Physic Object #" + PhysicsSystem.itemID + " created.");

        PhysicsSystem.itemID++;
    }

    public GetPhysicsObject(id : number) : PhysicsObject {
        return PhysicsSystem.items[id];
    }

    public Update() {
        for (let item of PhysicsSystem.items) {
            item.Update();
        }
    }
}
