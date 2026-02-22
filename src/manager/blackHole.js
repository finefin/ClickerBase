export default class BlackHole extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, config) {
        super(scene, x, y, texture, frame, config);

        this.speed = { x: config.speed.x, y: config.speed.y };
        scene.add.existing(this);

        this.well = {
            x: x,
            y: y,

            // Gravitational strength constant.
            // Tuned so particles at ~400px feel a gentle pull,
            // and particles at ~50px get aggressively sucked in.
            G: 20000,

            // Softening radius (px). Only prevents singularity at dist < ~5px.
            // Keep this SMALL — the original large epsilon (500) is what
            // caused gravity to feel flat and constant at all distances.
            softening: 5,

            // Tangential swirl factor (0 = straight inward fall, higher = more orbit).
            // ~0.3 gives a visible spiral without particles looping forever.
            // Scales down automatically near the hole so the final plunge is direct.
            swirlFactor: 0.1,

            // Damping applied only to the radial (inward/outward) velocity component.
            // Bleeds off elastic bouncing while preserving the spin.
            // 1.0 = no damping, 0.95 = aggressive damping.
            radialDamping: 0.96,

            // Kill zone radius (px)
            killRadius: 20,

            // Particles beyond this distance are ignored entirely.
            // Keeps idle far-away particles from slowly drifting in.
            // Set to Infinity to affect the whole screen.
            maxInfluenceRadius: 10000,

            // Multiplier scaled up by gravity upgrades in gameScene
            gravity: 1,
        };
    }

    update(time, delta) {
        this.rotation += 1;
        this.well.x = this.x;
        this.well.y = this.y;
    }

    applyGravityToParticle(particle) {
        if (!particle.isActive || !particle.body) return;

        const dx   = this.x - particle.x;
        const dy   = this.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Outside influence radius — skip
        if (dist > this.well.maxInfluenceRadius) return;

        // ── Kill zone ────────────────────────────────────────────────────────
        if (dist < this.well.killRadius) {
            particle.killByBlackHole();
            return;
        }

        // ── Radial unit vector (toward black hole) ───────────────────────────
        const nx = dx / dist;
        const ny = dy / dist;

        // ── Inverse-square gravity ───────────────────────────────────────────
        // The softening² term is negligible beyond a few pixels,
        // so this behaves as true 1/r² gravity across normal play distances.
        const softSq   = this.well.softening * this.well.softening;
        const forceMag = (this.well.G * this.well.gravity) / (dist * dist + softSq);

        // ── Tangential unit vector (perpendicular, counter-clockwise) ────────
        const tx = -ny;
        const ty =  nx;

        // Swirl tapers off at close range so the final approach is a direct plunge
        const swirlMag = this.well.swirlFactor * Math.min(1, 80 / dist);

        const forceX = (nx + tx * swirlMag) * forceMag * 0.001;
        const forceY = (ny + ty * swirlMag) * forceMag * 0.001;

        particle.applyForce({ x: forceX, y: forceY });

        // ── Selective radial damping ─────────────────────────────────────────
        // Decompose velocity into radial and tangential components.
        // Only damp the radial part — this kills outward bouncing energy
        // without touching the angular momentum that creates the spiral.
        const vx = particle.body.velocity.x;
        const vy = particle.body.velocity.y;

        const vRadial = vx * nx + vy * ny;   // positive = moving away from hole
        const vTanX   = vx - vRadial * nx;
        const vTanY   = vy - vRadial * ny;

        const newVx = (vRadial * this.well.radialDamping) * nx + vTanX;
        const newVy = (vRadial * this.well.radialDamping) * ny + vTanY;

        particle.setVelocity(newVx, newVy);
    }
}
