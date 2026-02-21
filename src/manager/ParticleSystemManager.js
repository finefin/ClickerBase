/**
 * ParticleSystemManager - Handles particle system management
 *
 * Responsibilities:
 * - Initialize particle pool and animations
 * - Spawn particle explosions
 * - Update particles
 * - Apply black hole gravity to particles
 *
 * Wraps ParticlePoolManager with game-specific logic
 */

import ParticlePoolManager from "./ParticlePoolManager.js";

export default class ParticleSystemManager {
    constructor(scene, maxParticles = 5000) {
        this.scene = scene;
        this.maxParticles = maxParticles;
        this.particleManager = null;
    }

    /**
     * Initialize the particle system
     */
    initialize() {
        this.createAnimations();
        this.particleManager = new ParticlePoolManager(this.scene, this.maxParticles);
    }

    /**
     * Create particle animations
     * @private
     */
    createAnimations() {
        this.scene.anims.create({
            key: "flipDa",
            frames: this.scene.anims.generateFrameNumbers("CoinD", {
                frames: [0, 1, 2, 3, 4],
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "flipDb",
            frames: this.scene.anims.generateFrameNumbers("CoinP", {
                frames: [3, 4, 0, 1, 2],
            }),
            frameRate: 10,
            repeat: -1,
        });
    }

    /**
     * Explode particles from a position with radial velocity
     * @param {number} x - Spawn X position
     * @param {number} y - Spawn Y position
     * @param {number} amount - Number of particles to spawn (default: 50)
     */
    explodeParticles(x, y, amount = 50) {
        if (!this.particleManager) return;

        const width = gameConfig.screenResolution.width;
        const height = gameConfig.screenResolution.height;
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        const spawnAmount = Math.min(amount, 100); // Max 100 at once

        for (let i = 0; i < spawnAmount; i++) {
            // Add small random offset to spawn position to prevent stacking
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            const spawnX = x + offsetX;
            const spawnY = y + offsetY;

            // Calculate radial velocity
            const angleRad = Phaser.Math.Angle.Between(centerX, centerY, x, y);
            const spread = Phaser.Math.DegToRad(20);
            const randomOffset = Math.random() * spread - spread / 2;
            const finalAngle = angleRad + randomOffset + Math.PI / 2;

            // Higher velocity so particles shoot out visibly
            const speed = Phaser.Math.Between(1, 2);
            const velocityX = Math.cos(finalAngle) * speed;
            const velocityY = Math.sin(finalAngle) * speed;

            const anim = i % 2 === 0 ? 'flipDa' : 'flipDb';

            this.particleManager.spawn(spawnX, spawnY, velocityX, velocityY, anim);
        }
    }

    /**
     * Update particle system
     * @param {number} time - Current time
     * @param {number} delta - Delta time since last frame
     */
    update(time, delta) {
        if (this.particleManager) {
            this.particleManager.update(time, delta);
        }
    }

    /**
     * Apply gravity from black holes to all active particles
     * @param {Array} blackHoles - Array of BlackHole objects
     */
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

    /**
     * Get number of active particles
     * @returns {number}
     */
    getActiveCount() {
        return this.particleManager ? this.particleManager.getActiveCount() : 0;
    }
}
