# Neural Network Playground Architecture Documentation

## Overview

The Neural Network Playground is an interactive visual Deep Learning simulation environment built with Vanilla HTML5 Canvas and ES6 Modular JavaScript. It visualizes forward inference, decision boundary contours, network weight topology, and training loss optimization curves in real time.

---

## Purpose & Goals

- Beginner friendly introduction to Neural Network
- Visualization of how a nueral network is trained

---

## Folder Structure

```text
projects/aiml/neural-network-playground/
├── ARCHITECTURE.md    # Architecture documentation
├── index.html         # Workspace UI layout
├── nnEngine.js        # Mathematical primitives & network model
├── script.js          # Canvas rendering & interaction loop
└── style.css          # Styling & responsive design tokens
```

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    User Control Dashboard                   │
│   Dataset / Learning Rate / Activation / Layer Configurator │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Neural Network Engine (nnEngine.js)             │
│   • Forward Pass & He Initialization                        │
│   • Binary Cross-Entropy Loss                               │
│   • Stochastic Gradient Descent Backpropagation             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Canvas Rendering Engines                  │
│   • Decision Boundary Contour Canvas (2D grid interpolation)│
│   • Network Graph Canvas (Weighted connections & Nodes)     │
│   • Loss History Canvas (Chart trend line)                  │
└─────────────────────────────────────────────────────────────┘
```

## Layer Topology Configuration

- **Input Layer**: 2 features $(x_1, x_2)$ representing normalized coordinate points in range $[-1, 1]$.
- **Hidden Layers**: Dynamic array of hidden layers, customizable from 1 to 4 layers, each with 1 to 12 hidden units.
- **Output Layer**: 1 output unit representing binary classification probability $p \in [0, 1]$.

## Mathematical Formulations

1. **Activation Functions**:
   - `ReLU`: $f(x) = \max(0, x)$
   - `Sigmoid`: $f(x) = \frac{1}{1 + e^{-x}}$
   - `Tanh`: $f(x) = \tanh(x)$
   - `LeakyReLU`: $f(x) = \max(0.01x, x)$
2. **Loss Function**:
   Binary Cross-Entropy Loss:
   $$\mathcal{L} = -\frac{1}{N} \sum_{i=1}^N \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right]$$

---

## Data Flow / Execution Flow

```

User opens Neural Network Playground

        ↓

User decides on the type of dataset to be used

        ↓

Number of hidden layers customised by the user

        ↓

Hyperparameters defined

         ↓

Model starts training


```

---

## Key Features

- Customizable dataset type with built-in generators (circle, XOR, spiral, gaussian, moons)
- Custom CSV dataset import with validation
- Visualization of decision boundary and neural network
- Live metrics of loss and accuracy
- Export trained model to JavaScript or Python

---

## Technologies Used

<!--
List every language, library, API, or tool used.
Note the version if it matters.

Example:
| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup |
| CSS3 (Grid, Flexbox, Custom Properties) | Layout and responsive design |
| Vanilla JavaScript (ES6+) | Game logic and DOM manipulation |
| localStorage API | Persisting best score across sessions |
| Chart.js 4.x (CDN) | Rendering the attendance pie chart |
-->

| Technology                | Purpose                            |
| ------------------------- | ---------------------------------- |
| HTML5                     | Page structure and semantic markup |
| CSS3                      | Layout and responsive design       |
| Vanilla JavaScript (ES6+) | Neural Network logic               |
| Canvass                   | 2D graphics                        |

---

## File Responsibilities

### `index.html`

- UI of the playground
- Provides interface to visualize neural network

### `script.js`

- Controls the logic of nueral network
- Used to draw canvass

### `style.css`

- Adding style to the webpage

### `nnEngine.js`

- Core logic of neural network
- Mathematical calculations

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

<!-- - Decision 1 and the reason for it -->
<!-- - Decision 2 and the reason for it -->

<!-- --- -->

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

| Dependency    | Version | How loaded       | Purpose       |
| ------------- | ------- | ---------------- | ------------- |
| Outfit (font) | NA      | Google Fonts CDN | UI typography |

---

## Future Improvements

- Explanation of the process for beginners
- User friendly guide to all parameters

---

## Known Limitations

- Accuracy always depicted as 100%
- Cannot alter number of epochs

---

## Development Notes

- Open index.html through a local server (e.g. `python3 -m http.server 8000`), not by double-clicking the file. The file:// protocol blocks Web Workers and some fetch calls.
- Visit (`http://localhost:8000`)

---
