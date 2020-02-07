import { expose } from "threads/worker";
import MeshContainer from "../utils/MeshContainer";
import MyMesh from "../utils/Mesh";
import Voxel from "../components/Voxel";
import PerlinGenerator from "../utils/PerlinGenerator";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "../systems/ThreeSystem";

expose({
    test(lol: any) {
        let test = PerlinGenerator.fromData(JSON.parse(lol));
        console.log(test.getWidth());
    },
    testGenerate(playerPosition : CANNON.Vec3) {
        const ecsWrapper: ECSWrapper = ECSWrapper.getInstance();
        let scene = ecsWrapper.systemManager.getSystem(ThreeSystem).getScene();
        ecsWrapper.entityManager.getEntity("world").getComponent(Voxel).updateMesh(playerPosition, scene);
    },
    generate(playerPosition: CANNON.Vec3, meshArray: any, cellSize: number, generator: any) {
        let castedGenerator = PerlinGenerator.fromData(JSON.parse(generator));

        let currentHeightPos = Math.floor(playerPosition.z / cellSize);
        let currentWidthPos = Math.floor(playerPosition.x / cellSize);
        let drawed = [];

        let toReturnMesh = [];
        let toAddToScene = [];
        for (let height = currentHeightPos - 1; height <= currentHeightPos + 1; height++) {
            for (let width = currentWidthPos - 1; width <= currentWidthPos + 1; width++) {
                const id : string = width + ',0,' + height;
                const container = meshArray[id];
                if (container && !meshArray[id].isDrawed) {
                    //scene.add(container.drawedMesh);
                    meshArray[id].isDrawed = true;
                    toAddToScene.push(id);
                }
                if (!container) {
                    const mesh : MyMesh = new MyMesh(cellSize, height, width, castedGenerator);
                    toReturnMesh.push(mesh);
                    //voxelComponent.displayVoxelWorld(scene, mesh);
                }
                drawed.push(id);
            }
        }
        //delete to scene all drawed stuff that isn't in drawed
        //meshContainer.deleteToSceneUselessDrawing(scene, drawed);
        return { toReturnMesh, meshArray , drawed, toAddToScene};
    }
});
