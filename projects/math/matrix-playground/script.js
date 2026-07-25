/* ==========================================================================
   Matrix Lab Core Application Engine
   ========================================================================== */

const state = {
  selectedOp: "add",
  rowsA: 3,
  colsA: 3,
  rowsB: 3,
  colsB: 3,
  matrixA: [],
  matrixB: [],
  resultMatrix: [],

  // Stepper timeline
  steps: [],
  currentStep: -1,
  isPlaying: false,
  playTimer: null,
  speed: 1000, // ms per step

  // Original user inputs (to restore on reset)
  originalA: [],
  originalB: []
};

// DOM References
const rowsASelect = document.getElementById("rows-a");
const colsASelect = document.getElementById("cols-a");
const rowsBSelect = document.getElementById("rows-b");
const colsBSelect = document.getElementById("cols-b");

const gridA = document.getElementById("grid-a");
const gridB = document.getElementById("grid-b");
const gridResult = document.getElementById("grid-result");

const cardB = document.getElementById("card-matrix-b");
const cardResult = document.getElementById("card-matrix-result");
const mathOperator = document.getElementById("math-operator");

const explanationText = document.getElementById("explanation-text");
const mathScratchpad = document.getElementById("math-scratchpad");

const btnPrev = document.getElementById("btn-prev");
const btnPlay = document.getElementById("btn-play");
const btnNext = document.getElementById("btn-next");
const btnResetPlay = document.getElementById("btn-reset-play");
const playIcon = document.getElementById("play-icon");
const speedSlider = document.getElementById("speed-slider");
const speedDisplay = document.getElementById("speed-display");
const stepCounter = document.getElementById("step-counter");
const stepProgressFill = document.getElementById("step-progress-fill");

const btnRandom = document.getElementById("btn-random");
const btnIdentity = document.getElementById("btn-identity");
const btnClear = document.getElementById("btn-clear");

// Theme Toggle DOM references
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

/* ===================== THEME TOGGLE ===================== */
function initTheme() {
  const currentTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.classList.add("light-theme");
    if (themeIcon) themeIcon.className = "fa-solid fa-sun";
  } else {
    document.documentElement.classList.remove("light-theme");
    if (themeIcon) themeIcon.className = "fa-solid fa-moon";
  }
  localStorage.setItem("theme", theme);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isLight = document.documentElement.classList.contains("light-theme");
    applyTheme(isLight ? "dark" : "light");
  });
}

/* ===================== NUMBER FORMATTER ===================== */
function formatNum(n) {
  if (Math.abs(n) < 1e-9) return "0";
  if (Number.isInteger(n)) return n.toString();
  return Number(n.toFixed(2)).toString();
}

/* ===================== INITIALIZE & PRESETS ===================== */
function init() {
  initTheme();
  setupEventListeners();
  updateControls();
  generateMatrices();
  fillRandom();
}

function setupEventListeners() {
  // Dimension listeners
  rowsASelect.addEventListener("change", (e) => {
    state.rowsA = parseInt(e.target.value);
    syncDimensions();
  });
  colsASelect.addEventListener("change", (e) => {
    state.colsA = parseInt(e.target.value);
    syncDimensions();
  });
  colsBSelect.addEventListener("change", (e) => {
    state.colsB = parseInt(e.target.value);
    syncDimensions();
  });

  // Operation selectors
  document.querySelectorAll(".op-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".op-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.selectedOp = btn.dataset.op;
      updateControls();
      syncDimensions();
    });
  });

  // Action Buttons
  btnRandom.addEventListener("click", fillRandom);
  btnIdentity.addEventListener("click", fillIdentity);
  btnClear.addEventListener("click", fillZero);

  // Stepper Toolbar
  btnPrev.addEventListener("click", stepPrev);
  btnNext.addEventListener("click", stepNext);
  btnPlay.addEventListener("click", togglePlay);
  btnResetPlay.addEventListener("click", resetPlayback);

  speedSlider.addEventListener("input", (e) => {
    state.speed = parseInt(e.target.value);
    speedDisplay.textContent = `${(state.speed / 1000).toFixed(1)}s / step`;
    if (state.isPlaying) {
      pause();
      play();
    }
  });
}

