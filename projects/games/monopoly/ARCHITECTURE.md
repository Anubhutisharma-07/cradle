# Project Architecture

## Overview

Property Baron is a single-page, hotseat (pass-and-play) Monopoly game for 2–4 players. It uses the real Monopoly board — same 40 spaces, same names, same prices, same layout as the official US board — but with a simplified ruleset: no houses/hotels, no mortgaging, no trading, and short Chance/Community Chest decks (8 cards each instead of 16).

Everything lives in one HTML file. There's no build step, no server, and no external JS libraries — just open the file in a browser.

---

## Folder Structure

```
monopoly/
└── index.html 
└── style.css 
└── script.js 
  # Everything: markup, styling, and game logic in one file
```


---

## Application Flow

```
User opens index.html
        ↓
Setup screen is shown
        ↓
User picks number of players (2–4) and enters names
        ↓
User clicks "Start Game"
  ├─ Creates a players[] array (cash, position, token color, etc.)
  ├─ initBoard() → builds all 40 board cells and places them on the grid
  └─ renderAll() → draws tokens, ownership markers, and the players list
        ↓
Current player clicks "Roll Dice"
  ├─ Two dice are rolled, player token moves that many spaces
  ├─ If they pass GO, they collect $200
  └─ resolveSpace() figures out what happens on the landed space
        ↓
resolveSpace() branches by space type:
  ├─ Unowned property/railroad/utility → show "Buy" button
  ├─ Owned by someone else → charge rent automatically
  ├─ Owned by the player themself → nothing happens
  ├─ Tax space → charge the tax amount
  ├─ Chance / Community Chest → draw a random card, show it in a popup, apply its effect
  ├─ Go To Jail → send player to jail
  └─ Free Parking / just visiting Jail / GO → nothing happens
        ↓
Player clicks "End Turn" (or rolls again if they rolled doubles)
        ↓
Turn passes to the next non-bankrupt player
        ↓
If a player's cash goes below $0 → they go bankrupt, their properties return to the bank
        ↓
When only one player is left → that player wins, buttons are disabled
```

---

## Core Components

### The board (`BOARD` array + `initBoard()`)
`BOARD` is a plain JavaScript array of 40 objects, one per space, in board order — the same order and names as the real Monopoly board (Mediterranean Avenue → Boardwalk). Each object holds its type (`property`, `railroad`, `utility`, `tax`, `chance`, `chest`, `jail`, `gotojail`, `parking`, `go`), name, price, and rent where relevant.

`initBoard()` reads this array once at game start and creates one `<div class="cell">` per space, positioning each on the correct edge of a CSS grid using `cellGridArea()` (a small function that maps a space index 0–39 to a grid column/row).

### Players (`players` array)
Each player is an object: `{ id, name, cash, pos, color, letter, inJail, jailTurns, bankrupt }`. This is the single source of truth for player state — the UI is always redrawn from this array, never edited directly.

### Ownership (`owners` object)
A simple map of `space index → player id`, e.g. `{1: 0, 5: 2}` means space 1 is owned by player 0 and space 5 is owned by player 2. Used to look up who to pay rent to, and to draw the colored ownership dots on the board.

### Turn logic (`doRoll`, `resolveSpace`, `endTurn`)
- `doRoll()` — rolls two dice, handles jail rules, moves the player, and calls `resolveSpace()`.
- `resolveSpace()` — the main branching function; decides what happens based on the space type.
- `endTurn()` — either lets the same player roll again (doubles) or advances to the next player.

### Cards (`CHANCE_CARDS`, `CHEST_CARDS`)
Two small arrays of card objects, each with a `text` (shown in the popup) and an `fn` (a function that applies the effect to the player — pay them, charge them, move them, or send them to jail).

### Rendering functions
- `renderTokens()` — draws player tokens on their current board space.
- `renderOwnership()` — draws colored dots on owned spaces.
- `renderPlayers()` — redraws the players list (name, cash, jail badge, active-turn highlight).
- `renderAll()` — calls all three.

These are called after any state change, so the UI always matches the underlying `players` / `owners` data.

---


## Event Flow

```
User clicks "Roll Dice"
        ↓
doRoll()
  ├─ roll two dice, update dice display
  ├─ if in jail → try to get out (doubles or 3rd-turn bail)
  ├─ move player, collect $200 if passing GO
  └─ resolveSpace(player, diceSum, wasDouble)
        ↓
resolveSpace() looks at BOARD[player.pos].type and either:
  ├─ shows the Buy button, or
  ├─ charges rent / tax immediately, or
  ├─ opens the Chance/Chest modal, or
  └─ moves the player to jail
        ↓
User clicks "Buy Property" (if shown) → buyCurrentProperty()
  adds the space to owners{}, deducts price from cash
        ↓
User clicks "End Turn" → endTurn()
  ├─ if doubles were rolled → same player rolls again
  └─ else → currentPlayerIdx moves to the next non-bankrupt player
```

---

## Assets

No images, fonts, or audio files. Dice pips are drawn with plain CSS (a 3×3 grid of dots toggled on/off per die value). Player tokens are colored circles with a letter, drawn with CSS.

---

## Dependencies

None. No JavaScript libraries, no CSS frameworks, no build tools. Just HTML, CSS, and vanilla JavaScript in one file.

---

## Known Simplifications (vs. real Monopoly rules)

- No houses or hotels — rent is always the base rate.
- No mortgaging properties.
- No trading between players.
- Chance and Community Chest decks have 8 cards each instead of the official 16.
- No bank auction when a player declines to buy a property.

---

## Future Improvements

- **Houses & hotels** — let players build once they own a full color group, with rent scaling per the real rent tables.
- **Mortgaging** — let a cash-short player mortgage properties to the bank instead of going bankrupt immediately.
- **Trading** — let players propose and accept property/cash trades with each other.
- **Full 16-card decks** — fill out the remaining Chance and Community Chest cards from the official rules.
- **Auctions** — when a player declines to buy, auction the property to all players instead of leaving it unowned.