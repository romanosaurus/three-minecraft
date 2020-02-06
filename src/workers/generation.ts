import { expose } from "threads/worker";
import MeshContainer from "../utils/MeshContainer";
import MyMesh from "../utils/Mesh";
import Voxel from "../components/Voxel";
import PerlinGenerator from "../utils/PerlinGenerator";

expose({
    test(lol: any) {
        console.log(lol);
    },
    generate(playerPosition: CANNON.Vec3, meshArray: any, cellSize: number, generator: PerlinGenerator) {
        let currentHeightPos = Math.floor(playerPosition.z / cellSize);
        let currentWidthPos = Math.floor(playerPosition.x / cellSize);
        let drawed = [];

        let toReturnMesh = [];
        for (let height = currentHeightPos - 1; height <= currentHeightPos + 1; height++) {
            for (let width = currentWidthPos - 1; width <= currentWidthPos + 1; width++) {
                const id : string = width + ',0,' + height;
                const container = meshArray[id];
                if (container && !meshArray[id].isDrawed) {
                    //scene.add(container.drawedMesh);
                    meshArray[id].isDrawed = true;
                }
                if (!container) {
                    const mesh : MyMesh = new MyMesh(cellSize, height, width, generator);
                    console.log(mesh);
                    toReturnMesh.push(mesh);
                    //voxelComponent.displayVoxelWorld(scene, mesh);
                }
                drawed.push(id);
            }
        }
        //delete to scene all drawed stuff that isn't in drawed
        //meshContainer.deleteToSceneUselessDrawing(scene, drawed);
        return { toReturnMesh, meshArray };
    }
});
