import * as THREE from 'three';

import ASystem from "../ecs/abstract/ASystem";
import ECSWrapper from "../ecs/wrapper/ECSWrapper";
import ThreeSystem from "./ThreeSystem";
import ParticleSystem from "../components/ParticleSystem";

class ParticleSystemManager extends ASystem {
    private currentTime = 0;

    onInit(): void {
        ECSWrapper.entities.applyToEach(["ParticleSystem"], (entity) => {
            ECSWrapper.systems.get(ThreeSystem).getScene().add(entity.getComponent(ParticleSystem).particleEmitter);
        });
    }

    onUpdate(elapsedTime: number): void {
        const elapsedTimeAsSeconds: number = elapsedTime / 1000;

        this.applyVelocity(elapsedTimeAsSeconds);

        if (this.currentTime > 1) {
            this.followBodyHandler();
            this.currentTime = 0;
        }

        this.currentTime += elapsedTimeAsSeconds;
    }

    applyVelocity(elapsedTimeAsSeconds: number): void {
        ECSWrapper.entities.applyToEach(["ParticleSystem"], (entity) => {
            const particleSystem = entity.getComponent(ParticleSystem);

            for (let p = 0; p < particleSystem.particlesCount; p++) {
                particleSystem.particles.vertices[p].y += elapsedTimeAsSeconds;
            }
            particleSystem.particles.verticesNeedUpdate = true;
            if (particleSystem.particles.boundingSphere)
                particleSystem.particles.boundingSphere.radius = 100;
        });
    }

    followBodyHandler(): void {
        ECSWrapper.entities.applyToEach(["ParticleSystem"], (entity) => {
            const particleSystem = entity.getComponent(ParticleSystem);

            if (particleSystem.bodyToFollow) {
                for (let p = 0; p < particleSystem.particlesCount; p++) {
                    let minPosition = new THREE.Vector3(
                        particleSystem.bodyToFollow.position.x - 2,
                        particleSystem.bodyToFollow.position.y - 2,
                        particleSystem.bodyToFollow.position.z - 2
                    );
                    let maxPosition = new THREE.Vector3(
                        particleSystem.bodyToFollow.position.x + 2,
                        particleSystem.bodyToFollow.position.y + 2,
                        particleSystem.bodyToFollow.position.z + 2
                    );
                    particleSystem.particles.vertices[p].set(
                        Math.floor(Math.random() * (maxPosition.x - minPosition.x) + minPosition.x),
                        Math.floor(Math.random() * (maxPosition.y - minPosition.y) + minPosition.y),
                        Math.floor(Math.random() * (maxPosition.z - minPosition.z) + minPosition.z)
                    );
                }
            }
            particleSystem.particles.verticesNeedUpdate = true;
        });
    }
}

export default ParticleSystemManager;
