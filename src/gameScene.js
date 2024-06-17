export default class gameScene extends Phaser.Scene {
  constructor() {
    super({key: 'gameScene'});
  }

  preload () {
    this.load.image	('btn', 'assets/ButtonGrey.png');
    this.load.image	('sprite', 'assets/spr01.png');

    this.load.plugin('rexwarppipelineplugin', 'src/rexwarppipelineplugin.min.js', true);
  }

  init() {
    this.counter = new LargeNumber('0');
    this.multiplier = new LargeNumber('1');
    this.incrementValue = new LargeNumber('1');
    this.autoInterval = 1000;
    this.countInterval;
    this.arbCounter = 0;
    this.scl = 1;
  }

  create() {



    this.playerChar = this.add.image(centerX, height -100, 'sprite').setScale(1).setOrigin(0.5,1);
    var postFxPlugin = this.plugins.get('rexwarppipelineplugin');
    this.postFxPipeline = postFxPlugin.add(this.playerChar, {
        speedX: 1,
        speedY: 2
    });

    this.camera = this.cameras.main;
    log ("GAME SCENE!");

    this.numberText = this.add.text(
      centerX,
      250,
      "0",
      {
        align: 'center',
        fontFamily: gameConfig.defaultFont,
        color: '#F0F0F0',
        fontSize: '168px'
      }
    )
    this.numberText.setOrigin(0.5)

    this.multiplierText = this.add.text(
      centerX ,
      350,
      "n x " + this.multiplier.getValue(),
      {
        align: 'center',
        fontFamily: gameConfig.defaultFont,
        color: '#F0F0F0',
        fontSize: '68px'
      }
    )
    this.multiplierText.setOrigin(0.5)

    this.incrementBtn = this.add.image(100, centerY, 'btn')
    .setInteractive({useHandCursor:true})
    .setOrigin(0.5)
    .on("pointerdown", function(pointer) {
        this.incrMainCounter ();
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


    this.multiBtn = this.add.image(100, centerY + 100, 'btn')
    .setInteractive({useHandCursor:true})
    .setOrigin(0.5)
    .on("pointerdown", function(pointer) {


      this.multiplier.multiply(2);
      this.incrementValue.multiply(this.multiplier.getValue());
      this.multiplierText.text = "n x " + this.multiplier.getValueInENotation();

      if (this.multiplier.getValue() > 1000000) {
        this.multiplierText.text = "n x " + this.multiplier.getValueInENotation();
      } else {
        this.multiplierText.text = "n x " + this.multiplier.getValue();
      }

      this.multiplierText.text += " (" + this.incrementValue.getValueInENotation() + ")";

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


    this.autoBtn = this.add.image(100, centerY + 200, 'btn')
          .setInteractive({useHandCursor:true})
          .setOrigin(0.5)
          .on("pointerdown", function(pointer) {
            this.autoInterval -= (this.autoInterval * 0.01);
            if (this.autoInterval < 66) this.autoInterval = 1; // max every 2nd frame
            this.setAutoCounter ( this.autoInterval );
          }, this);
    this.autoBtnTxt = this.add.text(
        this.autoBtn.x,
        this.autoBtn.y,
        "AUTOCLICK",
        {
          align: 'center',
          fontFamily: gameConfig.defaultFont,
          color: '#000000',
          fontSize: '18px'
        }
    )
    this.autoBtnTxt.setOrigin(0.5)

  }

  incrMainCounter () {
    this.scl += 0.01;
    this.counter.increment( this.incrementValue.getValue() );
    if (this.counter.getValue() > 1000000000) {
      this.numberText.text = this.counter.getValueInENotation();
    } else {
      this.numberText.text = this.counter.getValue();
    }
  }

  setAutoCounter ( newInterval ) {
    if (this.countInterval != undefined) clearInterval( this.countInterval );
    this.countInterval = setInterval ( ()=> {
      this.incrMainCounter();
    }, newInterval, this)
  }

  update () {

    this.playerChar.setScale ( this.scl );

  }

}
