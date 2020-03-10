import * as THREE from 'three';

/**
 * @class LightUtilities used to add light
 */
export default class LightUtilities
{
    /**
     * static member funciton used to add light to the scene
     * @param scene : the THREE.Scene where you want to add the ligth
     * @param x : the the x position where you wantto set the light
     * @param y : the the y position where you wantto set the light
     * @param z : the the z position where you wantto set the light
     * @param color OPTIONNAL PARAMETER : the color that you want ot set to the light. By default, 0xFFFFFF
     */
    public static AddLight(scene, x, y, z, color=0xFFFFFF)
    {
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);

        light.position.set(x, y, z);

        scene.add(light);
    }
}
