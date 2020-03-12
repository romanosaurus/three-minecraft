import * as THREE from "three";
import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import IEntity from "../ecs/interfaces/IEntity";
import Tree from "../components/Tree";

export default class NatureSystem extends ASystem {
    private _threeNumber: number;

    constructor(name: string) {
        super(name);
        this._threeNumber = 1;
    }

    onInit() {
        const scene: THREE.Scene = ECSWrapper.systems.get(ThreeSystem).getScene();

//        this.createThree(scene);
    }

    onUpdate(elapsedTime: number) {
    }

    onClose() {

    }
    private createThree(scene : THREE.Scene) {
        ECSWrapper.entities.create(`Tree`);
            const treeEntity: IEntity = ECSWrapper.entities.getByName(`Tree`)[0];
            treeEntity.assignComponent<Tree>(new Tree(treeEntity, 1));
            treeEntity.getComponent(Tree).addToScene(scene);
    }
}