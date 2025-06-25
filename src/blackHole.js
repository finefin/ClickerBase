// BlackHole


export default class BlackHole extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame, config ) {    
	super(scene, x, y, texture, frame, config);

  	this.speed = { x: config.speed.x, y: config.speed.y } ;
    scene.add.existing(this);
	scene.physics.add.existing(this);

    this.well = scene.particleEmitter.createGravityWell({
            x: x,
            y: y,
            power: 100,
            epsilon: 500,
            gravity: 50
    });

  }

  update(time, delta) {

  	this.rotation += 1;
  	//this.well.gravity += 1;

  }

}
