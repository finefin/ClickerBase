/**
 * OrbitalSpawner
 *
 * A small visual sprite that orbits a fixed center point.
 * Exposes getPosition() so gameScene can pass the spawn location
 * to the particle system on every click or auto-fire.
 *
 * Config options (all optional):
 *   centerX   {number}  - orbit center X          (default: screen center)
 *   centerY   {number}  - orbit center Y           (default: screen center)
 *   radius    {number}  - orbit radius in px       (default: 300)
 *   speed     {number}  - radians per second       (default: 1.2)
 *   startAngle {number} - initial angle in radians (default: 0)
 */
export default class OrbitalSpawner extends Phaser.GameObjects.Container {
    constructor(scene, config = {}) {
        const sw = gameConfig.screenResolution.width;
        const sh = gameConfig.screenResolution.height;

        const cx = config.centerX  ?? sw * 0.5;
        const cy = config.centerY  ?? sh * 0.5;

        super(scene, cx, cy);
        scene.add.existing(this);
        this.setDepth(4);

        this.orbitCenterX  = cx;
        this.orbitCenterY  = cy;
        this.orbitRadius   = config.radius     ?? 200;
        this.orbitSpeed    = config.speed      ?? 0.5;   // rad/s
        this.currentAngle  = config.startAngle ?? 0;

        // ── Visual ──────────────────────────────────────────────────────────
        // Outer glow ring
        const glow = scene.add.graphics();
        glow.fillStyle(0x00ccff, 0.08);
        glow.fillCircle(0, 0, 18);
        glow.lineStyle(1, 0x00ccff, 0.3);
        glow.strokeCircle(0, 0, 18);
        this.add(glow);

        // Core dot
        const core = scene.add.graphics();
        core.fillStyle(0xffffff, 0.9);
        core.fillCircle(0, 0, 14);
        core.lineStyle(1, 0x00ccff, 1);
        core.strokeCircle(0, 0, 4);
        this.add(core);

        // Orbit path (drawn at scene level, not inside container)
        this._orbitPath = scene.add.graphics().setDepth(1).setAlpha(0.08);
        this._orbitPath.lineStyle(1, 0x00aaff, 1);
        this._orbitPath.strokeCircle(cx, cy, this.orbitRadius);

        // Tick mark showing direction of travel
        this._tick = scene.add.graphics();
        this._tick.lineStyle(1.5, 0x00ccff, 0.7);
        this._tick.beginPath();
        this._tick.moveTo(0, -8);
        this._tick.lineTo(0, -14);
        this._tick.strokePath();
        this.add(this._tick);

        // Initial position
        this._updatePosition();
    }

    // ─────────────────────────────────────────────────────────────────────────

    /** Call from gameScene.update() with delta in ms. */
    update(delta) {
        this.currentAngle += this.orbitSpeed * (delta / 1000);
        this._updatePosition();

        // Rotate the container so the tick always points in direction of travel
        this.setRotation(this.currentAngle + Math.PI / 2);
    }

    /** Returns the current world-space spawn position. */
    getPosition() {
        return { x: this.x, y: this.y };
    }

    // ─────────────────────────────────────────────────────────────────────────

    _updatePosition() {
        this.x = this.orbitCenterX + Math.cos(this.currentAngle) * this.orbitRadius;
        this.y = this.orbitCenterY + Math.sin(this.currentAngle) * this.orbitRadius;
    }

    destroy() {
        if (this._orbitPath) this._orbitPath.destroy();
        super.destroy();
    }
}
