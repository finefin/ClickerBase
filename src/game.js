import levelScene from "./gameScene.js";
import textScene from "./textScene.js";


var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'gameCanvas',
        width: width,
        height: height
    },
    backgroundColor: '#2d2d2d',
    scene: [levelScene, textScene],
    physics: {
        default: 'arcade',
        arcade: {
            //debug: true
        }
    }
};

var game = new Phaser.Game(config);
