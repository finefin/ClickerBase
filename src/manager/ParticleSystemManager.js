import ParticlePoolManager from "./ParticlePoolManager.js";

/**
 * ParticleSystemManager - Handles particle system management.
 *
 * explodeParticles() now accepts an optional onKilledByBlackHole callback
 * that is stamped onto every particle spawned in that burst.
 * The callback fires in PhysicsParticle.killByBlackHole(), which is called
 * exclusively by BlackHole.applyGravityToParticle() when a particle enters
 * the death zone — so the economy only counts black-hole kills.
 */
export default class ParticleSystemManager {
    constructor(scene, maxParticles = 5000) {
        this.scene = scene;
        this.maxParticles = maxParticles;
        this.particleManager = null;
    }

    initialize() {
        this.createAnimations();
        this.particleManager = new ParticlePoolManager(this.scene, this.maxParticles);
    }

    createAnimations() {
        this.scene.anims.create({
            key: "flipDa",
            frames: this.scene.anims.generateFrameNumbers("CoinD", { frames: [0, 1, 2, 3, 4] }),
            frameRate: 10,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "flipDb",
            frames: this.scene.anims.generateFrameNumbers("CoinP", { frames: [3, 4, 0, 1, 2] }),
            frameRate: 10,
            repeat: -1,
        });
    }

    /**
     * Spawn a burst of particles from (x, y).
     *
     * @param {number}   x
     * @param {number}   y
     * @param {number}   amount               - capped at 100 per burst
     * @param {Function} onKilledByBlackHole  - called once per particle that a black hole consumes
     */
    explodeParticles(x, y, amount = 50, onKilledByBlackHole = null) {
        if (!this.particleManager) return;

        const width   = gameConfig.screenResolution.width;
        const height  = gameConfig.screenResolution.height;
        const centerX = width  * 0.5;
        const centerY = height * 0.5;

        const spawnAmount = Math.min(amount, 100);

        for (let i = 0; i < spawnAmount; i++) {
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;

            const angleRad  = Phaser.Math.Angle.Between(centerX, centerY, x, y);
            const spread    = Phaser.Math.DegToRad(60);
            const finalAngle = angleRad + (Math.random() * spread - spread / 2) + Math.PI / 2;

            const speed     = 1; // Phaser.Math.Between(1, 2);
            const velocityX = Math.cos(finalAngle) * speed;
            const velocityY = Math.sin(finalAngle) * speed;

            const anim = i % 2 === 0 ? 'flipDa' : 'flipDb';

            this.particleManager.spawn(
                x + offsetX,
                y + offsetY,
                velocityX,
                velocityY,
                anim,
                onKilledByBlackHole   // forwarded to PhysicsParticle.spawn()
            );
        }
    }

    update(time, delta) {
        if (this.particleManager) {
            this.particleManager.update(time, delta);
        }
    }

    applyGravityFromBlackHoles(blackHoles) {
        if (!this.particleManager) return;

        const particles = this.particleManager.activeParticles;

        for (let i = 0; i < blackHoles.length; i++) {
            const blackHole = blackHoles[i];
            if (!blackHole) continue;

            for (let j = 0; j < particles.length; j++) {
                blackHole.applyGravityToParticle(particles[j]);
            }
        }
    }

    getActiveCount() {
        return this.particleManager ? this.particleManager.getActiveCount() : 0;
    }
}