/* ===================== DIMENSIONS SYNC ===================== */
function updateControls() {
  // Change operation sign visually
  let signHtml = '<i class="fa-solid fa-plus"></i>';
  if (state.selectedOp === "multiply") signHtml = '<i class="fa-solid fa-times"></i>';
  else if (state.selectedOp === "determinant") signHtml = "<span>det</span>";
  else if (state.selectedOp === "inverse") signHtml = "<span>A<sup>-1</sup></span>";
  else if (state.selectedOp === "transpose") signHtml = "<span>A<sup>T</sup></span>";
  mathOperator.innerHTML = signHtml;

  // Show/Hide Grid B and Operator based on operation
  const isDual = state.selectedOp === "add" || state.selectedOp === "multiply";
  if (isDual) {
    cardB.classList.remove("card-matrix-b-hidden");
    mathOperator.style.display = "flex";
  } else {
    cardB.classList.add("card-matrix-b-hidden");
    mathOperator.style.display = "none";
  }

  // Adjust Result Card visibility (determinant yields a scalar, which we style nicely)
  if (state.selectedOp === "determinant") {
    cardResult.querySelector(".matrix-title").textContent = "Determinant Scalar";
  } else {
    cardResult.querySelector(".matrix-title").textContent = "Result Matrix C";
  }
}

function syncDimensions() {
  resetPlayback();

  const op = state.selectedOp;
  
  if (op === "add") {
    // Add: dims of A and B must match
    state.rowsB = state.rowsA;
    state.colsB = state.colsA;
    
    // Disable B dimension inputs
    rowsBSelect.value = state.rowsA;
    colsBSelect.value = state.colsA;
    rowsBSelect.disabled = true;
    colsBSelect.disabled = true;
    colsASelect.disabled = false;
  } else if (op === "multiply") {
    // Multiply: colsA must match rowsB
    state.rowsB = state.colsA;
    
    rowsBSelect.value = state.colsA;
    rowsBSelect.disabled = true;
    colsBSelect.disabled = false;
    colsASelect.disabled = false;
  } else if (op === "determinant" || op === "inverse") {
    // Square matrices only (max 3x3 for visual clarity)
    if (state.rowsA > 3) {
      state.rowsA = 3;
      rowsASelect.value = "3";
    }
    state.colsA = state.rowsA;
    colsASelect.value = state.rowsA;
    
    // Disable colsA Select to lock it square
    colsASelect.disabled = true;
  } else if (op === "transpose") {
    colsASelect.disabled = false;
  }

  generateMatrices();
}

/* ===================== MATRIX GENERATION & DRAWING ===================== */
function generateMatrices() {
  state.matrixA = Array(state.rowsA).fill(0).map(() => Array(state.colsA).fill(0));
  state.matrixB = Array(state.rowsB).fill(0).map(() => Array(state.colsB).fill(0));

  let resRows = state.rowsA;
  let resCols = state.colsA;
  if (state.selectedOp === "multiply") {
    resRows = state.rowsA;
    resCols = state.colsB;
  } else if (state.selectedOp === "transpose") {
    resRows = state.colsA;
    resCols = state.rowsA;
  } else if (state.selectedOp === "determinant") {
    resRows = 1;
    resCols = 1;
  }
  state.resultMatrix = Array(resRows).fill(0).map(() => Array(resCols).fill(0));

  drawGrid(gridA, state.rowsA, state.colsA, "A");
  if (state.selectedOp === "add" || state.selectedOp === "multiply") {
    drawGrid(gridB, state.rowsB, state.colsB, "B");
  }
  drawGrid(gridResult, resRows, resCols, "C", true);

  explanationText.textContent = "Adjust matrix elements above and click 'Play' or 'Next Step' to visualize.";
  mathScratchpad.textContent = "Waiting...";
}

function drawGrid(container, rows, cols, prefix, isReadOnly = false) {
  container.innerHTML = "";
  container.style.gridTemplateRows = `repeat(${rows}, var(--cell-size))`;
  container.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const input = document.createElement("input");
      input.type = "number";
      input.className = "matrix-cell";
      input.id = `cell-${prefix.toLowerCase()}-${r}-${c}`;
      input.value = "0";
      
      if (isReadOnly) {
        input.disabled = true;
      } else {
        input.addEventListener("input", (e) => {
          resetPlayback();
          const val = parseFloat(e.target.value) || 0;
          if (prefix === "A") state.matrixA[r][c] = val;
          else state.matrixB[r][c] = val;
        });
      }
      container.appendChild(input);
    }
  }
}

/* ===================== PRESET ACTIONS IMPLEMENTATION ===================== */
function fillRandom() {
  resetPlayback();
  for (let r = 0; r < state.rowsA; r++) {
    for (let c = 0; c < state.colsA; c++) {
      const val = Math.floor(Math.random() * 19) - 9; // Range -9 to 9
      state.matrixA[r][c] = val;
      document.getElementById(`cell-a-${r}-${c}`).value = val;
    }
  }
  
  if (state.selectedOp === "add" || state.selectedOp === "multiply") {
    for (let r = 0; r < state.rowsB; r++) {
      for (let c = 0; c < state.colsB; c++) {
        const val = Math.floor(Math.random() * 19) - 9;
        state.matrixB[r][c] = val;
        document.getElementById(`cell-b-${r}-${c}`).value = val;
      }
    }
  }
}

