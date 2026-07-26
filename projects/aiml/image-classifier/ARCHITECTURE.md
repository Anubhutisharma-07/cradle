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

```text
image-classifier/
├── index.html          # Entry point and UI shell
├── script.js           # Core logic and event handling
├── style.css           # All visual styling
└── Architecture.md     # Description of whole project
```

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

```mermaid
flowchart TD
A[User opens index.html] --> B{User decides on the mode of model}
B -- basic model --> C[User uploads image they want to classify  ]
B -- custom model --> D[User adds custom classes to train model]
C --> E[Model predicts image]
D --> E
```

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

- User interface for image classification
- Displays prediction

### `script.js`

- Load image classification model
- Logic to upload image
- Create custom image classes
- Logic for prediction of image class

### `style.css`

- Adding style to the webpage

---

<!-- ## Design Decisions 

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

<!-- ---   -->

## Dependencies

No external dependencies used

---

## Future Improvements

- Visualisation of the working of the model while training
- Increased accuracy

---

## Known Limitations

- The model has difficulties in analysing accurately the species of animals (e.g. predicting a bulldog as a boxer)
- During custom modelling test image is not displayed on the webpage

---

## Development Notes

- Open index.html through a local server (e.g. `python3 -m http.server 8000`), not by double-clicking the file. The file:// protocol blocks Web Workers and some fetch calls.
- Visit (`http://localhost:8000`)

---