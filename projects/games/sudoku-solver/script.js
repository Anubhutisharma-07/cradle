/* =========================================
   SUDOKU SOLVER & GENERATOR
========================================= */


/* =========================================
   CONSTANTS
========================================= */

const SIZE = 9;
const BOX_SIZE = 3;

const DIFFICULTY = {
    easy: 38,
    medium: 48,
    hard: 56
};


/* =========================================
   DOM ELEMENTS
========================================= */

const boardElement = document.getElementById("sudokuBoard");

const difficultySelect =
    document.getElementById("difficulty");

const generateBtn =
    document.getElementById("generateBtn");

const solveBtn =
    document.getElementById("solveBtn");

const hintBtn =
    document.getElementById("hintBtn");

const resetBtn =
    document.getElementById("resetBtn");

const messageElement =
    document.getElementById("message");

const statusBadge =
    document.getElementById("statusBadge");

const filledCountElement =
    document.getElementById("filledCount");

const hintCountElement =
    document.getElementById("hintCount");

const difficultyDisplay =
    document.getElementById("difficultyDisplay");


/* =========================================
   GAME STATE
========================================= */

let puzzle = createEmptyBoard();

let solution = createEmptyBoard();

let currentBoard = createEmptyBoard();

let hintsRemaining = 3;

let selectedCell = null;

let isSolved = false;


/* =========================================
   CREATE EMPTY BOARD
========================================= */

function createEmptyBoard() {

    return Array.from(
        { length: SIZE },
        () => Array(SIZE).fill(0)
    );

}


/* =========================================
   COPY BOARD
========================================= */

function copyBoard(board) {

    return board.map(row => [...row]);

}


/* =========================================
   SHUFFLE ARRAY
========================================= */

function shuffle(array) {

    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [result[i], result[j]] =
            [result[j], result[i]];
    }

    return result;
}


/* =========================================
   CHECK VALID MOVE
========================================= */

function isValid(board, row, col, number) {

    // Check row

    for (let c = 0; c < SIZE; c++) {

        if (
            c !== col &&
            board[row][c] === number
        ) {
            return false;
        }
    }


    // Check column

    for (let r = 0; r < SIZE; r++) {

        if (
            r !== row &&
            board[r][col] === number
        ) {
            return false;
        }
    }


    // Check 3x3 box

    const startRow =
        Math.floor(row / BOX_SIZE) * BOX_SIZE;

    const startCol =
        Math.floor(col / BOX_SIZE) * BOX_SIZE;

    for (
        let r = startRow;
        r < startRow + BOX_SIZE;
        r++
    ) {

        for (
            let c = startCol;
            c < startCol + BOX_SIZE;
            c++
        ) {

            if (
                (r !== row || c !== col) &&
                board[r][c] === number
            ) {
                return false;
            }
        }
    }

    return true;
}


/* =========================================
   FIND EMPTY CELL
========================================= */

function findEmpty(board) {

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (board[row][col] === 0) {

                return {
                    row,
                    col
                };
            }
        }
    }

    return null;
}


/* =========================================
   SOLVE SUDOKU
   BACKTRACKING ALGORITHM
========================================= */

function solveSudoku(board) {

    const empty = findEmpty(board);

    if (!empty) {
        return true;
    }

    const {
        row,
        col
    } = empty;


    const numbers = shuffle(
        [1, 2, 3, 4, 5, 6, 7, 8, 9]
    );


    for (const number of numbers) {

        if (
            isValid(
                board,
                row,
                col,
                number
            )
        ) {

            board[row][col] = number;


            if (solveSudoku(board)) {
                return true;
            }


            board[row][col] = 0;
        }
    }

    return false;
}


/* =========================================
   GENERATE SOLVED BOARD
========================================= */

function generateSolvedBoard() {

    const board = createEmptyBoard();

    solveSudoku(board);

    return board;
}


/* =========================================
   REMOVE NUMBERS
========================================= */

function removeNumbers(board, count) {

    const result = copyBoard(board);

    let removed = 0;


    const positions = [];

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            positions.push({
                row,
                col
            });
        }
    }


    const shuffledPositions =
        shuffle(positions);


    for (
        const position of shuffledPositions
    ) {

        if (removed >= count) {
            break;
        }


        const {
            row,
            col
        } = position;


        if (result[row][col] === 0) {
            continue;
        }


        result[row][col] = 0;

        removed++;
    }

    return result;
}


/* =========================================
   GENERATE PUZZLE
========================================= */

