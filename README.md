# ClickerBase

A browser-based incremental/clicker game built with [Phaser 3](https://phaser.io/) and Matter.js physics. Spawn coins, upgrade your multiplier, and watch particles spiral into black holes.

## Overview

ClickerBase is an idle clicker game where you earn currency by clicking the screen. Currency can be spent on upgrades that increase your earning rate, add automation, and unlock physics-based black holes that attract and consume your coin particles.

## Features

- **Click to earn** — click anywhere on screen to spawn animated coin particles and increment your counter
- **Upgrades** — buy multipliers, auto-clickers, gravity boosts, and additional black holes
- **Physics particles** — coins are real Matter.js physics bodies with bounce and inertia
- **Black hole gravity** — black holes exert gravitational pull on all active particles; upgrade gravity to increase their pull
- **Large number support** — uses a custom `BigInt`-backed `LargeNumber` class to handle arbitrarily large values
- **Save system** — auto-saves every 30 seconds; manual save, export to clipboard, and delete save supported
- **Animated text intro** — a `TextScene` overlays cinematic zooming text lines at startup


## Upgrade Shop

| Button | Effect | Starting Price |
|---|---|---|
| Add PPC | Doubles increment per click | 100 |
| Auto Click | Speeds up auto-clicker by 1% | 100 |
| Buy Gravity | +100 gravity to all black holes | 100 |
| Buy Obj | Spawns a new black hole | 1,000,000 |

Prices double with each purchase.

## Save System

- **Auto-save** runs every 30 seconds
- **Ctrl+S** / **Cmd+S** — manual save
- **Ctrl+E** / **Cmd+E** — export save to clipboard
- **SAVE / EXPORT / DELETE SAVE** buttons are visible in the top-right corner

Saves are stored in `localStorage` under the key `clickerbase_save`.

## Tech Stack

- **Phaser 3** — game framework (scenes, input, tweens, cameras)
- **Matter.js** — 2D physics engine (via Phaser's built-in Matter integration)
- **Vanilla JS (ES Modules)** — no build step required
- **BigInt** — native browser large integer support for the economy system
