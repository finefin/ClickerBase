// BlackHole


export default class BlackHole extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame, config ) {    
	super(scene, x, y, texture, frame, config);

  	this.speed = { x: config.speed.x, y: config.speed.y } ;
    scene.add.existing(this);
    // Black hole doesn't need physics body, it's just a visual sprite

    // Keep well as data structure for gravity calculations
    this.well = {
      x: x,
      y: y,
      power: 1000,
      epsilon: 500,
      gravity: 200
    };

  }

  update(time, delta) {
  	this.rotation += 1;
  	//this.well.gravity += 1;

    // Update well position to follow sprite
    this.well.x = this.x;
    this.well.y = this.y;
  }

  applyGravityToParticle(particle) {
    if (!particle.isActive || !particle.body) return;

    const dx = this.x - particle.x;
    const dy = this.y - particle.y;
    const distSq = dx * dx + dy * dy;

    if (distSq > 0) {
      const dist = Math.sqrt(distSq);

      // Apply gravity force using Matter physics
      const forceMagnitude = (this.well.power * this.well.gravity) / (distSq + this.well.epsilon);
      const forceX = (dx / dist) * forceMagnitude * 0.001; // Scale for Matter physics
      const forceY = (dy / dist) * forceMagnitude * 0.001;

      // Matter.js applyForce requires position and force vector
      particle.applyForce({ x: forceX, y: forceY });

      // Check death zone (radius 50)
      if (dist < 50) {
        particle.kill();
      }
    }
  }

}
