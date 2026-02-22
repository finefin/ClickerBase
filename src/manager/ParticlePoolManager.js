import PhysicsParticle from './PhysicsParticle.js';

export default class ParticlePoolManager {
    constructor(scene, maxParticles = 500) {
        this.scene = scene;
        this.maxParticles = maxParticles;
        this.pool = [];
        this.activeParticles = [];

        for (let i = 0; i < 50; i++) {
            const particle = new PhysicsParticle(scene, -10000, -10000, 'CoinD');
            this.pool.push(particle);
        }
    }

    spawn(x, y, velocityX, velocityY, anim = 'flipDa', onKilledByBlackHole = null) {
        const particle = this.getFromPool();

        if (particle) {
            particle.spawn(x, y, velocityX, velocityY, anim, onKilledByBlackHole);
            this.activeParticles.push(particle);
            return particle;
        }

        return null;
    }

    getFromPool() {
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].isActive) {
                return this.pool[i];
            }
        }

        if (this.pool.length < this.maxParticles) {
            const particle = new PhysicsParticle(this.scene, -10000, -10000, 'CoinD');
            this.pool.push(particle);
            return particle;
        }

        // Pool exhausted — reuse oldest active particle
        return this.activeParticles.shift();
    }

    update(time, delta) {
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            particle.update(time, delta);

            if (!particle.isActive) {
                this.activeParticles.splice(i, 1);
                particle.setPosition(-10000, -10000);
                if (particle.body) {
                    particle.setVelocity(0, 0);
                }
            }
        }
    }

    getActiveCount() {
        return this.activeParticles.length;
    }
}
