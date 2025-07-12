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

        this.counter = new LargeNumber('0');
        this.multiplier = new LargeNumber('1');
        this.incrementValue = new LargeNumber('1');

        this.multiPrice = new LargeNumber('100');
        this.multiInterval = 1000;

        this.autoInterval = 500; // auto click
        this.autoPrice = new LargeNumber('100');

        this.gravityPrice = new LargeNumber('100');

        this.autoMultiInterval = 1000;
        this.autoMultiPrice = new LargeNumber('100000');
        this.playerPrice = new LargeNumber('1000000');

        this.countInterval; // interval 
        this.scl = 1;

        this.blackHoles = [];
        this.blackHoleIndex = 0;

    }

    create() {

        log("GAME SCENE!");

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
        this.createBlackHoles(1);

        this.scene.launch("TextScene")


        //var data = JSON.stringify( {"data":{"content": "Klopfen", "origin":"machine"}} );
        //log (data)

    }

    createBlackHoles(amount) {

        let dist = 5;
        let hAmount = amount;

        for (let i = 0; i < hAmount; i++) {
            let index = this.blackHoleIndex;
            let pos = getSpiralPosition('fibonacci', index, dist, centerX, centerY);
            this.blackHoles[index] = new BlackHole(this, pos.x, pos.y, 'sprite', 0, {
                speed: {
                    x: 1,
                    y: 1
                }
            });
            this.blackHoles[index].well.gravity = 1;
            this.blackHoleIndex += 1;
        }

    }

