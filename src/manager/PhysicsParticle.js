export default class PhysicsParticle extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        // Use Matter physics
        scene.matter.add.gameObject(this, {
            shape: { type: 'circle', radius: 5 },
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            mass: 100
        });

        this.setScale(2);
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setDepth(1);

        this.isActive = false;
        this.lifetime = 0;
        this.maxLifetime = 30000; // 30 seconds

        // Fired only when a black hole consumes this particle.
        // Set via spawn() each time the particle is reused from the pool.
        this.onKilledByBlackHole = null;

        this.setActive(false);
        this.setVisible(false);
    }

    /**
     * @param {number}   x
     * @param {number}   y
     * @param {number}   velocityX
     * @param {number}   velocityY
     * @param {string}   anim
     * @param {Function} onKilledByBlackHole  - called when a black hole consumes this particle
     */
    spawn(x, y, velocityX, velocityY, anim, onKilledByBlackHole = null) {
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(x, y);

        if (this.body) {
            this.setVelocity(velocityX, velocityY);
        }

        this.isActive = true;
        this.lifetime = 0;
        this.onKilledByBlackHole = onKilledByBlackHole;
    }

    update(time, delta) {
        if (!this.isActive) return;

        this.lifetime += delta;

        if (this.lifetime > this.maxLifetime || this.isOffScreen()) {
            // Expired naturally — no counter reward
            this.kill();
        }
    }

    /** Standard death — lifetime/off-screen. No callback fired. */
    kill() {
        this._deactivate();
    }

    /**
     * Called exclusively by BlackHole when this particle enters the death zone.
     * Fires the onKilledByBlackHole callback so the economy can count it.
     */
    killByBlackHole() {
        if (this.onKilledByBlackHole) {
            this.onKilledByBlackHole();
        }
        this._deactivate();
    }

    /** Shared cleanup used by both kill paths. */
    _deactivate() {
        this.isActive = false;
        this.onKilledByBlackHole = null;
        this.setActive(false);
        this.setVisible(false);
        this.setPosition(-10000, -10000);
        if (this.body) {
            this.setVelocity(0, 0);
        }
    }

    isOffScreen() {
        const margin = 100;
        return (
            this.x < -margin ||
            this.x > this.scene.scale.width + margin ||
            this.y < -margin ||
            this.y > this.scene.scale.height + margin
        );
    }
}
