import BlackHole from "./manager/blackHole.js";
import PhysicsParticle from "./manager/PhysicsParticle.js";
import ParticlePoolManager from "./manager/ParticlePoolManager.js";
import SaveManager from "./manager/SaveManager.js";
import EconomyManager from "./manager/EconomyManager.js";
import UIManager from "./manager/UIManager.js";
import ParticleSystemManager from "./manager/ParticleSystemManager.js";

export default class gameScene extends Phaser.Scene {
    constructor() {
        super({
            key: "gameScene",
        });
    }

    preload() {
        this.load.image("btn", "assets/ButtonGrey.png");
        this.load.image("sprite", "assets/spr01.png");
        //this.load.plugin("rexwarppipelineplugin", "src/rexwarppipelineplugin.min.js", true);

        // load (coin flip) animations, e.g. for animated particles
        this.load.spritesheet("CoinD", "assets/Coin/spr_coin_azu.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.spritesheet("CoinP", "assets/Coin/spr_coin_strip4.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
        this.load.spritesheet("CoinR", "assets/Coin/MonedaR.png", {
            frameWidth: 16,
            frameHeight: 16,
        });
    }

    init() {
        // Initialize economy manager

        // TODO use initial GameData!

        this.economy = new EconomyManager( 
            {



            } );

        this.countInterval; // interval
        this.scl = 1;

        this.blackHoles = [];
        this.blackHoleIndex = 0;

    }

    create() {
        log("GAME SCENE!");

        this.camera = this.cameras.main;

        this.numberText = this.add.text(50, 75, "0", {
            align: "left",
            fontFamily: gameConfig.defaultFont,
            color: "#F0F0F0",
            fontSize: "168px",
        });
        this.numberText.setDepth(2).setOrigin(0);

        this.multiplierText = this.add.text(50, 250, "n x " + this.economy.multiplier.getValue(), {
            align: "left",
            fontFamily: gameConfig.defaultFont,
            color: "#F0F0F0",
            fontSize: "68px",
        });
        this.multiplierText.setOrigin(0);

        // Initialize SaveManager
        this.saveManager = new SaveManager(this);

        // Try to load saved game first
        this.loadGame();

        // Initialize UIManager with callbacks
        this.uiManager = new UIManager(this, {
            onIncrement: () => this.incrMainCounter(),
            onMulti: () => this.buyMultiplier(),
            onAuto: () => this.buyAutoClick(),
            onAutoMulti: () => this.buyAutoMulti(),
            onBuyObj: () => this.buyObject(),
            onBuyGravity: () => this.buyGravity(),
            onSave: () => this.saveGame(),
            onExport: () => this.exportSave(),
            onDelete: () => this.deleteSave()
        });
        this.uiManager.createAllUI();

        this.createParticleSystem();

        // Only create initial black hole if loading didn't restore any
        if (this.blackHoles.length === 0) {
            this.createBlackHoles(1);
        }

        this.scene.launch("TextScene");

        // Start auto-save (every 30 seconds)
        this.saveManager.startAutoSave(() => this.saveGame(), 30000);

        // Keyboard shortcuts for save system
        this.input.keyboard.on('keydown-S', (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.saveGame();
            }
        });

        this.input.keyboard.on('keydown-E', (event) => {
            if (event.ctrlKey || event.metaKey) {
                event.preventDefault();
                this.exportSave();
            }
        });

    }

    // ============== SAVE SYSTEM ==============

    /**
     * Get current game state as serializable object
     * @returns {Object} Game state for saving
     */
    getGameState() {
        return {
            // Get economy state from economy manager
            ...this.economy.getState(),
            blackHoleIndex: this.blackHoleIndex,
            // Save black hole data (filter out null entries)
            blackHoles: this.blackHoles.filter(bh => bh != null).map(bh => ({
                x: bh.x,
                y: bh.y,
                gravity: bh.well.gravity,
                power: bh.well.power,
                epsilon: bh.well.epsilon
            }))
        };
    }

    /**
     * Restore game state from loaded data
     * @param {Object} state - Loaded game state
     */
    restoreGameState(state) {
        if (!state) return;

        // Restore economy state
        this.economy.restoreState(state);
        this.blackHoleIndex = state.blackHoleIndex;

        // Restore black holes after particle emitter is created
        if (state.blackHoles && state.blackHoles.length > 0) {
            // Store for later restoration after createParticleEmitter
            this.savedBlackHoles = state.blackHoles;
        }

        // Update multiplier text
        if (this.multiplierText) {
            this.multiplierText.text = this.economy.getFormattedMultiplier();
        }

        // Restart auto-clicker if it was running
        if (this.economy.autoInterval < 500) {
            this.setAutoCounter(this.economy.autoInterval);
        }
    }

    /**
     * Save game (delegates to SaveManager)
     */
    saveGame() {
        return this.saveManager.saveGame(this.getGameState());
    }

    /**
     * Load game (delegates to SaveManager)
     */
    loadGame() {
        const state = this.saveManager.loadGame();
        this.restoreGameState(state);
        return state !== null;
    }