createButtons() {
    // Hilfsfunktion zum Erstellen futuristischer Buttons
    const createFuturisticButton = (x, y, width, height, isMainButton = false) => {
        const graphics = this.add.graphics();
        
        // Gradient-ähnlicher Effekt mit mehreren Rechtecken
        const baseColor = isMainButton ? 0x001155 : 0x002266;
        const highlightColor = isMainButton ? 0x0033aa : 0x0044cc;
        const borderColor = 0x00aaff;
        
        // Äußerer Rahmen (Glow-Effekt)
        graphics.fillStyle(borderColor, 0.3);
        graphics.fillRoundedRect(x - width/2 - 2, y - height/2 - 2, width + 4, height + 4, 8);
        
        // Hauptbutton
        graphics.fillStyle(baseColor);
        graphics.fillRoundedRect(x - width/2, y - height/2, width, height, 6);
        
        // Highlight oben
        graphics.fillStyle(highlightColor, 0.7);
        graphics.fillRoundedRect(x - width/2 + 2, y - height/2 + 2, width - 4, height/3, 4);
        
        // Leuchtender Rand
        graphics.lineStyle(1, borderColor, 0.8);
        graphics.strokeRoundedRect(x - width/2, y - height/2, width, height, 6);
        
        return graphics;
    };

    // Hilfsfunktion für Hover-Effekte (für normale Buttons)
    const createHoverEffect = (button, graphics, text, originalScale = 1) => {
        button.on('pointerover', () => {
            this.tweens.add({
                targets: [graphics, text],
                scaleX: originalScale * 1.05,
                scaleY: originalScale * 1.05,
                duration: 100,
                ease: 'Power2'
            });
            
            // Zusätzlicher Glow-Effekt
            graphics.setTint(0x88ccff);
        });
        
        button.on('pointerout', () => {
            this.tweens.add({
                targets: [graphics, text],
                scaleX: originalScale,
                scaleY: originalScale,
                duration: 100,
                ease: 'Power2'
            });
            
            graphics.clearTint();
        });
        
        button.on('pointerdown', () => {
            this.tweens.add({
                targets: [graphics, text],
                scaleX: originalScale * 0.95,
                scaleY: originalScale * 0.95,
                duration: 50,
                ease: 'Power2',
                yoyo: true
            });
        });
    };

    // Hauptbutton (Increment) - Zone bleibt bestehen
    this.incrementBtn = this.add.zone(0, 0, width, height)
        .setInteractive({
            useHandCursor: true
        })
        .setOrigin(0)
        .on("pointerdown", function(pointer) {
            this.incrMainCounter();
        }, this);
    
    
    this.incrementBtn.on('pointerdown', () => {
        this.tweens.add({
            targets: [this.incrementBtnGraphics, this.incrementBtnTxt],
            scaleX: 0.95,
            scaleY: 0.95,
            duration: 50,
            ease: 'Power2',
            yoyo: true
        });
    });

    // Multi Button
    this.multiBtnGraphics = createFuturisticButton(100, centerY, 120, 50);
    this.multiBtn = this.add.zone(100, centerY, 120, 50)
        .setInteractive({
            useHandCursor: true
        })
        .on("pointerdown", function(pointer) {
            this.cameras.main.shake(50);
            this.buyMultiplier();
        }, this);

    this.multiBtnTxt = this.add.text(
        100, centerY,
        "MULTI", {
            align: 'center',
            fontFamily: gameConfig.defaultFont,
            color: '#00ccff',
            fontSize: '18px',
            stroke: '#000044',
            strokeThickness: 1
        }
    ).setOrigin(0.5);
    


    // Auto Button
    this.autoBtnGraphics = createFuturisticButton(100, centerY + 100, 120, 50);
    this.autoBtn = this.add.zone(100, centerY + 100, 120, 50)
        .setInteractive({
            useHandCursor: true
        })
        .on("pointerdown", function(pointer) {
            this.cameras.main.shake(50);
            this.buyAutoClick();
        }, this);

    this.autoBtnTxt = this.add.text(
        100, centerY + 100,
        "AUTOCLICK", {
            align: 'center',
            fontFamily: gameConfig.defaultFont,
            color: '#00ccff',
            fontSize: '16px',
            stroke: '#000044',
            strokeThickness: 1
        }
    ).setOrigin(0.5);
    

    // Auto Multi Button
    this.autoMultiBtnGraphics = createFuturisticButton(100, centerY + 200, 120, 50);
    this.autoMultiBtn = this.add.zone(100, centerY + 200, 120, 50)
        .setInteractive({
            useHandCursor: true
        })
        .on("pointerdown", function(pointer) {
            this.cameras.main.shake(50);
            this.buyAutoMulti();
        }, this);

    this.autoMultiBtnTxt = this.add.text(
        100, centerY + 200,
        "AUTO MULTI", {
            align: 'center',
            fontFamily: gameConfig.defaultFont,
            color: '#00ccff',
            fontSize: '16px',
            stroke: '#000044',
            strokeThickness: 1
        }
    ).setOrigin(0.5);
    
    
    this.autoMultiBtn.setVisible(false);
    this.autoMultiBtnTxt.setVisible(false);
    this.autoMultiBtnGraphics.setVisible(false);

    // Buy Player Button
    this.buyPlayerBtnGraphics = createFuturisticButton(100, centerY + 300, 120, 60);
    this.buyPlayerBtn = this.add.zone(100, centerY + 300, 120, 60)
        .setInteractive({
            useHandCursor: true
        })
        .on("pointerdown", function(pointer) {
            this.cameras.main.shake(50);
            this.buyObject();
        }, this);

    this.buyPlayerBtnTxt = this.add.text(
        100, centerY + 300,
        "BUY OBJ\n" + this.playerPrice.getValueInENotation(), {
            align: 'center',
            fontFamily: gameConfig.defaultFont,
            color: '#00ccff',
            fontSize: '16px',
            stroke: '#000044',
            strokeThickness: 1
        }
    ).setOrigin(0.5);
    


    // Buy Gravity Button
    this.buyGravityBtnGraphics = createFuturisticButton(100, centerY + 400, 120, 60);
    this.buyGravityBtn = this.add.zone(100, centerY + 400, 120, 60)
        .setInteractive({
            useHandCursor: true
        })
        .on("pointerdown", function(pointer) {
            this.cameras.main.shake(50);
            this.buyGravity();
        }, this);

    this.buyGrvityBtnTxt = this.add.text(
        100, centerY + 400,
        "BUY GRAV\n" + this.gravityPrice.getValueInENotation(), {
            align: 'center',
            fontFamily: gameConfig.defaultFont,
            color: '#00ccff',
            fontSize: '16px',
            stroke: '#000044',
            strokeThickness: 1
        }
    ).setOrigin(0.5);
    
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
        } else {
            log("not enough C");
        }
    }


    buyGravity() {

        if (this.counter.getValue() >= this.gravityPrice.getValue()) {
            this.counter.decrement(this.gravityPrice.getValue())
            this.gravityPrice.multiply(2n);

            for (let i = 0; i < this.blackHoles.length; i++) {
                this.blackHoles[i].well.gravity += 1;
            }


        } else {
            log("not enough C");
        }

    }

    incrMainCounter() {
        let pExplode = Math.round(Number(this.multiplier.getValue()));
        if (pExplode > gameData.maxParticles) pExplode = gameData.maxParticles;
        this.explodeParticles(this.input.activePointer.x, this.input.activePointer.y, pExplode);
        this.counter.increment(this.incrementValue.getValue());
    }

    buyAutoClick() {

        if (this.counter.getValue() >= this.autoPrice.getValue()) {
            this.counter.decrement(this.autoPrice.getValue())
            this.autoPrice.multiply(2n);
            this.autoInterval -= (this.autoInterval * 0.01);
            if (this.autoInterval < 1) this.autoInterval = 1;
            this.setAutoCounter(this.autoInterval);
        } else {
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
            this.createBlackHoles(1);
        } else {
            log("not enough C");
        }
    }

    update() {

        for (let i = 0; i < this.blackHoles.length; i++) {
            this.blackHoles[i].update();
        }

        this.multiBtnTxt.text = "Add PPC\n" + this.multiPrice.getValueInENotation();
        this.autoBtnTxt.text = "AUTO CLICK\n" + this.autoPrice.getValueInENotation();
        this.autoMultiBtnTxt.text = "AUTO ADD PPC\n" + this.autoMultiPrice.getValueInENotation();
        this.buyGrvityBtnTxt.text = "BUY GRAVITY\n" + this.gravityPrice.getValueInENotation();

        if (this.counter.getValue() < this.multiPrice.getValue()) {
            this.multiBtnGraphics.setAlpha(0.3);
        } else {
            this.multiBtnGraphics.setAlpha(1);
        }

        if (this.counter.getValue() < this.autoPrice.getValue()) {
            this.autoBtnGraphics.setAlpha(0.3);
        } else {
            this.autoBtnGraphics.setAlpha(1);
        }

        if (this.counter.getValue() < this.autoMultiPrice.getValue()) {
            this.autoMultiBtnGraphics.setAlpha(0.3);
        } else {
            this.autoMultiBtnGraphics.setAlpha(1);
        }

        if (this.counter.getValue() < this.playerPrice.getValue()) {
            this.buyPlayerBtnGraphics.setAlpha(0.3);
        } else {
            this.buyPlayerBtnGraphics.setAlpha(1);
        }

        if (this.counter.getValue() > 1000000000) {
            this.numberText.text = this.counter.getValueInENotation();
        } else {
            this.numberText.text = this.counter.getValue();
        }


        if (this.counter.getValue() < this.gravityPrice.getValue()) {
            this.buyGravityBtnGraphics.setAlpha(0.3);
        } else {
            this.buyGravityBtnGraphics.setAlpha(1);
        }
    }

    // Particles
    createParticleEmitter() {

        let parent = this.scene;

        this.anims.create({
            key: 'flipDa',
            frames: this.anims.generateFrameNumbers('CoinD', {
                frames: [0, 1, 2, 3, 4]
            }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'flipDb',
            frames: this.anims.generateFrameNumbers('CoinP', {
                frames: [3, 4, 0, 1, 2]
            }),
            frameRate: 10,
            repeat: -1
        });

        this.particleEmitter = this.add.particles(0, 0, 'CoinD', {
            anim: ['flipDa', 'flipDb'],
            speed: {
                min: 10,
                max: 500,
                ease: 'Power1' // Beschleunigungskurve für die Geschwindigkeit
            },
            angle: (particle) => {
                const angleRad = Phaser.Math.Angle.Between(centerX, centerY, particle.x, particle.y) + 90;
                const spread = Phaser.Math.DegToRad(20); // Streuung
                const randomOffset = (Math.random() * spread) - (spread / 2);
                return Phaser.Math.RadToDeg(angleRad + randomOffset);
            },
            scale: {
                start: 3,
                end: 0
            },
            gravityY: 0,
            active: false,
            blendMode: 'ADD',
            lifespan: 1000

        }).setDepth(1)


        this.particleEmitter.onParticleDeath((particle) => {
            //log (particle.x,particle.y)  
            //this.explodeParticles (particle.x, particle.y, 10);          
        }, this);



    }

    explodeParticles(x, y, amount = 50) {
        this.particleEmitter.resume();
        this.particleEmitter.explode(amount, x, y);
    }

}