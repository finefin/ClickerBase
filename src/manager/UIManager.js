import TechTreeConfig from "./TechTreeConfig.js";

/**
 * UIManager - Renders the tech tree inside a toggleable centered modal.
 *
 * The tech tree is hidden on start. A button in the bottom-left opens/closes it.
 * All tree objects live in a Phaser Container so show/hide is a single call.
 *
 * Responsibilities:
 * - Fullscreen click zone for the main increment action
 * - Bottom-left toggle button (always visible)
 * - Centered modal: dim overlay + panel background + tech tree contents
 * - System buttons (save / export / delete) — top-right, always visible
 */

export default class UIManager {
    constructor(scene, callbacks) {
        this.scene     = scene;
        this.callbacks = callbacks;

        // Keyed by node.id
        this.nodeGraphics  = {};
        this.nodeZones     = {};
        this.nodePriceText = {};
        this.nodeIconText  = {};
        this.nodeLabelText = {};

        // System buttons — keyed by action.id
        this.systemButtonGraphics = {};
        this.systemButtonZones    = {};
        this.systemButtonTexts    = {};

        // Modal state
        this._modalOpen      = false;
        this._modalContainer = null;  // Phaser.GameObjects.Container
        this._dimOverlay     = null;

        // Tooltip (lives outside modal so it can overflow the container bounds)
        this._tooltipGfx  = null;
        this._tooltipText = null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    createAllUI() {
        this._drawClickZone();
        this._drawSystemButtons();
        this._drawToggleButton();
        this._buildModal();          // hidden by default
    }

    /** Call every frame — skips work when modal is closed. */
    updateButtonTexts(prices) {
        if (!this._modalOpen) return;
        for (const node of TechTreeConfig.nodes) {
            const text = this.nodePriceText[node.id];
            if (text && prices[node.priceKey] !== undefined) {
                text.setText(prices[node.priceKey]);
            }
        }
    }

    updateButtonStates(affordability) {
        if (!this._modalOpen) return;
        for (const node of TechTreeConfig.nodes) {
            const gfx = this.nodeGraphics[node.id];
            if (gfx) {
                const canAfford = affordability[node.callbackKey] !== false;
                gfx.setAlpha(canAfford ? 1.0 : 0.35);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Toggle button — bottom-left, always visible
    // ─────────────────────────────────────────────────────────────────────────

    _drawToggleButton() {
        const { height } = gameConfig.screenResolution;
        const bx = 80, by = height - 50;
        const bw = 140, bh = 46;

        const gfx = this.scene.add.graphics().setDepth(5);
        this._redrawToggleButton(gfx, bx, by, bw, bh, false);

        const label = this.scene.add.text(bx, by, "⬡  TECH TREE", {
            fontFamily: gameConfig.defaultFont,
            fontSize:   "16px",
            color:      "#00ccff",
            stroke:     "#000033",
            strokeThickness: 1,
        }).setOrigin(0.5).setDepth(6);

        const zone = this.scene.add.zone(bx, by, bw, bh)
            .setInteractive({ useHandCursor: true })
            .setDepth(7);

        zone.on("pointerdown", () => this._toggleModal());
        zone.on("pointerover", () => {
            this.scene.tweens.add({ targets: [gfx, label], scaleX: 1.06, scaleY: 1.06, duration: 80, ease: "Power2" });
        });
        zone.on("pointerout", () => {
            this.scene.tweens.add({ targets: [gfx, label], scaleX: 1, scaleY: 1, duration: 80, ease: "Power2" });
        });

        this._toggleBtnGfx   = gfx;
        this._toggleBtnLabel = label;
        this._toggleBtnW     = bw;
        this._toggleBtnH     = bh;
        this._toggleBtnX     = bx;
        this._toggleBtnY     = by;
    }

    _redrawToggleButton(gfx, x, y, w, h, isOpen) {
        gfx.clear();
        const borderColor = isOpen ? 0x00ff88 : 0x00aaff;
        gfx.fillStyle(isOpen ? 0x001a00 : 0x001133);
        gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
        gfx.fillStyle(borderColor, 0.2);
        gfx.fillRoundedRect(x - w / 2 + 2, y - h / 2 + 2, w - 4, h * 0.35, 5);
        gfx.lineStyle(1.5, borderColor, 0.9);
        gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Modal open / close
    // ─────────────────────────────────────────────────────────────────────────

    _toggleModal() {
        this._modalOpen ? this._closeModal() : this._openModal();
    }

    _openModal() {
        this._modalOpen = true;
        this._redrawToggleButton(
            this._toggleBtnGfx,
            this._toggleBtnX, this._toggleBtnY,
            this._toggleBtnW, this._toggleBtnH,
            true
        );
        this._toggleBtnLabel.setText("⬡  CLOSE");

        // Dim overlay — absorbs pointer events so clicks don't pass to game
        this._dimOverlay.setVisible(true).setInteractive();

        // Animate modal in
        this._modalContainer.setVisible(true).setScale(0.85).setAlpha(0);
        this.scene.tweens.add({
            targets:  this._modalContainer,
            scaleX:   1,
            scaleY:   1,
            alpha:    1,
            duration: 220,
            ease:     "Back.Out",
        });
    }

    _closeModal() {
        this._modalOpen = false;
        this._hideTooltip();
        this._redrawToggleButton(
            this._toggleBtnGfx,
            this._toggleBtnX, this._toggleBtnY,
            this._toggleBtnW, this._toggleBtnH,
            false
        );
        this._toggleBtnLabel.setText("⬡  TECH TREE");

        this.scene.tweens.add({
            targets:  this._modalContainer,
            scaleX:   0.85,
            scaleY:   0.85,
            alpha:    0,
            duration: 180,
            ease:     "Power2.In",
            onComplete: () => {
                this._modalContainer.setVisible(false);
                this._dimOverlay.setVisible(false).disableInteractive();
            },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Modal build — once, stays hidden until toggled
    // ─────────────────────────────────────────────────────────────────────────

    _buildModal() {
        const sw = gameConfig.screenResolution.width;
        const sh = gameConfig.screenResolution.height;

        // ── Dim overlay ──────────────────────────────────────────────────────
        this._dimOverlay = this.scene.add.graphics().setDepth(8);
        this._dimOverlay.fillStyle(0x000000, 0.6);
        this._dimOverlay.fillRect(0, 0, sw, sh);
        this._dimOverlay.setVisible(false);
        this._dimOverlay.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, sw, sh),
            Phaser.Geom.Rectangle.Contains
        );
        this._dimOverlay.on("pointerdown", () => this._closeModal());

        // ── Work out modal dimensions from config ────────────────────────────
        const branches  = TechTreeConfig.branches;
        const { nodeStartY, nodeSpacingY, nodeWidth, rootY } = TechTreeConfig.layout;

        const rowCounts = {};
        for (const node of TechTreeConfig.nodes) {
            rowCounts[node.branch] = (rowCounts[node.branch] ?? 0) + 1;
        }
        const maxRows     = Math.max(...Object.values(rowCounts));
        const firstBranch = branches[0];
        const lastBranch  = branches[branches.length - 1];

        const padding = 60;
        const modalW  = (lastBranch.x - firstBranch.x) + nodeWidth + padding * 2;
        const modalH  = nodeStartY + maxRows * nodeSpacingY + padding;

        const cx = sw * 0.5;
        const cy = sh * 0.5;

        // Shift branch x-values (originally small left-side coords) so they
        // appear centred within the modal panel
        const treeOffsetX = cx - modalW / 2 + padding - firstBranch.x + nodeWidth / 2;
        const treeOffsetY = cy - modalH / 2;

        // ── Container ────────────────────────────────────────────────────────
        this._modalContainer = this.scene.add.container(0, 0).setDepth(9).setVisible(false);

        // Panel background
        const panel = this.scene.add.graphics();
        panel.fillStyle(0x00060f, 0.97);
        panel.fillRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 14);
        panel.lineStyle(1.5, 0x0044aa, 0.9);
        panel.strokeRoundedRect(cx - modalW / 2, cy - modalH / 2, modalW, modalH, 14);
        // Top accent line
        panel.lineStyle(1, 0x0088ff, 0.35);
        panel.beginPath();
        panel.moveTo(cx - modalW / 2 + 20, cy - modalH / 2 + 2);
        panel.lineTo(cx + modalW / 2 - 20, cy - modalH / 2 + 2);
        panel.strokePath();
        this._modalContainer.add(panel);

        // Title
        const titleTxt = this.scene.add.text(cx, cy - modalH / 2 + 24, "TECH TREE", {
            fontFamily: gameConfig.defaultFont,
            fontSize:   "20px",
            color:      "#88ccff",
            align:      "center",
            stroke:     "#000000",
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(10);
        this._modalContainer.add(titleTxt);

        // Close ✕
        const closeTxt = this.scene.add.text(
            cx + modalW / 2 - 24, cy - modalH / 2 + 24,
            "✕", {
                fontFamily: gameConfig.defaultFont,
                fontSize:   "18px",
                color:      "#446688",
            }
        ).setOrigin(0.5).setDepth(10).setInteractive({ useHandCursor: true });
        closeTxt.on("pointerover",  () => closeTxt.setColor("#ffffff"));
        closeTxt.on("pointerout",   () => closeTxt.setColor("#446688"));
        closeTxt.on("pointerdown",  () => this._closeModal());
        this._modalContainer.add(closeTxt);

        // ── Connectors, headers, nodes ───────────────────────────────────────
        this._buildBranchMap(treeOffsetX, treeOffsetY);

        const connGfx = this._buildConnectorGraphics();
        this._modalContainer.add(connGfx);

        for (const branch of branches) {
            const hx = branch.x + treeOffsetX;
            const hy = treeOffsetY + rootY;
            const colorHex = "#" + branch.color.toString(16).padStart(6, "0");
            const hdr = this.scene.add.text(hx, hy, branch.label, {
                fontFamily: gameConfig.defaultFont,
                fontSize:   "13px",
                color:      colorHex,
                align:      "center",
                stroke:     "#000000",
                strokeThickness: 2,
            }).setOrigin(0.5, 1).setAlpha(0.85).setDepth(10);
            this._modalContainer.add(hdr);
        }

        for (const node of TechTreeConfig.nodes) {
            const branch = TechTreeConfig.branches.find(b => b.id === node.branch);
            const pos    = this._nodePositions[node.id];
            if (!branch || !pos) continue;
            this._createNodeButton(node, branch, pos.x, pos.y);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Layout helpers
    // ─────────────────────────────────────────────────────────────────────────

    _buildBranchMap(treeOffsetX, treeOffsetY) {
        const { nodeStartY, nodeSpacingY } = TechTreeConfig.layout;
        const branchCounters  = {};
        this._nodePositions   = {};
        this._treeOffsetX     = treeOffsetX;
        this._treeOffsetY     = treeOffsetY;

        for (const node of TechTreeConfig.nodes) {
            const branch = TechTreeConfig.branches.find(b => b.id === node.branch);
            if (!branch) continue;

            const row = branchCounters[node.branch] ?? 0;
            branchCounters[node.branch] = row + 1;

            this._nodePositions[node.id] = {
                x: branch.x + treeOffsetX,
                y: treeOffsetY + nodeStartY + row * nodeSpacingY,
            };
        }
    }

    _buildConnectorGraphics() {
        const gfx = this.scene.add.graphics().setDepth(9);
        const { nodeHeight, rootY, connectorWidth } = TechTreeConfig.layout;
        const halfH = nodeHeight / 2;

        for (const node of TechTreeConfig.nodes) {
            const branch = TechTreeConfig.branches.find(b => b.id === node.branch);
            const pos    = this._nodePositions[node.id];
            if (!branch || !pos) continue;

            const color = branch.color;
            gfx.lineStyle(connectorWidth, color, 0.5);

            if (node.parent === null) {
                const headerY = this._treeOffsetY + rootY;
                gfx.beginPath();
                gfx.moveTo(pos.x, headerY + 4);
                gfx.lineTo(pos.x, pos.y - halfH);
                gfx.strokePath();
            } else {
                const parentPos = this._nodePositions[node.parent];
                if (parentPos) {
                    gfx.beginPath();
                    gfx.moveTo(parentPos.x, parentPos.y + halfH);
                    gfx.lineTo(pos.x,       pos.y - halfH);
                    gfx.strokePath();

                    // Chevron arrow
                    const midY = (parentPos.y + halfH + pos.y - halfH) / 2;
                    gfx.lineStyle(connectorWidth, color, 0.85);
                    gfx.beginPath();
                    gfx.moveTo(pos.x - 5, midY - 5);
                    gfx.lineTo(pos.x,     midY);
                    gfx.lineTo(pos.x + 5, midY - 5);
                    gfx.strokePath();
                }
            }
        }
        return gfx;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Node buttons
    // ─────────────────────────────────────────────────────────────────────────

    _createNodeButton(node, branch, x, y) {
        const { nodeWidth: w, nodeHeight: h } = TechTreeConfig.layout;
        const color    = branch.color;
        const colorHex = "#" + color.toString(16).padStart(6, "0");

        const gfx = this.scene.add.graphics().setDepth(10);
        gfx.fillStyle(color, 0.12);
        gfx.fillRoundedRect(x - w / 2 - 4, y - h / 2 - 4, w + 8, h + 8, 10);
        gfx.fillStyle(0x000d1a);
        gfx.fillRoundedRect(x - w / 2, y - h / 2, w, h, 7);
        gfx.fillStyle(color, 0.22);
        gfx.fillRoundedRect(x - w / 2 + 2, y - h / 2 + 2, w - 4, h * 0.28, 5);
        gfx.lineStyle(1, color, 0.9);
        gfx.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 7);
        this.nodeGraphics[node.id] = gfx;
        this._modalContainer.add(gfx);

        const icon = this.scene.add.text(x - w / 2 + 8, y - h / 2 + 6, node.icon, {
            fontFamily: "monospace", fontSize: "13px", color: colorHex,
        }).setDepth(11).setAlpha(0.85);
        this.nodeIconText[node.id] = icon;
        this._modalContainer.add(icon);

        const lbl = this.scene.add.text(x, y - 10, node.label, {
            fontFamily: gameConfig.defaultFont,
            fontSize:   "13px",
            color:      colorHex,
            align:      "center",
            stroke:     "#000011",
            strokeThickness: 1,
        }).setOrigin(0.5).setDepth(11);
        this.nodeLabelText[node.id] = lbl;
        this._modalContainer.add(lbl);

        const price = this.scene.add.text(x, y + 12, "...", {
            fontFamily: gameConfig.defaultFont,
            fontSize:   "11px",
            color:      "#99bbdd",
            align:      "center",
        }).setOrigin(0.5).setDepth(11);
        this.nodePriceText[node.id] = price;
        this._modalContainer.add(price);

        // Zone must be at depth 12 — above all graphics in the container
        const zone = this.scene.add.zone(x, y, w, h)
            .setInteractive({ useHandCursor: true })
            .setDepth(12);

        zone.on("pointerdown", () => {
            if (!this._modalOpen) return;
            this.scene.cameras.main.shake(25);
            const cb = this.callbacks[node.callbackKey];
            if (cb) cb();
            this.scene.tweens.add({
                targets: [gfx, lbl, price],
                scaleX: 0.93, scaleY: 0.93,
                duration: 50, ease: "Power2", yoyo: true,
            });
        });

        zone.on("pointerover", () => {
            if (!this._modalOpen) return;
            this.scene.tweens.add({
                targets: [gfx, lbl, price],
                scaleX: 1.06, scaleY: 1.06, duration: 100, ease: "Power2",
            });
            this._showTooltip(node, x, y, colorHex);
        });

        zone.on("pointerout", () => {
            this.scene.tweens.add({
                targets: [gfx, lbl, price],
                scaleX: 1, scaleY: 1, duration: 100, ease: "Power2",
            });
            this._hideTooltip();
        });

        this.nodeZones[node.id] = zone;
        this._modalContainer.add(zone);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Tooltip — outside container so it can't be clipped
    // ─────────────────────────────────────────────────────────────────────────

    _showTooltip(node, x, y, colorHex) {
        this._hideTooltip();
        const { nodeWidth: w } = TechTreeConfig.layout;
        const tx = x + w / 2 + 8;
        const tw = 160, th = 60;

        this._tooltipGfx = this.scene.add.graphics().setDepth(20);
        this._tooltipGfx.fillStyle(0x000d1f, 0.96);
        this._tooltipGfx.fillRoundedRect(tx, y - th / 2, tw, th, 6);
        this._tooltipGfx.lineStyle(1, 0x0055aa, 0.8);
        this._tooltipGfx.strokeRoundedRect(tx, y - th / 2, tw, th, 6);

        this._tooltipText = this.scene.add.text(tx + tw / 2, y, node.description, {
            fontFamily: gameConfig.defaultFont,
            fontSize:   "12px",
            color:      "#ccddff",
            align:      "center",
        }).setOrigin(0.5).setDepth(21);
    }

    _hideTooltip() {
        if (this._tooltipGfx)  { this._tooltipGfx.destroy();  this._tooltipGfx  = null; }
        if (this._tooltipText) { this._tooltipText.destroy();  this._tooltipText = null; }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // System buttons — top-right, always visible
    // ─────────────────────────────────────────────────────────────────────────

    _drawSystemButtons() {
        const sw = gameConfig.screenResolution.width;
        const startY = 60, gap = 55, bw = 140, bh = 42;

        TechTreeConfig.systemActions.forEach((action, i) => {
            const bx = sw - 90;
            const by = startY + i * gap;

            const gfx = this.scene.add.graphics().setDepth(2);
            gfx.fillStyle(0x001133);
            gfx.fillRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 6);
            gfx.lineStyle(1, 0x004488, 0.9);
            gfx.strokeRoundedRect(bx - bw / 2, by - bh / 2, bw, bh, 6);
            this.systemButtonGraphics[action.id] = gfx;

            const txt = this.scene.add.text(bx, by, action.label, {
                fontFamily: gameConfig.defaultFont,
                fontSize:   "15px",
                color:      action.color,
                align:      "center",
                stroke:     "#000033",
                strokeThickness: 1,
            }).setOrigin(0.5).setDepth(3);
            this.systemButtonTexts[action.id] = txt;

            const zone = this.scene.add.zone(bx, by, bw, bh)
                .setInteractive({ useHandCursor: true }).setDepth(4);
            zone.on("pointerdown", () => {
                const cb = this.callbacks[action.callbackKey];
                if (cb) cb();
                this.scene.tweens.add({
                    targets: [gfx, txt], scaleX: 0.95, scaleY: 0.95,
                    duration: 50, ease: "Power2", yoyo: true,
                });
            });
            zone.on("pointerover", () => {
                this.scene.tweens.add({ targets: [gfx, txt], scaleX: 1.05, scaleY: 1.05, duration: 80, ease: "Power2" });
            });
            zone.on("pointerout", () => {
                this.scene.tweens.add({ targets: [gfx, txt], scaleX: 1, scaleY: 1, duration: 80, ease: "Power2" });
            });
            this.systemButtonZones[action.id] = zone;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Fullscreen click zone — depth 0, always behind everything
    // ─────────────────────────────────────────────────────────────────────────

    _drawClickZone() {
        const { width, height } = gameConfig.screenResolution;
        this.scene.add.zone(0, 0, width, height)
            .setOrigin(0)
            .setInteractive({ useHandCursor: false })
            .setDepth(0)
            .on("pointerdown", () => {
                // Block increment clicks when the modal is open
                if (!this._modalOpen && this.callbacks.onIncrement) {
                    this.callbacks.onIncrement();
                }
            });
    }
}
