import PhysicsParticle from './PhysicsParticle.js';

export default class ParticlePoolManager {
    constructor(scene, maxParticles = 5000) {
        this.scene = scene;
        this.maxParticles = maxParticles;
        this.pool = [];
        this.activeParticles = [];

        // Create initial pool (50 particles, inactive)
        for (let i = 0; i < 50; i++) {
            const particle = new PhysicsParticle(scene, -10000, -10000, 'CoinD');
            this.pool.push(particle);
        }

        // Matter physics handles collisions automatically - no need to set up collider!
    }

    spawn(x, y, velocityX, velocityY, anim = 'flipDa') {
        let particle = this.getFromPool();

        if (particle) {
            particle.spawn(x, y, velocityX, velocityY, anim);
            this.activeParticles.push(particle);
            return particle;
        }

        return null;
    }

    getFromPool() {
        // Find inactive particle
        for (let i = 0; i < this.pool.length; i++) {
            if (!this.pool[i].isActive) {
                return this.pool[i];
            }
        }

        // Expand pool if under max
        if (this.pool.length < this.maxParticles) {
            const particle = new PhysicsParticle(this.scene, -10000, -10000, 'CoinD');
            this.pool.push(particle);
            return particle;
        }

        // Pool exhausted - reuse oldest (already active, will be re-spawned)
        return this.activeParticles.shift();
    }

    update(time, delta) {
        for (let i = this.activeParticles.length - 1; i >= 0; i--) {
            const particle = this.activeParticles[i];
            particle.update(time, delta);

            // particle.setScale( (particle.y/1000) * 2 + 0.5 );

            if (!particle.isActive) {
                // Remove from active tracking
                this.activeParticles.splice(i, 1);
                // Move far off-screen so it doesn't interfere
                particle.setPosition(-10000, -10000);
                if (particle.body) {
                    particle.setVelocity(0, 0); // Matter physics uses setVelocity on the sprite
                }
            }
        }
    }

    getActiveCount() {
        return this.activeParticles.length;
    }
}
