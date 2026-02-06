/**
 * UIManager - Handles all UI creation and updates
 *
 * Responsibilities:
 * - Create all buttons and text elements
 * - Update button states (enabled/disabled based on affordability)
 * - Update display text (counter, prices, multiplier)
 * - Handle button hover effects
 *
 * Uses callback injection pattern for button actions
 */

export default class UIManager {
    constructor(scene, callbacks) {
        this.scene = scene;
        this.callbacks = callbacks; // Callbacks for button actions

        this.buttons = {};
        this.buttonGraphics = {};
        this.texts = {};
    }

    /**
     * Create all UI elements
     */
    createAllUI() {
        this.createButtons();
    }

    /**
     * Helper function to create futuristic-styled buttons
     * @private
     */
    createFuturisticButton(x, y, width, height, isMainButton = false) {
        const graphics = this.scene.add.graphics();

        // Gradient-like effect with multiple rectangles
        const baseColor = isMainButton ? 0x001155 : 0x002266;
        const highlightColor = isMainButton ? 0x0033aa : 0x0044cc;
        const borderColor = 0x00aaff;

        // Outer frame (glow effect)
        graphics.fillStyle(borderColor, 0.3);
        graphics.fillRoundedRect(x - width / 2 - 2, y - height / 2 - 2, width + 4, height + 4, 8);

        // Main button
        graphics.fillStyle(baseColor);
        graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, 6);

        // Highlight at top
        graphics.fillStyle(highlightColor, 0.7);
        graphics.fillRoundedRect(x - width / 2 + 2, y - height / 2 + 2, width - 4, height / 3, 4);

