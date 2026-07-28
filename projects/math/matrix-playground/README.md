# Matrix Playground 🧮

An interactive linear algebra visualization tool and computation suite built for exploring matrix operations, transformations, decomposition algorithms, and spectral properties.

## Features

- **Matrix Arithmetic**: Addition, Subtraction, Multiplication, Scalar Scaling, Transposition.
- **Decomposition Engine**:
  - **LU Decomposition**: Computes Lower ($L$) and Upper ($U$) triangular matrices ($A = L \cdot U$).
  - **QR Decomposition**: Computes Orthogonal ($Q$) and Upper Triangular ($R$) matrices ($A = Q \cdot R$) via Gram-Schmidt.
- **Spectral Properties**: Eigenvalue computation for $2 \times 2$ and $3 \times 3$ matrices via characteristic polynomials.
- **Structural Analysis**: Determinant, Matrix Inverse (Gauss-Jordan), Matrix Rank (Row Echelon), Trace.
- **Preset Catalog**: Identity, $2\text{D}$ Rotations, Shear, Hilbert, and Magic Square presets.
- **Multi-Format Export**: Export matrices directly to LaTeX (`\begin{bmatrix}`), CSV, and JSON formats.

## How to Run

1. Open `index.html` in any web browser.
2. Select matrix dimensions and enter values or pick a preset from the Preset dropdown.
3. Switch between **Operations**, **Decomposition**, and **Spectral Analysis** tabs.
4. Click **Export LaTeX** to grab formatted TeX markup for reports and papers.

## Architecture

- `matrixEngine.js` — Core mathematical functions (LU, QR, Eigenvalues, Gauss-Jordan Inverse).
- `matrixStorage.js` — Preset management, LocalStorage caching, and LaTeX/CSV export formatting.
- `script.js` — Interactive DOM controller and dynamic canvas visualization.
- `style.css` — Visual theme tokens, responsive cards, and step-by-step layout.
