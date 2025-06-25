
import BlackHole from "./blackHole.js";

export default class gameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'gameScene'
        });
    }

    preload() {
        this.load.image('btn', 'assets/ButtonGrey.png');
        this.load.image('sprite', 'assets/spr01.png');
        this.load.plugin('rexwarppipelineplugin', 'src/rexwarppipelineplugin.min.js', true);

        // load (coin flip) animations, e.g. for animated particles
        this.load.spritesheet('CoinD', 'assets/Coin/spr_coin_azu.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('CoinP', 'assets/Coin/spr_coin_strip4.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('CoinR', 'assets/Coin/MonedaR.png', {
            frameWidth: 16,
            frameHeight: 16
        });

    }

    init() {

        this.counter = new LargeNumber('100');
        this.multiplier = new LargeNumber('1');
        this.incrementValue = new LargeNumber('1');

        this.multiPrice = new LargeNumber('100');
        this.multiInterval = 1000;

        this.autoInterval = 500; // auto click
        this.autoPrice = new LargeNumber('100');

        this.autoMultiInterval = 1000;
        this.autoMultiPrice = new LargeNumber('100000');
        this.playerPrice = new LargeNumber('1000000');

        this.countInterval; // interval 
        this.scl = 1;


        this.blackHoles = [];

    }

    create() {

        log("GAME SCENE!");

        


/*
        this.playerChar1 = this.add.image(centerX - 200, centerY, 'sprite').setScale(1).setOrigin(0.5);
        this.playerChar2 = this.add.image(centerX + 200, centerY, 'sprite').setScale(1).setOrigin(0.5);

        this.playerChar1.speedX = 1;
        this.playerChar1.speedY = 1;

        this.playerChar2.speedX = -1;
        this.playerChar2.speedY = -1;

        this.playerChar2.setVisible(false);


        var postFxPlugin = this.plugins.get('rexwarppipelineplugin');
        this.postFxPipeline = postFxPlugin.add(this.playerChar1, {
            speedX: 1,
            speedY: 1
        });

        this.postFxPipeline = postFxPlugin.add(this.playerChar2, {
            speedX: 1,
            speedY: 1
        });
*/


        this.camera = this.cameras.main;

        this.numberText = this.add.text(
            50,
            75,
            "0", {
                align: 'left',
                fontFamily: gameConfig.defaultFont,
                color: '#F0F0F0',
                fontSize: '168px'
            }
        )
        this.numberText.setDepth(2).setOrigin(0)

        this.multiplierText = this.add.text(
            50,
            250,
            "n x " + this.multiplier.getValue(), {
                align: 'left',
                fontFamily: gameConfig.defaultFont,
                color: '#F0F0F0',
                fontSize: '68px'
            }
        )
        this.multiplierText.setOrigin(0)
        this.createButtons();
        this.createParticleEmitter();

        let dist = 100;
        let hAmount = 2;
        for (let i = 0; i < hAmount; i++ ){
            let pos = getSpiralPosition('fibonacci', i, dist, centerX, centerY);
            this.blackHoles[i] = new BlackHole(this,pos.x, pos.y , 'sprite',0,  {speed:{x:1,y:1}});
            this.blackHoles[i].well.gravity = 100;
        }

    }

    createButtons() {

        this.incrementBtn = this.add.zone(0, 0, width, height)
            .setInteractive({
                useHandCursor: true
            })
            .setOrigin(0)
            .on("pointerdown", function(pointer) {
                this.incrMainCounter();
            }, this);

        this.incrementBtnTxt = this.add.text(
            this.incrementBtn.x,
            this.incrementBtn.y,
            "CLICK", {
                align: 'center',
                fontFamily: gameConfig.defaultFont,
                color: '#000000',
                fontSize: '28px'
            }
        )
        this.incrementBtnTxt.setOrigin(0.5)


        this.multiBtn = this.add.image(100, centerY + 100, 'btn')
            .setInteractive({
                useHandCursor: true
            })
            .setOrigin(0.5)
            .on("pointerdown", function(pointer) {
                this.cameras.main.shake(50);
                this.buyMultiplier();

            }, this);

        this.multiBtnTxt = this.add.text(
            this.multiBtn.x,
            this.multiBtn.y,
            "MULTI", {
                align: 'center',
                fontFamily: gameConfig.defaultFont,
                color: '#000000',
                fontSize: '18px'
            }
        )
        this.multiBtnTxt.setOrigin(0.5)


        this.autoBtn = this.add.image(100, centerY + 200, 'btn')
            .setInteractive({
                useHandCursor: true
            })
            .setOrigin(0.5)
            .on("pointerdown", function(pointer) {
                this.cameras.main.shake(50);
                this.buyAutoClick();

            }, this);

        this.autoBtnTxt = this.add.text(
            this.autoBtn.x,
            this.autoBtn.y,
            "AUTOCLICK", {
                align: 'center',
                fontFamily: gameConfig.defaultFont,
                color: '#000000',
                fontSize: '18px'
            }
        )
        this.autoBtnTxt.setOrigin(0.5)


        this.autoMultiBtn = this.add.image(100, centerY + 300, 'btn')
            .setInteractive({
                useHandCursor: true
            })
            .setOrigin(0.5)
            .on("pointerdown", function(pointer) {
                this.cameras.main.shake(50);
                this.buyAutoMulti();

            }, this);
        this.autoMultiBtnTxt = this.add.text(
            this.autoMultiBtn.x,
            this.autoMultiBtn.y,
            "AUTO MULTI", {
                align: 'center',
                fontFamily: gameConfig.defaultFont,
                color: '#000000',
                fontSize: '18px'
            }
        )
        this.autoMultiBtnTxt.setOrigin(0.5)


        this.buyPlayerBtn = this.add.image(100, centerY + 400, 'btn')
            .setInteractive({
                useHandCursor: true
            })
            .setOrigin(0.5)
            .on("pointerdown", function(pointer) {
                this.cameras.main.shake(50);
                this.buyObject();
            }, this);
        this.buyPlayerBtnTxt = this.add.text(
            this.buyPlayerBtn.x,
            this.buyPlayerBtn.y,
            "BUY OBJ\n" + this.playerPrice.getValueInENotation(), {
                align: 'center',
                fontFamily: gameConfig.defaultFont,
                color: '#000000',
                fontSize: '18px'
            }
        )
        this.buyPlayerBtnTxt.setOrigin(0.5)
    }

    buyMultiplier() {

        // log (this.multiPrice.getValue())

        if (this.counter.getValue() >= this.multiPrice.getValue()) {

            this.counter.decrement(this.multiPrice.getValue());
            this.multiPrice.multiply(2n);
            this.multiplier.increment(1);
            this.incrementValue.multiply(2n);

            this.multiplierText.text = "n x " + this.multiplier.getValueInENotation();

            if (this.multiplier.getValue() > 1000000) {
                this.multiplierText.text = "n x " + this.multiplier.getValueInENotation();
            } else {
                this.multiplierText.text = "n x " + this.multiplier.getValue();
            }

            this.multiplierText.text += " (" + this.incrementValue.getValueInENotation() + ")";

        } else {
            log("not enough C");
        }
    }

    buyAutoMulti() {

        if (this.counter.getValue() >= this.autoMultiPrice.getValue()) {
            this.counter.decrement(this.autoMultiPrice.getValue())
            this.autoMultiPrice.multiply(2n);

        }else {
            log("not enough C");
        }
    }

    incrMainCounter() {
        let pExplode = Math.round(Number(this.multiplier.getValue()));
        if (pExplode > gameData.maxParticles ) pExplode = gameData.maxParticles;
        this.explodeParticles(this.input.activePointer.x, this.input.activePointer.y, pExplode);
        this.counter.increment(this.incrementValue.getValue());
    }

    buyAutoClick() {

        if (this.counter.getValue() >= this.autoPrice.getValue()) {
            this.counter.decrement(this.autoPrice.getValue())
            this.autoPrice.multiply(2n);

            this.autoInterval -= (this.autoInterval * 0.01);
            if (this.autoInterval < 66) this.autoInterval = 1; // max every 2nd frame
            this.setAutoCounter(this.autoInterval);
        }else {
            log("not enough C");
        }
    }

    setAutoCounter(newInterval) {
        if (this.countInterval != undefined) clearInterval(this.countInterval);
        this.countInterval = setInterval(() => {
            this.incrMainCounter();
        }, newInterval, this)
    }

    setAutoMultiCounter(newInterval) {
        if (this.autoMultiInterval != undefined) clearInterval(this.autoMultiInterval);
        this.autoMultiInterval = setInterval(() => {
            this.incrMainCounter();
        }, newInterval, this)
    }

    buyObject() {
        if (this.counter.getValue() >= this.playerPrice.getValue()) {

          this.counter.decrement(this.playerPrice.getValue())
          this.playerChar2.setVisible(true);
          this.playerChar2.well = this.particleEmitter.createGravityWell({
              x: this.playerChar2.x,
              y: this.playerChar2.y,
              power: 1000,
              epsilon: 1000,
              gravity: 50
          });

        } else {
            log("not enough C");
        }
    }

    update() {

        for (let i = 0; i < this.blackHoles.length; i++ ){
            this.blackHoles[i].update();
        }

        this.multiBtnTxt.text = "Add PPC\n" + this.multiPrice.getValueInENotation();
        this.autoBtnTxt.text = "AUTO CLICK\n" + this.autoPrice.getValueInENotation();
        this.autoMultiBtnTxt.text = "AUTO ADD PPC\n" + this.autoMultiPrice.getValueInENotation();

        if (this.counter.getValue() < this.multiPrice.getValue()) {
            this.multiBtn.setAlpha(0.3);
        } else {
            this.multiBtn.setAlpha(1);
        }

        if (this.counter.getValue() < this.autoPrice.getValue()) {
            this.autoBtn.setAlpha(0.3);
        } else {
            this.autoBtn.setAlpha(1);
        }

        if (this.counter.getValue() < this.autoMultiPrice.getValue()) {
            this.autoMultiBtn.setAlpha(0.3);
        } else {
            this.autoMultiBtn.setAlpha(1);
        }

        if (this.counter.getValue() < this.playerPrice.getValue()) {
            this.buyPlayerBtn.setAlpha(0.3);
        } else {
            this.buyPlayerBtn.setAlpha(1);
        }

        if (this.counter.getValue() > 1000000000) {
            this.numberText.text = this.counter.getValueInENotation();
        } else {
            this.numberText.text = this.counter.getValue();
        }
    }

    // Particles
    createParticleEmitter() {

        // var coin = this.add.sprite(50, 250, "Coin");
        // coin.animations.add("flip", [0, 1, 2, 3, 4], 24);

        var rect = new Phaser.Geom.Rectangle(centerX - 150, 0, 300, 200);

        this.anims.create({
            key: 'flipDa',
            frames: this.anims.generateFrameNumbers('CoinD', {
                frames: [0, 1, 2, 3, 4]
            }),
            frameRate: 30,
            repeat: -1
        });

        this.anims.create({
            key: 'flipDb',
            frames: this.anims.generateFrameNumbers('CoinP', {
                frames: [3, 4, 0, 1, 2]
            }),
            frameRate: 30,
            repeat: -1
        });

        this.particleEmitter = this.add.particles(0, 0, 'CoinD', {
            anim: ['flipDa', 'flipDb'],
            speed: {
                min: 0,
                max: 100,
                ease: 'Expo.easeOut'
            },
            angle: {
                min: 0,
                max: 360
            },
            scale: {
                start: 3,
                end: 0
            },
            gravityY: 0,
            active: false,
            blendMode: 'ADD',
            lifespan: 5000
        }).setDepth(1)

        this.particleEmitter.on('deathzone', function(emitter, particle, zone) {
            this.scl += 0.001;
        }, this)



    }

    explodeParticles(x, y, amount = 50) {
        this.particleEmitter.resume();
        this.particleEmitter.explode(amount, x, y);
    }

}