function fillIdentity() {
  resetPlayback();
  for (let r = 0; r < state.rowsA; r++) {
    for (let c = 0; c < state.colsA; c++) {
      const val = r === c ? 1 : 0;
      state.matrixA[r][c] = val;
      document.getElementById(`cell-a-${r}-${c}`).value = val;
    }
  }

  if ((state.selectedOp === "add" || state.selectedOp === "multiply") && state.rowsB === state.colsB) {
    for (let r = 0; r < state.rowsB; r++) {
      for (let c = 0; c < state.colsB; c++) {
        const val = r === c ? 1 : 0;
        state.matrixB[r][c] = val;
        document.getElementById(`cell-b-${r}-${c}`).value = val;
      }
    }
  }
}

function fillZero() {
  resetPlayback();
  for (let r = 0; r < state.rowsA; r++) {
    for (let c = 0; c < state.colsA; c++) {
      state.matrixA[r][c] = 0;
      document.getElementById(`cell-a-${r}-${c}`).value = 0;
    }
  }
  
  if (state.selectedOp === "add" || state.selectedOp === "multiply") {
    for (let r = 0; r < state.rowsB; r++) {
      for (let c = 0; c < state.colsB; c++) {
        state.matrixB[r][c] = 0;
        document.getElementById(`cell-b-${r}-${c}`).value = 0;
      }
    }
  }
}

/* ===================== STEP CAPTURING UTILITY ===================== */
function captureStep(explanation, scratchpad, highlights = {}) {
  const step = {
    explanation,
    scratchpad,
    matrixAState: state.matrixA.map(row => [...row]),
    matrixBState: state.matrixB.map(row => [...row]),
    matrixCState: state.resultMatrix.map(row => [...row]),
    highlightsA: Array(state.rowsA).fill().map(() => Array(state.colsA).fill("")),
    highlightsB: Array(state.rowsB).fill().map(() => Array(state.colsB).fill("")),
    highlightsC: Array(state.resultMatrix.length).fill().map(() => Array(state.resultMatrix[0]?.length || 0).fill(""))
  };

  // Process highlights for A
  if (highlights.A) {
    highlights.A.forEach(hl => {
      if (hl.type === "row") {
        for (let c = 0; c < state.colsA; c++) step.highlightsA[hl.r][c] = "cell-highlight-row";
      } else if (hl.type === "col") {
        for (let r = 0; r < state.rowsA; r++) step.highlightsA[r][hl.c] = "cell-highlight-col";
      } else if (hl.type === "active") {
        step.highlightsA[hl.r][hl.c] = "cell-highlight-active";
      } else if (hl.type === "inactive") {
        step.highlightsA[hl.r][hl.c] = "cell-highlight-inactive";
      }
    });
  }

  // Process highlights for B
  if (highlights.B) {
    highlights.B.forEach(hl => {
      if (hl.type === "row") {
        for (let c = 0; c < state.colsB; c++) step.highlightsB[hl.r][c] = "cell-highlight-row";
      } else if (hl.type === "col") {
        for (let r = 0; r < state.rowsB; r++) step.highlightsB[r][hl.c] = "cell-highlight-col";
      } else if (hl.type === "active") {
        step.highlightsB[hl.r][hl.c] = "cell-highlight-active";
      } else if (hl.type === "inactive") {
        step.highlightsB[hl.r][hl.c] = "cell-highlight-inactive";
      }
    });
  }

  // Process highlights for C
  if (highlights.C) {
    highlights.C.forEach(hl => {
      if (hl.type === "row") {
        for (let c = 0; c < step.matrixCState[0].length; c++) step.highlightsC[hl.r][c] = "cell-highlight-row";
      } else if (hl.type === "col") {
        for (let r = 0; r < step.matrixCState.length; r++) step.highlightsC[r][hl.c] = "cell-highlight-col";
      } else if (hl.type === "active") {
        step.highlightsC[hl.r][hl.c] = "cell-highlight-active";
      } else if (hl.type === "inactive") {
        step.highlightsC[hl.r][hl.c] = "cell-highlight-inactive";
      }
    });
  }

  // Global Dimming (dimming other elements to focus)
  if (highlights.dimOthersA) {
    for (let r = 0; r < state.rowsA; r++) {
      for (let c = 0; c < state.colsA; c++) {
        if (!step.highlightsA[r][c]) step.highlightsA[r][c] = "cell-highlight-inactive";
      }
    }
  }
  if (highlights.dimOthersB) {
    for (let r = 0; r < state.rowsB; r++) {
      for (let c = 0; c < state.colsB; c++) {
        if (!step.highlightsB[r][c]) step.highlightsB[r][c] = "cell-highlight-inactive";
      }
    }
  }
  if (highlights.dimOthersC) {
    for (let r = 0; r < step.matrixCState.length; r++) {
      for (let c = 0; c < step.matrixCState[0].length; c++) {
        if (!step.highlightsC[r][c]) step.highlightsC[r][c] = "cell-highlight-inactive";
      }
    }
  }

  state.steps.push(step);
}

