# Project Architecture

---

## Overview

AI Circuit Builder is an AI based project to help user build circuit as per their needs. It provides various customizable parameters which can be used to create a circuit.

---

## Purpose & Goals

- Allow user to create custom circuit builder as per their need
- Provide area to compare previous designs
- Automatic creation of circuit from user need

---

## Folder Structure

```text
ai-circuit-builder/
├── index.html          # Entry point and UI shell
├── script.js           # Core logic and event handling
├── style.css           # All visual styling
└── Architecture.md     # Description of whole project
```

---

## System / Project Architecture Overview

User decides on the various design parameters available via the UI. The circuit builder builds circuit as per the requirements and displays it on the webpage

---

## Component Breakdown

| File | Responsibility |
|---|---|
| `index.html` | UI of the project and loads scripts |
| `script.js` | Handles logic of the project and loading of the model |
| `style.css` | Layout, colours, animations, responsive design |

---

## Data Flow / Execution Flow

```

User opens index.html

        ↓

User decides on the parameters of their circuit

        ↓

PPA computed and circuit displayed

        ↓

User can compare it with their previous designs

```

---

## Key Features

- Customizable design parameters
- Comparision of previously designed circuits
- Provides storage for chip storage

---

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup |
| CSS3 | Layout and responsive design |
| JavaScript | Circuit metrics calculation and canvasing  |

---

## File Responsibilities

### `index.html`

- User interface for image classification
- Displays prediction

### `script.js`

- Handles PPA calculation
- Design generation
- Storing of Circuit
- Structural comparision of circuit

### `style.css`

- Adding style to the webpage

---

<!-- ## Design Decisions -->

<!--
Explain non-obvious choices made during development.
This is especially useful for reviewers and future contributors.

Example:
- **Immutable state** — `moveGameState` always returns a new object rather than
  mutating state in place, making the logic easy to test and the history easy to track.
- **UMD wrapper in logic.js** — allows the same file to be loaded in a browser
  via a script tag and imported in Node.js for unit testing.
- **No framework** — kept vanilla to minimize the learning curve for contributors
  and avoid a build step.
-->

<!-- -  Decision 1 and the reason for it -->
<!-- -  Decision 2 and the reason for it -->

<!-- --- -->

## Dependencies

| Dependency | Version | How loaded | Purpose |
|---|---|---|---|
| Outfit (font) | - | Google Fonts CDN | UI typography |

---

## Future Improvements

- User friendly guide on how to use this project and its various parameters

<!-- ---

## Known Limitations -->

<!--
Be honest about current shortcomings.
This helps contributors understand the scope of the project
and prevents duplicate bug reports.

Example:
- No mobile/touch support — keyboard only
- Pawn auto-promotes to queen only; no promotion choice dialog
- AI does not detect threefold repetition or the fifty-move rule
-->

<!-- - Limitation 1 -->
<!-- -  Limitation 2 -->

---

## Development Notes

- Open index.html through a local server (e.g. `python3 -m http.server 8000`), not by double-clicking the file. The file:// protocol blocks Web Workers and some fetch calls.
- Visit (`http://localhost:8000`)

---
