import Vector3D from "../maths/Vector3D";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import Transform from "../components/Transform";
import Light from "../components/misc/Light";

class LightFactory {
    private _lightNumber = 0;

    public createLight(intensity: number, color: number, position: Vector3D) {
        const id = `Light${this._lightNumber}`;
        ECSWrapper.entities.create(`Light${this._lightNumber}`);

        const light = ECSWrapper.entities.getByName(id)[0];
        light.assignComponent<Transform>(new Transform(light));
        light.assignComponent<Light>(new Light(light, color));

        light.getComponent(Transform).position = position;

        this._lightNumber++;
    }
}

export default new LightFactory;