function generatePuzzle() {

    const difficulty =
        difficultySelect.value;

    const removeCount =
        DIFFICULTY[difficulty];


    solution =
        generateSolvedBoard();


    puzzle =
        removeNumbers(
            solution,
            removeCount
        );


    currentBoard =
        copyBoard(puzzle);


    hintsRemaining = 3;

    selectedCell = null;

    isSolved = false;


    difficultyDisplay.textContent =
        capitalize(difficulty);

    updateHintDisplay();

    renderBoard();

    updateFilledCount();

    updateStatus(
        "Ready",
        "ready"
    );

    showMessage(
        "New puzzle generated. Good luck!",
        "info"
    );
}


/* =========================================
   RENDER BOARD
========================================= */

function renderBoard() {

    boardElement.innerHTML = "";


    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const input =
                document.createElement("input");


            input.type = "text";

            input.inputMode = "numeric";

            input.maxLength = 1;

            input.className = "cell";


            input.dataset.row = row;

            input.dataset.col = col;


            const value =
                currentBoard[row][col];


            if (value !== 0) {

                input.value = value;
            }


            // Original puzzle cells

            if (puzzle[row][col] !== 0) {

                input.classList.add("fixed");

                input.readOnly = true;
            }

            else {

                input.classList.add(
                    "user-input"
                );
            }


            input.addEventListener(
                "input",
                handleInput
            );


            input.addEventListener(
                "focus",
                handleFocus
            );


            input.addEventListener(
                "keydown",
                handleKeyDown
            );


            boardElement.appendChild(input);
        }
    }


    if (selectedCell) {

        highlightRelatedCells(
            selectedCell.row,
            selectedCell.col
        );
    }
}


/* =========================================
   HANDLE INPUT
========================================= */

function handleInput(event) {

    const input = event.target;

    const row =
        Number(input.dataset.row);

    const col =
        Number(input.dataset.col);


    let value =
        input.value.replace(
            /[^1-9]/g,
            ""
        );


    input.value = value;


    if (value === "") {

        currentBoard[row][col] = 0;

        input.classList.remove(
            "conflict"
        );

        updateFilledCount();

        showMessage(
            "Cell cleared.",
            "info"
        );

        return;
    }


    const number =
        Number(value);


    currentBoard[row][col] =
        number;


    if (
        !isValid(
            currentBoard,
            row,
            col,
            number
        )
    ) {

        input.classList.add(
            "conflict"
        );

        showMessage(
            "That number conflicts with another number.",
            "error"
        );

    }

    else {

        input.classList.remove(
            "conflict"
        );

        showMessage(
            "Number added.",
            "info"
        );
    }


    updateFilledCount();

    checkCompletion();

    highlightRelatedCells(row, col);
}


/* =========================================
   HANDLE FOCUS
========================================= */

function handleFocus(event) {

    const input = event.target;

    const row =
        Number(input.dataset.row);

    const col =
        Number(input.dataset.col);


    selectedCell = {
        row,
        col
    };


    highlightRelatedCells(
        row,
        col
    );
}


/* =========================================
   KEYBOARD NAVIGATION
========================================= */

function handleKeyDown(event) {

    const input = event.target;

    const row =
        Number(input.dataset.row);

    const col =
        Number(input.dataset.col);


    let targetRow = row;

    let targetCol = col;


    switch (event.key) {

        case "ArrowUp":
            targetRow--;
            break;

        case "ArrowDown":
            targetRow++;
            break;

        case "ArrowLeft":
            targetCol--;
            break;

        case "ArrowRight":
            targetCol++;
            break;

        default:
            return;
    }


    event.preventDefault();


    if (
        targetRow >= 0 &&
        targetRow < SIZE &&
        targetCol >= 0 &&
        targetCol < SIZE
    ) {

        const target =
            document.querySelector(
                `[data-row="${targetRow}"][data-col="${targetCol}"]`
            );


        if (target) {
            target.focus();
        }
    }
}


/* =========================================
   HIGHLIGHT RELATED CELLS
========================================= */

function highlightRelatedCells(row, col) {

    const cells =
        document.querySelectorAll(".cell");


    cells.forEach(cell => {

        cell.classList.remove(
            "selected"
        );

    });


    cells.forEach(cell => {

        const cellRow =
            Number(cell.dataset.row);

        const cellCol =
            Number(cell.dataset.col);


        const sameRow =
            cellRow === row;

        const sameColumn =
            cellCol === col;

        const sameBox =
            Math.floor(cellRow / 3) ===
            Math.floor(row / 3) &&
            Math.floor(cellCol / 3) ===
            Math.floor(col / 3);


        if (
            sameRow ||
            sameColumn ||
            sameBox
        ) {

            cell.classList.add(
                "selected"
            );
        }
    });
}


/* =========================================
   UPDATE FILLED COUNT
========================================= */

function updateFilledCount() {

    let count = 0;


    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (
                currentBoard[row][col] !== 0
            ) {

                count++;
            }
        }
    }


    filledCountElement.textContent =
        count;
}


