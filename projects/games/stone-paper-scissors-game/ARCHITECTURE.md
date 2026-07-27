# Project Architecture

## Overview

RPS Arena is a Rock Paper Scissors game with a cyberpunk visual theme. The player competes against a computer opponent that picks its choice at random. Three game modes are available: Single Round, Best of 3, and Best of 5. A countdown animation ("Rock... Paper... Scissors... Shoot!") plays before each result is revealed. The game tracks per-session scores, a running win streak, and per-mode tally dots. Winning triggers a confetti animation.

---

## Folder Structure

```
stone-paper-scissors-game/
├── index.html   # Full page: navbar, game box, how-to section, footer, modal
├── game-engine.js # Rules matrix for classic and Lizard-Spock modes
├── script.js    # All game logic, animations, and event handling
└── style.css   # Cyberpunk visual theme, animations, responsive layout
```

---

## Application Flow

```
User opens index.html
        ↓
Page renders with default mode: Single Round
        ↓
User selects a game mode (Single Round / Best of 3 / Best of 5)
        ↓
resetTournament() clears scores and tally dots
        ↓
User clicks a choice button (Rock, Paper, or Scissors)
        ↓
startCountdown(playerChoice) disables buttons and runs the countdown
        ↓
Four-step interval: "ROCK...", "PAPER...", "SCISSORS...", "SHOOT!"
Each step shakes both fighter displays
        ↓
Countdown finishes → computer picks a random choice
        ↓
playGame(playerChoice, computerChoice)
  ├─ Displays both choices with a pop animation
  ├─ Determines win / loss / tie
  ├─ Updates scores, streak, and tally dots
  └─ Applies win-glow or lose-glow to the battle arena
        ↓
Win: confetti launches; Lose: page shake animation plays
        ↓
In Best of 3 / Best of 5: check if targetWins reached
  └─ If yes → showVictoryModal(winner)
        ↓
Buttons re-enabled for the next round
```

---

## Core Components

### `index.html`
Structured as a full single-page layout with four visible sections:

- **Navbar** — logo and navigation links to the game, how-to section, and footer.
- **Main game area (`#game`)** — contains the `game-box` which holds all interactive elements:
  - Mode selector buttons (Single Round, Best of 3, Best of 5)
  - Score board with player score, streak counter, and CPU score; tally dots for tournament modes
  - Battle arena (`#battleArena`) showing the player's pick (`#playerPick`) and the computer's pick (`#computerPick`)
  - Result text and choice buttons
  - Reset Score button
- **How To Play section** — static cards explaining the three rules.
- **Footer** — attribution text.
- **Confetti container** — an empty `div` where confetti pieces are dynamically injected.
- **Victory modal** — shown at the end of a Best of 3 / Best of 5 tournament.

### `script.js`
All game logic lives in this file. No separate modules are used.

Key variables:

| Variable | Purpose |
|---|---|
| `playerScore` / `computerScore` | Cumulative scores for the current session |
| `streak` | Consecutive player wins (resets on any non-win) |
| `gameMode` | Active mode: `1`, `3`, or `5` |
| `targetWins` | Wins needed to claim the tournament (`Math.ceil(gameMode / 2)`) |
| `playerTournamentWins` / `computerTournamentWins` | Wins within the current tournament |

Key functions:

| Function | Purpose |
|---|---|
| `startCountdown(playerChoice)` | Disables buttons and runs the four-step animated countdown using `setInterval` |
| `playGame(player, computer)` | Determines the winner, updates all scores and visual states |
| `renderTally()` | Rebuilds the tally dot indicators for tournament modes |
| `resetTournament()` | Resets tournament wins and tally, then triggers a full score reset |
| `showVictoryModal(winner)` | Displays the result modal with appropriate messaging and colour |
| `launchConfetti()` | Creates 40 randomly-sized and -coloured `div.confetti-piece` elements that fall off-screen via CSS animation |
| `triggerShake()` | Forces a CSS reflow and re-adds the `.shake` class to both fighter displays |
| `toggleButtons(disabled)` | Enables or disables all three choice buttons |

### `style.css`
Implements the cyberpunk aesthetic:

- Dark navy background (`#0b0e1a`) with two blurred radial gradient orbs (cyan and pink) creating ambient light.
- `Orbitron` font (Google Fonts) for headings and scores; `Rajdhani` for body text.
- The `.game-box` has a semi-transparent background, a cyan border glow, and a box shadow.
- `.win-glow` and `.lose-glow` add coloured box shadows to the battle arena on each outcome.
- `.shake` is a 0.4 s translateX keyframe animation applied to fighters during the countdown and to `document.body` on a loss.
- `.pop` is a scale animation applied to fighter emoji displays when the result is revealed.
- `.confetti-piece` falls from `top: -10px` to `translateY(110vh)` with rotation, driven by a CSS `@keyframes fall` animation.
- The victory modal uses `backdrop-filter: blur` and `opacity`/`visibility` transitions for a fade-in effect.

---

## State Management

State is held in six module-level variables. There is no state object or persistence — everything resets on page reload.

| Variable | Type | Resets on |
|---|---|---|
| `playerScore` / `computerScore` | `number` | Reset button click |
| `streak` | `number` | Any non-win result |
| `gameMode` | `number` | Mode button click |
| `targetWins` | `number` | Mode button click |
| `playerTournamentWins` / `computerTournamentWins` | `number` | Mode change or Play Again |

---

## Event Flow

```
User clicks a choice button
        ↓
startCountdown(playerChoice)
  ├─ toggleButtons(true) → disable all choices
  ├─ Set fighter displays to thinking emoji
  └─ setInterval every 400 ms:
        steps: "ROCK...", "PAPER...", "SCISSORS...", "SHOOT!"
        triggerShake() on each step
        On final step: clearInterval → pick computer choice → playGame()
        ↓
playGame(player, computer)
  ├─ Show emoji choices with .pop animation
  ├─ Evaluate outcome (win / loss / tie)
  ├─ Update scores, streak, tournament wins
  ├─ Add .win-glow or .lose-glow to battle arena
  ├─ renderTally()
  ├─ Win: launchConfetti()
  ├─ Lose: document.body.classList.add('shake') for 400 ms
  └─ Check tournament completion:
        └─ If done → showVictoryModal()
        └─ If not → toggleButtons(false)

User clicks "Play Again" in victory modal
        ↓
victoryModal.classList.add('hidden')
        ↓
resetTournament() → resets tournament wins and tally
        ↓
resetBtn.click() → resets all scores and display
        ↓
toggleButtons(false) → game ready for next round
```

---

## Assets

| Asset | Source | Purpose |
|---|---|---|
| Orbitron font | Google Fonts (CDN) | Headings, scores, result text |
| Rajdhani font | Google Fonts (CDN) | Body text, buttons, labels |

No image or audio files are used. Choices are represented by Unicode emoji (`🪨`, `📄`, `✂️`). The confetti animation is entirely CSS-driven.

---

## Dependencies

| Library | Source | Purpose |
|---|---|---|
| Orbitron (font) | Google Fonts CDN | Display font |
| Rajdhani (font) | Google Fonts CDN | UI font |

No JavaScript libraries are used.

---

## Future Improvements

- **Computer strategy** — replace the random computer choice with a simple frequency analysis of the player's past picks to make the opponent more challenging.
- **Sound effects** — play audio cues for win, loss, and tie outcomes.
- **Persistent stats** — save total wins, losses, and longest streak to `localStorage` for a cross-session leaderboard.
- **Keyboard shortcuts** — allow `R`, `P`, `S`, `L`, `K` keys to make choices without using the mouse.
