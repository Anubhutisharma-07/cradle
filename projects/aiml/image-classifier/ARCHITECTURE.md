# Project Architecture

## Overview

Image classifier is a web based classification tool which helps user to classify their images. User can make use of the trained model or create their own via custom mode.

---

## Purpose & Goals

- Allows users to classify their images into varied classes
- Makes use of MobileNet and KNN to provide accurate predictions
- Allow users to create their own image classification model via their images

- Goal 1 : User friendly image classification model
- Goal 2 : Custom image classification model
- Goal 3 : Help users understand how image classification models work

---

## Folder Structure

image-classifier/
├── index.html          # Entry point and UI shell
├── script.js           # Core logic and event handling
├── style.css           # All visual styling
└── Architecture.md     # Description of whole project

---

## System / Project Architecture Overview

The project follows a simple separation of concerns: 
index.html defines the structure, style.css handles all presentation, and script.js owns all behaviour.
There is no build step — the browser loads files directly. The project can be run seperately by running the index.html file of this project


---

## Component Breakdown

| File | Responsibility |
|---|---|
| `index.html` | UI of the project and loads scripts |
| `script.js` | Handles logic of the project and loading of the model |
| `style.css` | Layout, colours, animations, responsive design |

---

## Data Flow / Execution Flow

User opens index.html
        ↓
User decides on the mode of model

        ↓                                       ---------------------------                             ↓

User decided on basic model                                                                User decided on custom model

        ↓                                                                                               ↓

User uploads image they want to classify                                                    User adds custom classes 

        ↓                                                                                               ↓

Model predicts the image class and outputs the prediction                                  Model trained on custom classes and can now predict images


---

## Key Features

- User friendly image classification model
- Customised model creation
- Accurate predictions

---

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup |
| CSS3 | Layout and responsive design |
| JavaScript | Model logic and prediction |
| MobileNet | Image classification model |
| KNN | Algorithm to identify classes |

---

## File Responsibilities

### `index.html`

- <!-- key element or section 1 -->
- <!-- key element or section 2 -->

### `script.js`

- <!-- function/variable 1 -->
- <!-- function/variable 2 -->

### `style.css`

- <!-- key rule or pattern 1 -->
- <!-- key rule or pattern 2 -->

---

## Design Decisions

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

- <!-- Decision 1 and the reason for it -->
- <!-- Decision 2 and the reason for it -->

---

## Dependencies

<!--
List external dependencies. For projects with none, say so explicitly.

Example with dependencies:
| Dependency | Version | How loaded | Purpose |
|---|---|---|---|
| Chart.js | 4.x | CDN (`<script>` tag) | Pie chart rendering |
| jQuery | 3.4.1 | CDN (`<script>` tag) | DOM events and animation |
| Outfit (font) | — | Google Fonts CDN | UI typography |

Example with no dependencies:
None. This project uses only native browser APIs — no external libraries are required.
-->

| Dependency | Version | How loaded | Purpose |
|---|---|---|---|
| <!-- name --> | <!-- version --> | <!-- CDN / npm / local --> | <!-- purpose --> |

---

## Future Improvements

<!--
List ideas for improvement without committing to any of them.
Avoid touching the current implementation — this section is for inspiration only.

Example:
- Add touch/swipe support for mobile devices
- Persist the full board to localStorage so a game survives a page reload
- Add an undo stack — state is already immutable, so this would be straightforward
- Animate tiles sliding before they settle to improve game feel
-->

- <!-- Improvement 1 -->
- <!-- Improvement 2 -->
- <!-- Improvement 3 -->

---

## Known Limitations

<!--
Be honest about current shortcomings.
This helps contributors understand the scope of the project
and prevents duplicate bug reports.

Example:
- No mobile/touch support — keyboard only
- Pawn auto-promotes to queen only; no promotion choice dialog
- AI does not detect threefold repetition or the fifty-move rule
-->

- <!-- Limitation 1 -->
- <!-- Limitation 2 -->

---

## Development Notes

- Open index.html through a local server (e.g. `python3 -m http.server 8000`), not by double-clicking the file. The file:// protocol blocks Web Workers and some fetch calls.
- Visit (`http://localhost:8000`)

---