/* =========================================
   UPDATE HINT DISPLAY
========================================= */

function updateHintDisplay() {

    hintCountElement.textContent =
        hintsRemaining;


    hintBtn.disabled =
        hintsRemaining <= 0 ||
        isSolved;
}


/* =========================================
   HINT
========================================= */

function giveHint() {

    if (hintsRemaining <= 0) {

        showMessage(
            "You have used all your hints.",
            "error"
        );

        return;
    }


    const emptyCells = [];


    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (
                currentBoard[row][col] === 0
            ) {

                emptyCells.push({
                    row,
                    col
                });
            }
        }
    }


    if (emptyCells.length === 0) {

        checkCompletion();

        return;
    }


    const selected =
        emptyCells[
        Math.floor(
            Math.random() *
            emptyCells.length
        )
        ];


    const {
        row,
        col
    } = selected;


    currentBoard[row][col] =
        solution[row][col];


    hintsRemaining--;


    renderBoard();

    updateFilledCount();

    updateHintDisplay();


    const cell =
        document.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
        );


    if (cell) {

        cell.classList.add("hint");
    }


    showMessage(
        `Hint used! ${hintsRemaining} hint${hintsRemaining === 1 ? "" : "s"
        } remaining.`,
        "success"
    );


    checkCompletion();
}


/* =========================================
   SOLVE BUTTON
========================================= */

function solveCurrentPuzzle() {

    currentBoard =
        copyBoard(solution);

    isSolved = true;


    renderBoard();

    updateFilledCount();

    updateHintDisplay();


    updateStatus(
        "Solved",
        "solved"
    );


    showMessage(
        "🎉 Puzzle solved successfully!",
        "success"
    );
}


/* =========================================
   RESET PUZZLE
========================================= */

function resetPuzzle() {

    currentBoard =
        copyBoard(puzzle);


    hintsRemaining = 3;

    selectedCell = null;

    isSolved = false;


    renderBoard();

    updateFilledCount();

    updateHintDisplay();


    updateStatus(
        "Ready",
        "ready"
    );


    showMessage(
        "Puzzle reset. Try again!",
        "info"
    );
}


/* =========================================
   CHECK COMPLETION
========================================= */

function checkCompletion() {

    // Check for empty cells

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            if (
                currentBoard[row][col] === 0
            ) {

                return false;
            }
        }
    }


    // Check every cell

    for (let row = 0; row < SIZE; row++) {

        for (let col = 0; col < SIZE; col++) {

            const value =
                currentBoard[row][col];


            if (
                value !== solution[row][col]
            ) {

                showMessage(
                    "The board is filled, but some numbers are incorrect.",
                    "error"
                );

                return false;
            }
        }
    }


    // Puzzle completed

    isSolved = true;


    const cells =
        document.querySelectorAll(".cell");


    cells.forEach(cell => {

        cell.classList.add("solved");

    });


    updateStatus(
        "Completed",
        "solved"
    );


    showMessage(
        "🎉 Congratulations! You solved the Sudoku!",
        "success"
    );


    updateHintDisplay();


    return true;
}


/* =========================================
   STATUS BADGE
========================================= */

function updateStatus(
    text,
    type
) {

    statusBadge.textContent =
        text;


    statusBadge.className =
        "status-badge";


    if (type === "solved") {

        statusBadge.style.background =
            "#dcfce7";

        statusBadge.style.color =
            "#166534";
    }

    else if (type === "error") {

        statusBadge.style.background =
            "#fee2e2";

        statusBadge.style.color =
            "#991b1b";
    }

    else {

        statusBadge.style.background =
            "#e0e7ff";

        statusBadge.style.color =
            "#3730a3";
    }
}


/* =========================================
   SHOW MESSAGE
========================================= */

function showMessage(
    message,
    type = "info"
) {

    messageElement.textContent =
        message;


    messageElement.className =
        "message";


    if (type) {

        messageElement.classList.add(
            type
        );
    }
}


/* =========================================
   CAPITALIZE
========================================= */

function capitalize(text) {

    return text.charAt(0).toUpperCase() +
        text.slice(1);
}


/* =========================================
   BUTTON EVENTS
========================================= */

generateBtn.addEventListener(
    "click",
    generatePuzzle
);


solveBtn.addEventListener(
    "click",
    solveCurrentPuzzle
);


hintBtn.addEventListener(
    "click",
    giveHint
);


resetBtn.addEventListener(
    "click",
    resetPuzzle
);


difficultySelect.addEventListener(
    "change",
    () => {

        difficultyDisplay.textContent =
            capitalize(
                difficultySelect.value
            );

        generatePuzzle();
    }
);


/* =========================================
   INITIALIZE GAME
========================================= */

generatePuzzle();