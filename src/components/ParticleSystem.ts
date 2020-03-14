import * as THREE from 'three';
import * as CANNON from 'cannon';

import AComponent from "../ecs/abstract/AComponent";
import IEntity from "../ecs/interfaces/IEntity";
import Vector3D from '../maths/Vector3D';

interface MaterialOptions {
    color: number,
    size: number,
    image?: string
}

class ParticleSystem extends AComponent {
    private _particles: THREE.Geometry;
    private _material: THREE.PointsMaterial;

    private _particleCount: number;

    private _particleEmitter: THREE.Points;

    private _bodyToFollow: CANNON.Body | null;

    constructor(entity: IEntity, particleCount: number, materialOptions: MaterialOptions, minimalPosition: THREE.Vector3 | Vector3D, maximumPosition: THREE.Vector3 | Vector3D) {
        super(entity);

        this._particles = new THREE.Geometry();

        if (!materialOptions.image)
            this._material = new THREE.PointsMaterial({
                color: materialOptions.color,
                size: materialOptions.size,
            });
        else {
            const textureLoader = new THREE.TextureLoader();

            this._material = new THREE.PointsMaterial({
                size: materialOptions.size,
                map: textureLoader.load(materialOptions.image),
                transparent: true,
            });
        }

        this._particleCount = particleCount;

        // Set vertices
        for (let particleIndex = 0; particleIndex < particleCount; particleIndex++) {
            const particlePosition = new THREE.Vector3(
                Math.floor(Math.random() * (maximumPosition.x - minimalPosition.x) + minimalPosition.x),
                Math.floor(Math.random() * (maximumPosition.y - minimalPosition.y) + minimalPosition.y),
                Math.floor(Math.random() * (maximumPosition.z - minimalPosition.z) + minimalPosition.z)
            );

            this._particles.vertices.push(particlePosition);
        }

        this._bodyToFollow = null;
        this._particleEmitter = new THREE.Points(this._particles, this._material);
    }

    get particlesCount(): number {
        return this._particleCount;
    }

    get particles(): THREE.Geometry {
        return this._particles;
    }

    get particleEmitter(): THREE.Points {
        return this._particleEmitter;
    }

    get bodyToFollow(): CANNON.Body | null {
        return this._bodyToFollow;
    }

    set bodyToFollow(newBody: CANNON.Body) {
        this._bodyToFollow = newBody;
    }
}

export default ParticleSystem;
