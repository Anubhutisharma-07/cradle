# Project Architecture

## Overview

A modular digital implementation of Ludo, the classic board game for up to four players. The board is drawn on an HTML5 Canvas element and redrawn every frame using `requestAnimationFrame`. Tokens animate smoothly between squares, and a 3D CSS dice cube spins to show each roll result.

The core game logic and AI move heuristics are separated into dedicated ES modules (`ludoEngine.js` and `ludoBot.js`), enabling unit testability with Node.js test runner while maintaining full browser compatibility.

Each player can be set to Human or Bot. Bots roll and move automatically using a heuristic evaluator. Game state is automatically saved to `localStorage` so sessions can be resumed after closing the browser.

---

## Folder Structure

```
ludo-game/
├── index.html       # Page shell, canvas, side panels, modals
├── ludoEngine.js    # Core game rules, track coordinates, token factory, validation
├── ludoBot.js       # Heuristic move evaluator and AI decision engine
├── script.js        # Controller, Canvas rendering engine, event listeners, save/load
└── style.css        # Layout, 3D dice, modal styling, responsive design
```

---

## Application Flow

```
User opens index.html
        ↓
ludoEngine.js & ludoBot.js load → script.js loads
        ↓
Check localStorage for a saved game
  ├─ Found   → show "Resume" modal
  └─ Not found → show "Game Setup" modal
        ↓
User configures player types (Human / Bot) and clicks Start
        ↓
newGame() initialises token positions using LudoEngine.createTokens()
        ↓
requestAnimationFrame starts the render loop (drawBoard + drawTokens)
        ↓
Red's turn begins; if Red is a Bot, rollDice() is called automatically
        ↓
rollDice() → animates the CSS 3D dice → after 1 s sets diceValue
        ↓
checkAutoTurn():
  ├─ No valid moves → nextTurn() after 1 s
  └─ Human's turn  → player clicks a token on the canvas
  └─ Bot's turn    → executeAITurn() calls LudoBot.selectBestMove()
        ↓
executeMove(token) updates token, handles captures via LudoEngine, checks victory
        ↓
animateTokenTo(token) triggers smooth interpolated movement
        ↓
If diceValue was 6 (or token finished) → same player rolls again
Otherwise → nextTurn()
        ↓
saveGame() writes state to localStorage after every move
        ↓
First player to get all 4 tokens to the centre wins
```

---

## Core Modules

### `ludoEngine.js`

Houses deterministic game rules and board geometry:

- `GLOBAL_TRACK`: 52 `[row, col]` coordinates defining the main loop.
- `VICTORY_PATHS`: Final 5-step lanes into the center triangle.
- `SAFE_ZONES`: 8 safe star coordinates.
- `createTokens(color)`: Token state factory.
- `isValidMove(token, color, diceValue)`: Rule validation.
- `getNextPositionState(token, diceValue)`: Next position and victory path transitions.
- `checkCaptures(movedToken, state)`: Evaluates token collisions and sends captured tokens to home.
- `checkWinner(state, color)`: Checks if all tokens reached final index 5.

### `ludoBot.js`

Heuristic AI decision module:

- `evaluateMove(token, diceValue, gameState)`: Scores candidate moves based on capture priority (+120), finishing (+150), victory path entry (+60), spawning (+50), safe stars (+40), and advancement distance.
- `selectBestMove(validTokens, diceValue, gameState, rng)`: Selects optimal move token.

### `script.js`

Canvas rendering controller & UI listener bindings.

---

## Unit Testing

Automated unit test suite is located in `tests/ludo-game.test.js` and can be run using Node test runner:

```bash
node --test tests/ludo-game.test.js
```