/* ===================== STEP GENERATORS BY OPERATION ===================== */
function generateSteps() {
  state.steps = [];
  
  // Clear Result Matrix C to default zero state
  state.resultMatrix = state.resultMatrix.map(row => row.fill(0));

  const op = state.selectedOp;
  if (op === "add") {
    buildAdditionSteps();
  } else if (op === "transpose") {
    buildTransposeSteps();
  } else if (op === "multiply") {
    buildMultiplicationSteps();
  } else if (op === "determinant") {
    buildDeterminantSteps();
  } else if (op === "inverse") {
    buildInverseSteps();
  }
}

// 1. Matrix Addition
function buildAdditionSteps() {
  captureStep(
    "Ready to add matrices A and B. Corresponding elements will be added cell-by-cell.",
    "C<sub>ij</sub> = A<sub>ij</sub> + B<sub>ij</sub>"
  );

  for (let r = 0; r < state.rowsA; r++) {
    for (let c = 0; c < state.colsA; c++) {
      const valA = state.matrixA[r][c];
      const valB = state.matrixB[r][c];
      const sum = valA + valB;
      state.resultMatrix[r][c] = sum;

      captureStep(
        `Add element at Row ${r}, Col ${c}: A[${r}][${c}] (${formatNum(valA)}) + B[${r}][${c}] (${formatNum(valB)}) = ${formatNum(sum)}`,
        `<span class="scratch-term-a">${formatNum(valA)}</span> + <span class="scratch-term-b">${formatNum(valB)}</span> = <span class="scratch-term-c">${formatNum(sum)}</span>`,
        {
          A: [{ r, c, type: "active" }],
          B: [{ r, c, type: "active" }],
          C: [{ r, c, type: "active" }],
          dimOthersA: true,
          dimOthersB: true,
          dimOthersC: true
        }
      );
    }
  }

  captureStep(
    "Matrix addition complete! Result C represents the sum of Matrix A and Matrix B.",
    "C = A + B"
  );
}

// 2. Matrix Transpose
function buildTransposeSteps() {
  captureStep(
    "Ready to transpose Matrix A. Rows of Matrix A will become columns of the result Matrix C.",
    "C<sub>ji</sub> = A<sub>ij</sub>"
  );

  for (let r = 0; r < state.rowsA; r++) {
    for (let c = 0; c < state.colsA; c++) {
      const val = state.matrixA[r][c];
      state.resultMatrix[c][r] = val;

      captureStep(
        `Move element A[${r}][${c}] (${formatNum(val)}) to position C[${c}][${r}] in the transposed matrix.`,
        `A[${r}][${c}] (<span class="scratch-term-a">${formatNum(val)}</span>) &rarr; C[${c}][${r}] (<span class="scratch-term-c">${formatNum(val)}</span>)`,
        {
          A: [{ r, c, type: "active" }],
          C: [{ r: c, c: r, type: "active" }],
          dimOthersA: true,
          dimOthersC: true
        }
      );
    }
  }

  captureStep(
    "Transpose complete! Grid elements are reflected across the main diagonal.",
    "C = A<sup>T</sup>"
  );
}

// 3. Matrix Multiplication
function buildMultiplicationSteps() {
  captureStep(
    `Starting matrix multiplication. Multiply Row i of A with Col j of B to compute C[i][j].`,
    "C<sub>ij</sub> = &sum;<sub>k</sub> (A<sub>ik</sub> &times; B<sub>kj</sub>)"
  );

  for (let r = 0; r < state.rowsA; r++) {
    for (let c = 0; c < state.colsB; c++) {
      // Step: highlight Row r of A and Col c of B
      captureStep(
        `Compute cell C[${r}][${c}]: Dot product of Row ${r} of A and Column ${c} of B.`,
        `C[${r}][${c}] = Row ${r} &middot; Col ${c}`,
        {
          A: [{ r, type: "row" }],
          B: [{ c, type: "col" }],
          C: [{ r, c, type: "active" }],
          dimOthersC: true
        }
      );

      let sum = 0;
      let formulaParts = [];
      let valParts = [];

      for (let k = 0; k < state.colsA; k++) {
        const valA = state.matrixA[r][k];
        const valB = state.matrixB[k][c];
        const term = valA * valB;
        sum += term;

        formulaParts.push(`(A[${r}][${k}] &times; B[${k}][${c}])`);
        valParts.push(`(<span class="scratch-term-a">${formatNum(valA)}</span>&times;<span class="scratch-term-b">${formatNum(valB)}</span>)`);

        state.resultMatrix[r][c] = sum;

        // Step: highlight specific cells being multiplied
        captureStep(
          `Multiply A[${r}][${k}] (${formatNum(valA)}) and B[${k}][${c}] (${formatNum(valB)}). Term: ${formatNum(term)}. Added to running sum: ${formatNum(sum)}.`,
          `C[${r}][${c}] = ${valParts.join(" + ")} = <span class="scratch-term-c">${formatNum(sum)}</span>`,
          {
            A: [{ r, c: k, type: "active" }, { r, type: "row" }],
            B: [{ r: k, c, type: "active" }, { c, type: "col" }],
            C: [{ r, c, type: "active" }],
            dimOthersC: true
          }
        );
      }

      // Step: Cell calculation final display
      captureStep(
        `Completed computation for cell C[${r}][${c}] = ${formatNum(sum)}.`,
        `C[${r}][${c}] = <span class="scratch-term-c">${formatNum(sum)}</span>`,
        {
          A: [{ r, type: "row" }],
          B: [{ c, type: "col" }],
          C: [{ r, c, type: "active" }],
          dimOthersC: true
        }
      );
    }
  }

  captureStep(
    "Matrix multiplication complete! Result C is the matrix product A &times; B.",
    "C = A &times; B"
  );
}