    /**
     * Export save (delegates to SaveManager)
     */
    exportSave() {
        this.saveManager.exportSave();
    }

    /**
     * Import save (delegates to SaveManager)
     */
    importSave(saveString) {
        return this.saveManager.importSave(saveString);
    }

    /**
     * Delete save (delegates to SaveManager)
     */
    deleteSave() {
        this.saveManager.deleteSave();
    }

    // ============== END SAVE SYSTEM ==============

    createBlackHoles(amount) {
        let dist = 5;
        let hAmount = amount;

        for (let i = 0; i < hAmount; i++) {
            let index = this.blackHoleIndex;
            let pos = getSpiralPosition("fibonacci", index, dist, centerX, centerY);
            this.blackHoles[index] = new BlackHole(this, pos.x, pos.y, "sprite", 0, {
                speed: {
                    x: 1,
                    y: 1,
                },
            });
            // gravity uses constructor default (50)
            this.blackHoleIndex += 1;
        }
    }


    buyMultiplier() {
        if (this.economy.buyMultiplier()) {
            // Update UI after successful purchase
            this.multiplierText.text = this.economy.getFormattedMultiplier();
        }
    }

    buyAutoMulti() {
        this.economy.buyAutoMulti();
    }

    buyGravity() {
        if (this.economy.buyGravity()) {
            // Apply gravity upgrade to all black holes
            for (let i = 0; i < this.blackHoles.length; i++) {
                this.blackHoles[i].well.gravity += 100;
            }
        }
    }

    incrMainCounter() {
        let pExplode = Math.round(Number(this.economy.multiplier.getValue()));
        if (pExplode > gameData.maxParticles) pExplode = gameData.maxParticles;
        this.explodeParticles(this.input.activePointer.x, this.input.activePointer.y, pExplode);
        this.economy.incrementCounter();
    }

    buyAutoClick() {
        if (this.economy.buyAutoClick()) {
            // Apply new auto-click interval
            this.setAutoCounter(this.economy.autoInterval);
        }
    }

    setAutoCounter(newInterval) {
        if (this.countInterval != undefined) clearInterval(this.countInterval);
        this.countInterval = setInterval(
            () => {
                this.incrMainCounter();
            },
            newInterval,
            this
        );
    }

    setAutoMultiCounter(newInterval) {
        if (this.autoMultiInterval != undefined) clearInterval(this.autoMultiInterval);
        this.autoMultiInterval = setInterval(
            () => {
                this.incrMainCounter();
            },
            newInterval,
            this
        );
    }

    buyObject() {
        if (this.economy.buyObject()) {
            // Create a new black hole
            this.createBlackHoles(1);
        }
    }

    update() {
        // Update black holes
        for (let i = 0; i < this.blackHoles.length; i++) {
            if (this.blackHoles[i]) {
                this.blackHoles[i].update();
            }
        }

        // Update particle system and apply black hole gravity
        this.particleSystem.update(this.time.now, this.game.loop.delta);
        this.particleSystem.applyGravityFromBlackHoles(this.blackHoles);

        // Update UI through UIManager
        this.uiManager.updateButtonTexts({
            multi: this.economy.multiPrice.getValueInENotation(),
            auto: this.economy.autoPrice.getValueInENotation(),
            autoMulti: this.economy.autoMultiPrice.getValueInENotation(),
            gravity: this.economy.gravityPrice.getValueInENotation()
        });

        this.uiManager.updateButtonStates({
            multi: this.economy.canAfford(this.economy.multiPrice),
            auto: this.economy.canAfford(this.economy.autoPrice),
            autoMulti: this.economy.canAfford(this.economy.autoMultiPrice),
            buyPlayer: this.economy.canAfford(this.economy.playerPrice),
            buyGravity: this.economy.canAfford(this.economy.gravityPrice)
        });

        this.numberText.text = this.economy.getFormattedCounter();
    }

    // Particles
    createParticleSystem() {
        // Initialize particle system manager
        this.particleSystem = new ParticleSystemManager(this, gameData.maxParticles);
        this.particleSystem.initialize();

        // Restore black holes from save if available
        if (this.savedBlackHoles && this.savedBlackHoles.length > 0) {
            this.savedBlackHoles.forEach(bhData => {
                if (!bhData) return; // Skip null entries

                const bh = new BlackHole(this, bhData.x, bhData.y, "sprite", 0, {
                    speed: { x: 1, y: 1 }
                });
                bh.well.gravity = bhData.gravity || 200;
                bh.well.power = bhData.power || 10000;
                bh.well.epsilon = bhData.epsilon || 5000;
                this.blackHoles.push(bh);
            });
            this.savedBlackHoles = null; // Clear after restoration
            log("Restored " + this.blackHoles.length + " black holes from save");
        }
    }

    explodeParticles(x, y, amount = 50) {
        this.particleSystem.explodeParticles(x, y, amount);
    }

    applyBlackHoleGravity() {
        this.particleSystem.applyGravityFromBlackHoles(this.blackHoles);
    }
}