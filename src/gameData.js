// Game configuration data

const gameData = {
    // Particle system limits
    maxParticles: 10000,

    // Auto-save interval (milliseconds)
    autoSaveInterval: 30000, // 30 seconds

    // Initial values
    initialCounter: "0",
    initialMultiplier: "1",
    initialIncrementValue: "1",

    // Upgrade prices
    initialMultiPrice: "100",
    initialAutoPrice: "100",
    initialGravityPrice: "100",
    initialAutoMultiPrice: "100000",
    initialPlayerPrice: "1000000",

    // Intervals
    initialAutoInterval: 500,
    initialMultiInterval: 1000,
    initialAutoMultiInterval: 1000,

    // Upgrade scaling
    priceMultiplier: 2, // Prices double with each purchase
    autoIntervalReduction: 0.01, // Auto-clicker speeds up by 1% per purchase
    minAutoInterval: 1, // Minimum auto-clicker interval (ms)

    // Black hole settings
    blackHoleSpiral: "fibonacci",
    blackHoleSpiralDistance: 5,
    blackHoleInitialGravity: 1,
    blackHoleGravityIncrement: 1,

    // Save system
    saveVersion: "1.0",
    localStorageKey: "clickerbase_save"
};
