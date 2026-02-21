/**
 * EconomyManager - Handles all game economy and upgrade logic
 *
 * Responsibilities:
 * - Track currency (counter)
 * - Track upgrade prices and multipliers
 * - Handle purchase transactions
 * - Calculate upgrade effects
 *
 * Pure business logic with no side effects (no camera shake, no particles, no UI updates)
 *
 * Note: Uses global LargeNumber class loaded via script tag
 */

export default class EconomyManager {
    constructor(initialState = {}) {
        // Main currency and multipliers
        this.counter = new LargeNumber(initialState.counter || "0");
        this.multiplier = new LargeNumber(initialState.multiplier || "10");
        this.incrementValue = new LargeNumber(initialState.incrementValue || "1");

        // Prices for upgrades
        this.multiPrice = new LargeNumber(initialState.multiPrice || "100");
        this.autoPrice = new LargeNumber(initialState.autoPrice || "100");
        this.gravityPrice = new LargeNumber(initialState.gravityPrice || "100");
        this.autoMultiPrice = new LargeNumber(initialState.autoMultiPrice || "100000");
        this.playerPrice = new LargeNumber(initialState.playerPrice || "1000000");

        // Auto-click intervals
        this.multiInterval = initialState.multiInterval || 1000;
        this.autoInterval = initialState.autoInterval || 500;
        this.autoMultiInterval = initialState.autoMultiInterval || 1000;
    }

    // ============== QUERY METHODS ==============

    /**
     * Check if player can afford a given price
     * @param {LargeNumber} price
     * @returns {boolean}
     */
    canAfford(price) {
        return this.counter.getValue() >= price.getValue();
    }

    /**
     * Get formatted counter value for display
     * @returns {string}
     */
    getFormattedCounter() {
        if (this.counter.getValue() > 1000000000) {
            return this.counter.getValueInENotation();
        } else {
            return this.counter.getValue().toString();
        }
    }

    /**
     * Get formatted multiplier text for display
     * @returns {string}
     */
    getFormattedMultiplier() {
        let text;
        if (this.multiplier.getValue() > 1000000) {
            text = "n x " + this.multiplier.getValueInENotation();
        } else {
            text = "n x " + this.multiplier.getValue();
        }
        text += " (" + this.incrementValue.getValueInENotation() + ")";
        return text;
    }

    // ============== TRANSACTION METHODS ==============

    /**
     * Buy multiplier upgrade (doubles increment value)
     * @returns {boolean} Success status
     */
    buyMultiplier() {
        if (this.canAfford(this.multiPrice)) {
            this.counter.decrement(this.multiPrice.getValue());
            this.multiPrice.multiply(2n);
            this.multiplier.increment(1);
            this.incrementValue.multiply(2n);
            return true;
        }
        log("not enough C");
        return false;
    }

    /**
     * Buy auto-click upgrade (speeds up auto-clicking)
     * @returns {boolean} Success status
     */
    buyAutoClick() {
        if (this.canAfford(this.autoPrice)) {
            this.counter.decrement(this.autoPrice.getValue());
            this.autoPrice.multiply(2n);
            this.autoInterval -= this.autoInterval * 0.01;
            if (this.autoInterval < 1) this.autoInterval = 1;
            return true;
        }
        log("not enough C");
        return false;
    }

    /**
     * Buy gravity upgrade (increases black hole gravity)
     * @returns {boolean} Success status
     */
    buyGravity() {
        if (this.canAfford(this.gravityPrice)) {
            this.counter.decrement(this.gravityPrice.getValue());
            this.gravityPrice.multiply(2n);
            return true;
        }
        log("not enough C");
        return false;
    }

    /**
     * Buy auto-multiplier upgrade
     * @returns {boolean} Success status
     */
    buyAutoMulti() {
        if (this.canAfford(this.autoMultiPrice)) {
            this.counter.decrement(this.autoMultiPrice.getValue());
            this.autoMultiPrice.multiply(2n);
            return true;
        }
        log("not enough C");
        return false;
    }

    /**
     * Buy object (black hole)
     * @returns {boolean} Success status
     */
    buyObject() {
        if (this.canAfford(this.playerPrice)) {
            this.counter.decrement(this.playerPrice.getValue());
            return true;
        }
        log("not enough C");
        return false;
    }

    // ============== GAME ACTIONS ==============

    /**
     * Increment the main counter
     * @param {BigInt} amount Amount to increment (defaults to incrementValue)
     */
    incrementCounter(amount) {
        if (amount === undefined) {
            amount = this.incrementValue.getValue();
        }
        this.counter.increment(amount);
    }

    // ============== SERIALIZATION ==============

    /**
     * Get current state for saving
     * @returns {Object} Serializable state object
     */
    getState() {
        return {
            counter: this.counter.getValue().toString(),
            multiplier: this.multiplier.getValue().toString(),
            incrementValue: this.incrementValue.getValue().toString(),
            multiPrice: this.multiPrice.getValue().toString(),
            multiInterval: this.multiInterval,
            autoInterval: this.autoInterval,
            autoPrice: this.autoPrice.getValue().toString(),
            gravityPrice: this.gravityPrice.getValue().toString(),
            autoMultiInterval: this.autoMultiInterval,
            autoMultiPrice: this.autoMultiPrice.getValue().toString(),
            playerPrice: this.playerPrice.getValue().toString()
        };
    }

    /**
     * Restore state from loaded data
     * @param {Object} state Loaded state object
     */
    restoreState(state) {
        if (!state) return;

        this.counter.setValue(state.counter);
        this.multiplier.setValue(state.multiplier);
        this.incrementValue.setValue(state.incrementValue);
        this.multiPrice.setValue(state.multiPrice);
        this.multiInterval = state.multiInterval;
        this.autoInterval = state.autoInterval;
        this.autoPrice.setValue(state.autoPrice);
        this.gravityPrice.setValue(state.gravityPrice);
        this.autoMultiInterval = state.autoMultiInterval;
        this.autoMultiPrice.setValue(state.autoMultiPrice);
        this.playerPrice.setValue(state.playerPrice);
    }
}
