export default class PhysicsParticle extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);

        scene.add.existing(this);

        // Use Matter physics
        scene.matter.add.gameObject(this, {
            shape: { type: 'circle', radius: 2 },
            restitution: 1, // Perfect bounce
            friction: 0,
            frictionAir: 0,
            mass: 1
        });

        // Visual properties
        this.setScale(3);
        this.setBlendMode(Phaser.BlendModes.ADD);
        this.setDepth(1);

        // Lifecycle
        this.isActive = false;
        this.lifetime = 0;
        this.maxLifetime = 30000; // 30 seconds

        this.setActive(false);
        this.setVisible(false);
    }

    spawn(x, y, velocityX, velocityY, anim) {
        this.setActive(true);
        this.setVisible(true);
        this.setPosition(x, y);

        if (this.body) {
            // Matter physics velocity setting
            this.setVelocity(velocityX, velocityY);
        }

        this.isActive = true;
        this.lifetime = 0;
        if (this.anims) {
            this.play(anim);
        }
    }

    update(time, delta) {
        if (!this.isActive) return;

        this.lifetime += delta;

        

        if (this.lifetime > this.maxLifetime || this.isOffScreen()) {
            this.kill();
        }
    }

    kill() {
        this.isActive = false;
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