// 4. Determinant (2x2 and 3x3 only)
function buildDeterminantSteps() {
  const n = state.rowsA;
  if (n === 2) {
    const a = state.matrixA[0][0];
    const b = state.matrixA[0][1];
    const c = state.matrixA[1][0];
    const d = state.matrixA[1][1];
    const det = a * d - b * c;
    state.resultMatrix[0][0] = det;

    captureStep(
      "Calculating determinant of a 2x2 matrix using formula: det(A) = ad - bc.",
      "det(A) = A<sub>00</sub>&middot;A<sub>11</sub> - A<sub>01</sub>&middot;A<sub>10</sub>"
    );

    // Step 1: main diagonal
    captureStep(
      `Multiply main diagonal elements: A[0][0] (${formatNum(a)}) &times; A[1][1] (${formatNum(d)}) = ${formatNum(a * d)}`,
      `ad = <span class="scratch-term-a">${formatNum(a)}</span> &times; <span class="scratch-term-a">${formatNum(d)}</span> = <span class="scratch-term-a">${formatNum(a * d)}</span>`,
      {
        A: [{ r: 0, c: 0, type: "active" }, { r: 1, c: 1, type: "active" }],
        dimOthersA: true
      }
    );

    // Step 2: anti diagonal
    captureStep(
      `Multiply anti-diagonal elements: A[0][1] (${formatNum(b)}) &times; A[1][0] (${formatNum(c)}) = ${formatNum(b * c)}`,
      `bc = <span class="scratch-term-b">${formatNum(b)}</span> &times; <span class="scratch-term-b">${formatNum(c)}</span> = <span class="scratch-term-b">${formatNum(b * c)}</span>`,
      {
        A: [{ r: 0, c: 1, type: "active" }, { r: 1, c: 0, type: "active" }],
        dimOthersA: true
      }
    );

    // Step 3: Result
    captureStep(
      `Subtract anti-diagonal product from main diagonal product: ${formatNum(a * d)} - ${formatNum(b * c)} = ${formatNum(det)}`,
      `det(A) = <span class="scratch-term-a">${formatNum(a * d)}</span> - <span class="scratch-term-b">${formatNum(b * c)}</span> = <span class="scratch-term-c">${formatNum(det)}</span>`
    );

  } else if (n === 3) {
    const a00 = state.matrixA[0][0];
    const a01 = state.matrixA[0][1];
    const a02 = state.matrixA[0][2];
    
    // Sub-determinants
    const m00_det = state.matrixA[1][1] * state.matrixA[2][2] - state.matrixA[1][2] * state.matrixA[2][1];
    const m01_det = state.matrixA[1][0] * state.matrixA[2][2] - state.matrixA[1][2] * state.matrixA[2][0];
    const m02_det = state.matrixA[1][0] * state.matrixA[2][1] - state.matrixA[1][1] * state.matrixA[2][0];

    const termA = a00 * m00_det;
    const termB = a01 * m01_det;
    const termC = a02 * m02_det;
    const det = termA - termB + termC;
    state.resultMatrix[0][0] = det;

    captureStep(
      "Calculating 3x3 determinant using Laplace Expansion along the first row.",
      "det(A) = a<sub>00</sub>&middot;det(M<sub>00</sub>) - a<sub>01</sub>&middot;det(M<sub>01</sub>) + a<sub>02</sub>&middot;det(M<sub>02</sub>)"
    );

    // Step 1: term 1
    captureStep(
      `First term: +A[0][0] &times; det(M00). M00 is 2x2 submatrix without Row 0 & Col 0. det(M00) = ${formatNum(m00_det)}. Term = +${formatNum(a00)} &times; ${formatNum(m00_det)} = ${formatNum(termA)}.`,
      `Term 1 = +<span class="scratch-term-a">${formatNum(a00)}</span> &times; det(M<sub>00</sub>) = <span class="scratch-term-a">${formatNum(termA)}</span>`,
      {
        A: [
          { r: 0, c: 0, type: "active" },
          { r: 0, c: 1, type: "inactive" }, { r: 0, c: 2, type: "inactive" },
          { r: 1, c: 0, type: "inactive" }, { r: 2, c: 0, type: "inactive" },
          { r: 1, c: 1, type: "active" }, { r: 1, c: 2, type: "active" },
          { r: 2, c: 1, type: "active" }, { r: 2, c: 2, type: "active" }
        ]
      }
    );

    // Step 2: term 2
    captureStep(
      `Second term: -A[0][1] &times; det(M01). M01 is submatrix without Row 0 & Col 1. det(M01) = ${formatNum(m01_det)}. Term = -${formatNum(a01)} &times; ${formatNum(m01_det)} = -${formatNum(termB)}.`,
      `Term 2 = -<span class="scratch-term-b">${formatNum(a01)}</span> &times; det(M<sub>01</sub>) = -<span class="scratch-term-b">${formatNum(termB)}</span>`,
      {
        A: [
          { r: 0, c: 1, type: "active" },
          { r: 0, c: 0, type: "inactive" }, { r: 0, c: 2, type: "inactive" },
          { r: 1, c: 1, type: "inactive" }, { r: 2, c: 1, type: "inactive" },
          { r: 1, c: 0, type: "active" }, { r: 1, c: 2, type: "active" },
          { r: 2, c: 0, type: "active" }, { r: 2, c: 2, type: "active" }
        ]
      }
    );

    // Step 3: term 3
    captureStep(
      `Third term: +A[0][2] &times; det(M02). M02 is submatrix without Row 0 & Col 2. det(M02) = ${formatNum(m02_det)}. Term = +${formatNum(a02)} &times; ${formatNum(m02_det)} = ${formatNum(termC)}.`,
      `Term 3 = +<span class="scratch-term-a">${formatNum(a02)}</span> &times; det(M<sub>02</sub>) = <span class="scratch-term-a">${formatNum(termC)}</span>`,
      {
        A: [
          { r: 0, c: 2, type: "active" },
          { r: 0, c: 0, type: "inactive" }, { r: 0, c: 1, type: "inactive" },
          { r: 1, c: 2, type: "inactive" }, { r: 2, c: 2, type: "inactive" },
          { r: 1, c: 0, type: "active" }, { r: 1, c: 1, type: "active" },
          { r: 2, c: 0, type: "active" }, { r: 2, c: 1, type: "active" }
        ]
      }
    );

    // Step 4: Final calculation
    captureStep(
      `Combine the expansion terms: det(A) = Term 1 - Term 2 + Term 3 = ${formatNum(termA)} - (${formatNum(termB)}) + (${formatNum(termC)}) = ${formatNum(det)}`,
      `det(A) = <span class="scratch-term-a">${formatNum(termA)}</span> - <span class="scratch-term-b">${formatNum(termB)}</span> + <span class="scratch-term-a">${formatNum(termC)}</span> = <span class="scratch-term-c">${formatNum(det)}</span>`
    );
  }
}

