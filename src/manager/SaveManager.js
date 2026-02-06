/**
 * SaveManager - Handles all game save/load operations
 *
 * Responsibilities:
 * - Serialize/deserialize game state to localStorage
 * - Auto-save timer management
 * - Import/export functionality
 * - Save notifications
 */

export default class SaveManager {
    constructor(scene) {
        this.scene = scene;
        this.autoSaveInterval = null;
        this.lastSaveTime = Date.now();
        this.saveNotificationText = null;
        this.localStorageKey = "clickerbase_save";
    }

    /**
     * Save game state to localStorage
     * @param {Object} gameState - Serializable game state object
     * @returns {boolean} - Success status
     */
    saveGame(gameState) {
        try {
            const saveData = {
                version: "1.0",
                timestamp: Date.now(),
                gameState: gameState
            };

            localStorage.setItem(this.localStorageKey, JSON.stringify(saveData));
            this.lastSaveTime = Date.now();
            log("Game saved successfully!");
            this.showSaveNotification("Game Saved!");
            return true;
        } catch (error) {
            log("Error saving game:", error);
            this.showSaveNotification("Save Failed!", "#ff0000");
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {Object|null} - Game state object or null if no save exists
     */
    loadGame() {
        try {
            const savedData = localStorage.getItem(this.localStorageKey);
            if (!savedData) {
                log("No save data found, starting fresh");
                return null;
            }

            const saveData = JSON.parse(savedData);
            log("Game loaded successfully!");
            this.showSaveNotification("Game Loaded!", "#00ff00");
            return saveData.gameState;
        } catch (error) {
            log("Error loading game:", error);
            this.showSaveNotification("Load Failed!", "#ff0000");
            return null;
        }
    }

    /**
     * Start auto-save timer
     * @param {Function} saveCallback - Function to call for auto-save
     * @param {number} intervalMs - Auto-save interval in milliseconds (default: 30000)
     */
    startAutoSave(saveCallback, intervalMs = 30000) {
        // Clear existing interval if any
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            saveCallback();
        }, intervalMs);
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * Export save data to clipboard
     */
    exportSave() {
        const saveData = localStorage.getItem(this.localStorageKey);
        if (saveData) {
            // Copy to clipboard
            navigator.clipboard.writeText(saveData).then(() => {
                log("Save exported to clipboard!");
                this.showSaveNotification("Exported to Clipboard!", "#00aaff");
            }).catch(err => {
                log("Failed to copy to clipboard:", err);
                // Fallback: show in console
                console.log("Save data:", saveData);
                this.showSaveNotification("Check Console for Save!", "#ffaa00");
            });
        }
    }

    /**
     * Import save data from string
     * @param {string} saveString - JSON save data string
     * @returns {boolean} - Success status
     */
    importSave(saveString) {
        try {
            const saveData = JSON.parse(saveString);
            localStorage.setItem(this.localStorageKey, saveString);
            this.scene.scene.restart();
            log("Save imported successfully!");
            return true;
        } catch (error) {
            log("Error importing save:", error);
            this.showSaveNotification("Import Failed!", "#ff0000");
            return false;
        }
    }

    /**
     * Delete save data with confirmation
     */
    deleteSave() {
        if (confirm("Are you sure you want to delete your save? This cannot be undone!")) {
            localStorage.removeItem(this.localStorageKey);
            this.scene.scene.restart();
            log("Save deleted!");
        }
    }

    /**
     * Show a temporary save notification
     * @param {string} text - Notification text
     * @param {string} color - Text color (default: "#00ff00")
     */
    showSaveNotification(text, color = "#00ff00") {
        // Destroy existing notification if present
        if (this.saveNotificationText) {
            this.saveNotificationText.destroy();
        }

        const width = gameConfig.screenResolution.width;

        this.saveNotificationText = this.scene.add.text(width - 20, 20, text, {
            align: "right",
            fontFamily: gameConfig.defaultFont,
            color: color,
            fontSize: "24px",
            stroke: "#000000",
            strokeThickness: 2,
        }).setOrigin(1, 0).setDepth(10);

        // Fade out after 2 seconds
        this.scene.tweens.add({
            targets: this.saveNotificationText,
            alpha: 0,
            duration: 2000,
            delay: 1000,
            onComplete: () => {
                if (this.saveNotificationText) {
                    this.saveNotificationText.destroy();
                    this.saveNotificationText = null;
                }
            }
        });
    }
}