        // Glowing border
        graphics.lineStyle(1, borderColor, 0.8);
        graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 6);

        return graphics;
    }

    /**
     * Helper function for hover effects on buttons
     * @private
     */
    createHoverEffect(button, graphics, text, originalScale = 1) {
        button.on("pointerover", () => {
            this.scene.tweens.add({
                targets: [graphics, text],
                scaleX: originalScale * 1.05,
                scaleY: originalScale * 1.05,
                duration: 100,
                ease: "Power2",
            });

            // Additional glow effect
            graphics.setTint(0x88ccff);
        });

        button.on("pointerout", () => {
            this.scene.tweens.add({
                targets: [graphics, text],
                scaleX: originalScale,
                scaleY: originalScale,
                duration: 100,
                ease: "Power2",
            });

            graphics.clearTint();
        });

        button.on("pointerdown", () => {
            this.scene.tweens.add({
                targets: [graphics, text],
                scaleX: originalScale * 0.95,
                scaleY: originalScale * 0.95,
                duration: 50,
                ease: "Power2",
                yoyo: true,
            });
        });
    }

    /**
     * Create all buttons
     */
    createButtons() {
        const width = gameConfig.screenResolution.width;
        const height = gameConfig.screenResolution.height;
        const centerX = width * 0.5;
        const centerY = height * 0.5;

        // Main button (Increment) - Zone remains
        this.buttons.increment = this.scene.add
            .zone(0, 0, width, height)
            .setInteractive({
                useHandCursor: true,
            })
            .setOrigin(0)
            .on("pointerdown", () => {
                if (this.callbacks.onIncrement) {
                    this.callbacks.onIncrement();
                }
            });

        this.buttons.increment.on("pointerdown", () => {
            if (this.buttonGraphics.increment && this.texts.increment) {
                this.scene.tweens.add({
                    targets: [this.buttonGraphics.increment, this.texts.increment],
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 50,
                    ease: "Power2",
                    yoyo: true,
                });
            }
        });

        // Multi Button
        this.buttonGraphics.multi = this.createFuturisticButton(100, centerY, 120, 50);
        this.buttons.multi = this.scene.add
            .zone(100, centerY, 120, 50)
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                this.scene.cameras.main.shake(50);
                if (this.callbacks.onMulti) {
                    this.callbacks.onMulti();
                }
            });

        this.texts.multi = this.scene.add
            .text(100, centerY, "MULTI", {
                align: "center",
                fontFamily: gameConfig.defaultFont,
                color: "#00ccff",
                fontSize: "18px",
                stroke: "#000044",
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Auto Button
        this.buttonGraphics.auto = this.createFuturisticButton(100, centerY + 100, 120, 50);
        this.buttons.auto = this.scene.add
            .zone(100, centerY + 100, 120, 50)
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                this.scene.cameras.main.shake(50);
                if (this.callbacks.onAuto) {
                    this.callbacks.onAuto();
                }
            });

        this.texts.auto = this.scene.add
            .text(100, centerY + 100, "AUTOCLICK", {
                align: "center",
                fontFamily: gameConfig.defaultFont,
                color: "#00ccff",
                fontSize: "16px",
                stroke: "#000044",
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Auto Multi Button
        this.buttonGraphics.autoMulti = this.createFuturisticButton(100, centerY + 200, 120, 50);
        this.buttons.autoMulti = this.scene.add
            .zone(100, centerY + 200, 120, 50)
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                this.scene.cameras.main.shake(50);
                if (this.callbacks.onAutoMulti) {
                    this.callbacks.onAutoMulti();
                }
            });

        this.texts.autoMulti = this.scene.add
            .text(100, centerY + 200, "AUTO MULTI", {
                align: "center",
                fontFamily: gameConfig.defaultFont,
                color: "#00ccff",
                fontSize: "16px",
                stroke: "#000044",
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.buttons.autoMulti.setVisible(false);
        this.texts.autoMulti.setVisible(false);
        this.buttonGraphics.autoMulti.setVisible(false);

        // Buy Player Button
        this.buttonGraphics.buyPlayer = this.createFuturisticButton(100, centerY + 300, 120, 60);
        this.buttons.buyPlayer = this.scene.add
            .zone(100, centerY + 300, 120, 60)
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                this.scene.cameras.main.shake(50);
                if (this.callbacks.onBuyObj) {
                    this.callbacks.onBuyObj();
                }
            });

        this.texts.buyPlayer = this.scene.add
            .text(100, centerY + 300, "BUY OBJ", {
                align: "center",
                fontFamily: gameConfig.defaultFont,
                color: "#00ccff",
                fontSize: "16px",
                stroke: "#000044",
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Buy Gravity Button
        this.buttonGraphics.buyGravity = this.createFuturisticButton(100, centerY + 400, 120, 60);
        this.buttons.buyGravity = this.scene.add
            .zone(100, centerY + 400, 120, 60)
            .setInteractive({
                useHandCursor: true,
            })
            .on("pointerdown", () => {
                this.scene.cameras.main.shake(50);
                if (this.callbacks.onBuyGravity) {
                    this.callbacks.onBuyGravity();
                }
            });

        this.texts.buyGravity = this.scene.add
            .text(100, centerY + 400, "BUY GRAV", {
                align: "center",
                fontFamily: gameConfig.defaultFont,
                color: "#00ccff",
                fontSize: "16px",
                stroke: "#000044",
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Save/Load Buttons (top right corner)
        const saveButtonY = 80;
        const buttonSpacing = 70;

        // Save Button
        this.buttonGraphics.save = this.createFuturisticButton(width - 100, saveButtonY, 140, 50);
        this.buttons.save = this.scene.add
            .zone(width - 100, saveButtonY, 140, 50)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                if (this.callbacks.onSave) {
                    this.callbacks.onSave();
                }
            });
        this.texts.save = this.scene.add
            .text(width - 100, saveButtonY, "SAVE", {
                align: "center",
                fontFamily: gameConfig.defaultFont,
                color: "#00ff88",
                fontSize: "18px",
                stroke: "#000044",
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.createHoverEffect(this.buttons.save, this.buttonGraphics.save, this.texts.save);

        // Export Button
        this.buttonGraphics.export = this.createFuturisticButton(width - 100, saveButtonY + buttonSpacing, 140, 50);
        this.buttons.export = this.scene.add
            .zone(width - 100, saveButtonY + buttonSpacing, 140, 50)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                if (this.callbacks.onExport) {
                    this.callbacks.onExport();
                }
            });
        this.texts.export = this.scene.add
            .text(width - 100, saveButtonY + buttonSpacing, "EXPORT", {
                align: "center",
                fontFamily: gameConfig.defaultFont,
                color: "#00ccff",
                fontSize: "16px",
                stroke: "#000044",
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.createHoverEffect(this.buttons.export, this.buttonGraphics.export, this.texts.export);

        // Delete Save Button
        this.buttonGraphics.delete = this.createFuturisticButton(width - 100, saveButtonY + buttonSpacing * 2, 140, 50);
        this.buttons.delete = this.scene.add
            .zone(width - 100, saveButtonY + buttonSpacing * 2, 140, 50)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", () => {
                if (this.callbacks.onDelete) {
                    this.callbacks.onDelete();
                }
            });
        this.texts.delete = this.scene.add
            .text(width - 100, saveButtonY + buttonSpacing * 2, "DELETE SAVE", {
                align: "center",
                fontFamily: gameConfig.defaultFont,
                color: "#ff4444",
                fontSize: "14px",
                stroke: "#000044",
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.createHoverEffect(this.buttons.delete, this.buttonGraphics.delete, this.texts.delete);
    }

    /**
     * Update button states based on affordability
     * Called each frame from update loop
     * @param {Object} affordability - Object with boolean flags for each button
     */
    updateButtonStates(affordability) {
        if (this.buttonGraphics.multi) {
            this.buttonGraphics.multi.setAlpha(affordability.multi ? 1 : 0.3);
        }
        if (this.buttonGraphics.auto) {
            this.buttonGraphics.auto.setAlpha(affordability.auto ? 1 : 0.3);
        }
        if (this.buttonGraphics.autoMulti) {
            this.buttonGraphics.autoMulti.setAlpha(affordability.autoMulti ? 1 : 0.3);
        }
        if (this.buttonGraphics.buyPlayer) {
            this.buttonGraphics.buyPlayer.setAlpha(affordability.buyPlayer ? 1 : 0.3);
        }
        if (this.buttonGraphics.buyGravity) {
            this.buttonGraphics.buyGravity.setAlpha(affordability.buyGravity ? 1 : 0.3);
        }
    }

    /**
     * Update button text labels with current prices
     * Called each frame from update loop
     * @param {Object} prices - Object with formatted price strings for each button
     */
    updateButtonTexts(prices) {
        if (this.texts.multi) {
            this.texts.multi.text = "Add PPC\n" + prices.multi;
        }
        if (this.texts.auto) {
            this.texts.auto.text = "AUTO CLICK\n" + prices.auto;
        }
        if (this.texts.autoMulti) {
            this.texts.autoMulti.text = "AUTO ADD PPC\n" + prices.autoMulti;
        }
        if (this.texts.buyGravity) {
            this.texts.buyGravity.text = "BUY GRAVITY\n" + prices.gravity;
        }
    }
}