// Helper to check 2x2 and 3x3 determinant value
function getDeterminant(matrix) {
  const n = matrix.length;
  if (n === 2) {
    return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  }
  if (n === 3) {
    const a00 = matrix[0][0];
    const a01 = matrix[0][1];
    const a02 = matrix[0][2];
    const m00 = matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1];
    const m01 = matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0];
    const m02 = matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0];
    return a00 * m00 - a01 * m01 + a02 * m02;
  }
  return 0;
}

// 5. Matrix Inverse using Gauss-Jordan Elimination [A | I] -> [I | A^-1]
function buildInverseSteps() {
  const n = state.rowsA;
  const det = getDeterminant(state.matrixA);

  if (Math.abs(det) < 1e-9) {
    captureStep(
      "The determinant of Matrix A is zero. A singular matrix is not invertible.",
      "det(A) = 0 &rArr; A<sup>-1</sup> does not exist"
    );
    return;
  }

  // C starts as the Identity matrix
  state.resultMatrix = Array(n).fill(0).map((_, r) => Array(n).fill(0).map((_, c) => r === c ? 1 : 0));

  captureStep(
    "To find the inverse, we augment A with the Identity matrix [A | I]. Row operations will reduce [A | I] to [I | A^-1]. Matrix C starts as the Identity.",
    "Augmented system: [ A | I ]"
  );

  // Keep copies of values for the step calculations
  // Gauss Jordan loop
  for (let p = 0; p < n; p++) {
    // 1. Partial pivoting: find largest entry in pivot column
    let maxRow = p;
    for (let r = p + 1; r < n; r++) {
      if (Math.abs(state.matrixA[r][p]) > Math.abs(state.matrixA[maxRow][p])) {
        maxRow = r;
      }
    }

    // Swap rows if necessary
    if (maxRow !== p) {
      // Swap row p and maxRow in A and C
      const tempA = state.matrixA[p];
      state.matrixA[p] = state.matrixA[maxRow];
      state.matrixA[maxRow] = tempA;

      const tempC = state.resultMatrix[p];
      state.resultMatrix[p] = state.resultMatrix[maxRow];
      state.resultMatrix[maxRow] = tempC;

      captureStep(
        `Swap Row ${p} and Row ${maxRow} to place a larger element on the main diagonal pivot.`,
        `Row ${p} &harr; Row ${maxRow}`,
        {
          A: [{ r: p, type: "row" }, { r: maxRow, type: "row" }],
          C: [{ r: p, type: "row" }, { r: maxRow, type: "row" }]
        }
      );
    }

    // 2. Division: divide pivot row by pivot value to make diagonal entry equal 1
    const divisor = state.matrixA[p][p];
    if (Math.abs(divisor - 1) > 1e-9) {
      for (let c = 0; c < n; c++) {
        state.matrixA[p][c] /= divisor;
        state.resultMatrix[p][c] /= divisor;
      }

      captureStep(
        `Divide Row ${p} by the pivot element ${formatNum(divisor)} to set diagonal cell to 1.`,
        `Row ${p} &larr; Row ${p} / ${formatNum(divisor)}`,
        {
          A: [{ r: p, c: p, type: "active" }, { r: p, type: "row" }],
          C: [{ r: p, type: "row" }]
        }
      );
    }

    // 3. Elimination: clear pivot column entries in all other rows
    for (let r = 0; r < n; r++) {
      if (r !== p) {
        const factor = state.matrixA[r][p];
        if (Math.abs(factor) > 1e-9) {
          for (let c = 0; c < n; c++) {
            state.matrixA[r][c] -= factor * state.matrixA[p][c];
            state.resultMatrix[r][c] -= factor * state.resultMatrix[p][c];
          }

          captureStep(
            `Eliminate cell at Row ${r}, Col ${p} (${formatNum(factor)}) by subtracting ${formatNum(factor)} &times; Row ${p} from Row ${r}.`,
            `Row ${r} &larr; Row ${r} - (${formatNum(factor)})&middot;Row ${p}`,
            {
              A: [{ r, c: p, type: "active" }, { r: p, c: p, type: "active" }, { r, type: "row" }, { r: p, type: "row" }],
              C: [{ r: p, type: "row" }, { r, type: "row" }]
            }
          );
        }
      }
    }
  }

  // Final success step
  captureStep(
    "Row operations complete! Matrix A has been reduced to the Identity Matrix, and Matrix C contains the computed inverse matrix.",
    "Reduced Augmented system: [ I | A<sup>-1</sup> ]"
  );
}

