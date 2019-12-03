import * as THREE from 'three';

export default class LightningUtilities
{
    public static AddLight(scene, x, y, z, color=0xFFFFFF)
    {
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);

        light.position.set(x, y, z);

        scene.add(light);
    }
}
