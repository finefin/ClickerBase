export default class gameScene extends Phaser.Scene {
  constructor() {
    super({key: 'gameScene'});
  }

  preload () {

    this.load.image	('btn', 'assets/ButtonGrey.png');

  }

  init() {
    this.counter = new LargeNumber('0');
    this.multiplier = new LargeNumber('1');
    this.incrementValue = new LargeNumber('1');
  }

  create() {

    // get the main camera so we can manipulate it if needed
    this.camera = this.cameras.main;
    log ("GAME SCENE!");

    this.numberText = this.add.text(
      centerX,
      250,
      this.counter.getValue(),
      {
        align: 'center',
        fontFamily: gameConfig.defaultFont,
        color: '#F0F0F0',
        fontSize: '168px'
      }
    )
    this.numberText.setOrigin(0.5)

    this.multiplierText = this.add.text(
      centerX + 200,
      350,
      this.multiplier.getValue(),
      {
        align: 'center',
        fontFamily: gameConfig.defaultFont,
        color: '#F0F0F0',
        fontSize: '68px'
      }
    )
    this.numberText.setOrigin(0.5)

    this.incrementBtn = this.add.image(centerX, centerY, 'btn')
    .setInteractive({useHandCursor:true})
    .setOrigin(0.5)
    .on("pointerdown", function(pointer) {
      this.counter.increment( this.incrementValue.getValue() );

      if (this.counter.getValue() > 1000000000) {
        this.numberText.text = this.counter.getValueInENotation();
      } else {
        this.numberText.text = this.counter.getValue();
      }

    }, this);
    this.incrementBtnTxt = this.add.text(
      this.incrementBtn.x,
      this.incrementBtn.y,
      "CLICK",
      {
        align: 'center',
        fontFamily: gameConfig.defaultFont,
        color: '#000000',
        fontSize: '28px'
      }
    )
    this.incrementBtnTxt.setOrigin(0.5)

    this.multiBtn = this.add.image(centerX, centerY + 100, 'btn')
    .setInteractive({useHandCursor:true})
    .setOrigin(0.5)
    .on("pointerdown", function(pointer) {
      this.multiplier.multiply(2);
      this.incrementValue.multiply(this.multiplier.getValue());
      this.multiplierText.text = "x" + this.multiplier.getValueInENotation();

      if (this.multiplier.getValue() > 1000000) {
        this.multiplierText.text = "x" + this.multiplier.getValueInENotation();
      } else {
        this.multiplierText.text = "x" + this.multiplier.getValue();
      }

    }, this);

    this.multiBtnTxt = this.add.text(
      this.multiBtn.x,
      this.multiBtn.y,
      "MULTI",
      {
        align: 'center',
        fontFamily: gameConfig.defaultFont,
        color: '#000000',
        fontSize: '18px'
      }
    )
    this.multiBtnTxt.setOrigin(0.5)


  }


  update () {


  }

}
