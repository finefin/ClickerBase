/**
 * TechTreeConfig.js
 *
 * Defines the structure and content of the upgrade tech tree.
 *
 * STRUCTURE
 * ---------
 * Each node has:
 *   id          {string}   - Unique identifier, matches the callback key in UIManager
 *   label       {string}   - Short display name shown on the node button
 *   description {string}   - Tooltip / flavour text shown below the label
 *   branch      {string}   - Which top-level branch this node belongs to
 *   parent      {string|null} - id of the prerequisite node (null = root of branch)
 *   priceKey    {string}   - Key on EconomyManager that holds the LargeNumber price
 *   callbackKey {string}   - Key in UIManager callbacks object to invoke on click
 *   icon        {string}   - Single unicode glyph rendered as the node icon
 *
 * BRANCHES
 * --------
 * Branches group related nodes into a vertical column.
 * Each branch has:
 *   id          {string}   - Unique identifier
 *   label       {string}   - Column header text
 *   color       {number}   - Phaser hex colour used for this branch's connectors & glow
 *   x           {number}   - X position of the branch column (in game pixels)
 *
 * LAYOUT
 * ------
 * Nodes are stacked vertically within their branch column.
 * The UIManager reads `branch` + the order of nodes in the array to compute Y.
 * Set nodeStartY and nodeSpacingY in LAYOUT to control vertical rhythm.
 *
 * ADDING A NEW NODE
 * -----------------
 * 1. Add an entry to `nodes` with a unique id and the correct branch/parent.
 * 2. Add the matching callback to the callbacks object passed to UIManager.
 * 3. Add the price property to EconomyManager and expose it via getState()/restoreState().
 */

const TechTreeConfig = Object.freeze({

    // ─── Layout constants ─────────────────────────────────────────────────────
    layout: {
        nodeStartY:    200,   // Y of the first node row (game pixels)
        nodeSpacingY:  140,   // Vertical gap between nodes in the same branch
        nodeWidth:     130,   // Width of each node button
        nodeHeight:    60,    // Height of each node button
        connectorWidth: 2,    // Stroke width of branch connector lines
        rootY:         120,   // Y of the invisible root row (branch headers)
    },

    // ─── Branches (columns) ───────────────────────────────────────────────────
    branches: [
        {
            id:    "production",
            label: "PRODUCTION",
            color: 0x00ccff,   // cyan
            x:     100,
        },
        {
            id:    "automation",
            label: "AUTOMATION",
            color: 0x00ff88,   // green
            x:     260,
        },
        {
            id:    "gravity",
            label: "GRAVITY",
            color: 0xff6600,   // orange
            x:     420,
        },
    ],

    // ─── Nodes ────────────────────────────────────────────────────────────────
    // Order within each branch determines vertical position (top → bottom).
    nodes: [

        // ── Production branch ─────────────────────────────────────────────────
        {
            id:          "multi_1",
            label:       "Add PPC",
            description: "Double your\nper-click value",
            branch:      "production",
            parent:      null,            // root of branch — connects to branch header
            priceKey:    "multiPrice",
            callbackKey: "onMulti",
            icon:        "✦",
        },
        {
            id:          "multi_2",
            label:       "Add PPC II",
            description: "Double again",
            branch:      "production",
            parent:      "multi_1",
            priceKey:    "multiPrice",
            callbackKey: "onMulti",
            icon:        "✦",
        },
        {
            id:          "multi_3",
            label:       "Add PPC III",
            description: "Keep doubling",
            branch:      "production",
            parent:      "multi_2",
            priceKey:    "multiPrice",
            callbackKey: "onMulti",
            icon:        "✦",
        },

        // ── Automation branch ─────────────────────────────────────────────────
        {
            id:          "auto_1",
            label:       "Auto Click",
            description: "Start auto-\nclicking",
            branch:      "automation",
            parent:      null,
            priceKey:    "autoPrice",
            callbackKey: "onAuto",
            icon:        "⟳",
        },
        {
            id:          "auto_2",
            label:       "Turbo Click",
            description: "Speed up\nauto-click 1%",
            branch:      "automation",
            parent:      "auto_1",
            priceKey:    "autoPrice",
            callbackKey: "onAuto",
            icon:        "⟳",
        },
        {
            id:          "automulti_1",
            label:       "Auto Multi",
            description: "Auto-apply\nthe multiplier",
            branch:      "automation",
            parent:      "auto_2",
            priceKey:    "autoMultiPrice",
            callbackKey: "onAutoMulti",
            icon:        "⊕",
        },

        // ── Gravity branch ────────────────────────────────────────────────────
        {
            id:          "blackhole_1",
            label:       "Buy Object",
            description: "Spawn a new\nblack hole",
            branch:      "gravity",
            parent:      null,
            priceKey:    "playerPrice",
            callbackKey: "onBuyObj",
            icon:        "◉",
        },
        {
            id:          "gravity_1",
            label:       "Gravity+",
            description: "+100 gravity\nto all holes",
            branch:      "gravity",
            parent:      "blackhole_1",
            priceKey:    "gravityPrice",
            callbackKey: "onBuyGravity",
            icon:        "◉",
        },
        {
            id:          "gravity_2",
            label:       "Gravity++",
            description: "Even more\npull",
            branch:      "gravity",
            parent:      "gravity_1",
            priceKey:    "gravityPrice",
            callbackKey: "onBuyGravity",
            icon:        "◉",
        },
    ],

    // ─── Save / system actions (rendered separately, not as tree nodes) ───────
    systemActions: [
        { id: "save",   label: "SAVE",        callbackKey: "onSave",   color: "#00ff88" },
        { id: "export", label: "EXPORT",       callbackKey: "onExport", color: "#00ccff" },
        { id: "delete", label: "DELETE SAVE",  callbackKey: "onDelete", color: "#ff4444" },
    ],
});

export default TechTreeConfig;