/* ===================== PLAYBACK CONTROL PANEL ===================== */
function stepNext() {
  if (state.steps.length === 0) {
    generateSteps();
  }
  if (state.currentStep < state.steps.length - 1) {
    state.currentStep++;
    renderCurrentStep();
  } else {
    pause();
  }
}

function stepPrev() {
  if (state.currentStep > 0) {
    state.currentStep--;
    renderCurrentStep();
  }
}

function renderCurrentStep() {
  if (state.currentStep < 0 || state.currentStep >= state.steps.length) return;

  const step = state.steps[state.currentStep];

  // Disable cell inputs since we are modifying state live during animation
  if (state.currentStep > 0) {
    disableInputGrids();
  }

  // Update text descriptions
  explanationText.innerHTML = step.explanation;
  mathScratchpad.innerHTML = step.scratchpad;

  // Apply matrix value states
  updateGridValues(gridA, step.matrixAState);
  if (state.selectedOp === "add" || state.selectedOp === "multiply") {
    updateGridValues(gridB, step.matrixBState);
  }
  updateGridValues(gridResult, step.matrixCState);

  // Apply visual highlights
  applyGridHighlights(gridA, step.highlightsA);
  if (state.selectedOp === "add" || state.selectedOp === "multiply") {
    applyGridHighlights(gridB, step.highlightsB);
  }
  applyGridHighlights(gridResult, step.highlightsC);

  // Update stepper buttons enabled status
  btnPrev.disabled = state.currentStep <= 0;
  btnNext.disabled = state.currentStep >= state.steps.length - 1;

  // Update Progress Display
  stepCounter.textContent = `Step ${state.currentStep} / ${state.steps.length - 1}`;
  const progressPercent = (state.currentStep / (state.steps.length - 1)) * 100;
  stepProgressFill.style.width = `${progressPercent}%`;
}

