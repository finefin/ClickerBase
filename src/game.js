import levelScene from "./gameScene.js";

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'gameCanvas',
        width: 1920,
        height: 1024
    },
    backgroundColor: '#2d2d2d',
    scene: [levelScene],
    physics: {
        default: 'arcade',
        arcade: {
            //debug: true
        }
    }
};

var game = new Phaser.Game(config);