function updateGridValues(gridElement, valuesMatrix) {
  const cells = gridElement.querySelectorAll(".matrix-cell");
  let cellIndex = 0;
  for (let r = 0; r < valuesMatrix.length; r++) {
    for (let c = 0; c < valuesMatrix[r].length; c++) {
      if (cells[cellIndex]) {
        cells[cellIndex].value = formatNum(valuesMatrix[r][c]);
      }
      cellIndex++;
    }
  }
}

function applyGridHighlights(gridElement, highlightsMatrix) {
  const cells = gridElement.querySelectorAll(".matrix-cell");
  let cellIndex = 0;
  for (let r = 0; r < highlightsMatrix.length; r++) {
    for (let c = 0; c < highlightsMatrix[r].length; c++) {
      const cell = cells[cellIndex];
      if (cell) {
        // Clear highlights
        cell.classList.remove(
          "cell-highlight-active",
          "cell-highlight-row",
          "cell-highlight-col",
          "cell-highlight-inactive"
        );
        // Apply class
        const highlightClass = highlightsMatrix[r][c];
        if (highlightClass) {
          cell.classList.add(highlightClass);
        }
      }
      cellIndex++;
    }
  }
}

function disableInputGrids() {
  gridA.querySelectorAll(".matrix-cell").forEach(cell => cell.disabled = true);
  gridB.querySelectorAll(".matrix-cell").forEach(cell => cell.disabled = true);
}

function enableInputGrids() {
  gridA.querySelectorAll(".matrix-cell").forEach(cell => cell.disabled = false);
  gridB.querySelectorAll(".matrix-cell").forEach(cell => cell.disabled = false);
}

function togglePlay() {
  if (state.isPlaying) {
    pause();
  } else {
    play();
  }
}

function play() {
  state.isPlaying = true;
  playIcon.className = "fa-solid fa-pause";
  btnPlay.setAttribute("title", "Pause Animation");

  if (state.steps.length === 0) {
    generateSteps();
  }
  
  if (state.currentStep >= state.steps.length - 1) {
    state.currentStep = -1; // restart
  }

  runInterval();
}

function runInterval() {
  state.playTimer = setTimeout(() => {
    stepNext();
    if (state.isPlaying && state.currentStep < state.steps.length - 1) {
      runInterval();
    } else {
      pause();
    }
  }, state.speed);
}

function pause() {
  state.isPlaying = false;
  playIcon.className = "fa-solid fa-play";
  btnPlay.setAttribute("title", "Play Animation");
  if (state.playTimer) {
    clearTimeout(state.playTimer);
    state.playTimer = null;
  }
}

function resetPlayback() {
  pause();

  // Restore input values from state
  enableInputGrids();
  
  // Re-draw original matrix state
  for (let r = 0; r < state.rowsA; r++) {
    for (let c = 0; c < state.colsA; c++) {
      const cell = document.getElementById(`cell-a-${r}-${c}`);
      if (cell) {
        cell.value = state.matrixA[r][c];
        cell.classList.remove(
          "cell-highlight-active",
          "cell-highlight-row",
          "cell-highlight-col",
          "cell-highlight-inactive"
        );
      }
    }
  }
  
  if (state.selectedOp === "add" || state.selectedOp === "multiply") {
    for (let r = 0; r < state.rowsB; r++) {
      for (let c = 0; c < state.colsB; c++) {
        const cell = document.getElementById(`cell-b-${r}-${c}`);
        if (cell) {
          cell.value = state.matrixB[r][c];
          cell.classList.remove(
            "cell-highlight-active",
            "cell-highlight-row",
            "cell-highlight-col",
            "cell-highlight-inactive"
          );
        }
      }
    }
  }

  // Clear highlights on result matrix
  gridResult.querySelectorAll(".matrix-cell").forEach(cell => {
    cell.value = "0";
    cell.classList.remove(
      "cell-highlight-active",
      "cell-highlight-row",
      "cell-highlight-col",
      "cell-highlight-inactive"
    );
  });

  state.steps = [];
  state.currentStep = -1;
  
  stepCounter.textContent = "Step 0 / 0";
  stepProgressFill.style.width = "0%";
  
  btnPrev.disabled = true;
  btnNext.disabled = true;
  
  explanationText.textContent = "Adjust values and click 'Play' or 'Next Step' to visualize.";
  mathScratchpad.textContent = "Waiting...";
}

// Start application
document.addEventListener("DOMContentLoaded", init);
