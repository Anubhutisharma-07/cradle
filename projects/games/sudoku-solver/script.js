const boardElement = document.getElementById("board");

const difficultySelect =
    document.getElementById("difficulty");

const newGameButton =
    document.getElementById("newGame");

const solveButton =
    document.getElementById("solveBtn");

const hintButton =
    document.getElementById("hintBtn");

const resetButton =
    document.getElementById("resetBtn");

const timerElement =
    document.getElementById("timer");

const messageElement =
    document.getElementById("message");

const headerStatus =
    document.getElementById("headerStatus");

const filledStat =
    document.getElementById("filledStat");

const hintStat =
    document.getElementById("hintStat");

const difficultyStat =
    document.getElementById("difficultyStat");

const difficultyDisplay =
    document.getElementById("difficultyDisplay");

const filledDisplay =
    document.getElementById("filledDisplay");

const puzzleState =
    document.getElementById("puzzleState");

const numberButtons =
    document.querySelectorAll(
        ".number-pad button"
    );


/* =========================================
   GAME STATE
========================================= */

let puzzle = [];

let solution = [];

let currentBoard = [];

let selectedCell = null;

let hintsUsed = 0;

let seconds = 0;

let timerInterval = null;

let gameStarted = false;


/* =========================================
   DIFFICULTY
========================================= */

const difficultySettings = {

    easy: {
        removed: 35
    },

    medium: {
        removed: 48
    },

    hard: {
        removed: 56
    }

};


/* =========================================
   START GAME
========================================= */

function startNewGame() {

    stopTimer();

    seconds = 0;

    hintsUsed = 0;

    selectedCell = null;

    gameStarted = true;

    updateTimer();

    const difficulty =
        difficultySelect.value;

    const generated =
        generatePuzzle(
            difficulty
        );

    puzzle = generated.puzzle;

    solution = generated.solution;

    currentBoard =
        puzzle.map(row => [...row]);

    renderBoard();

    updateStats();

    updateStatus(
        "New puzzle generated."
    );

    startTimer();

}


/* =========================================
   GENERATE PUZZLE
========================================= */

function generatePuzzle(difficulty) {

    const solved =
        createSolvedBoard();

    const puzzleBoard =
        solved.map(row => [...row]);

    const removeCount =
        difficultySettings[difficulty].removed;

    let removed = 0;

    while (removed < removeCount) {

        const row =
            Math.floor(Math.random() * 9);

        const col =
            Math.floor(Math.random() * 9);

        if (puzzleBoard[row][col] !== 0) {

            puzzleBoard[row][col] = 0;

            removed++;

        }

    }

    return {
        puzzle: puzzleBoard,
        solution: solved
    };

}


/* =========================================
   CREATE SOLVED BOARD
========================================= */

function createSolvedBoard() {

    const board =
        Array.from(
            { length: 9 },
            () => Array(9).fill(0)
        );

    fillBoard(board);

    return board;

}


/* =========================================
   SOLVER / GENERATOR
========================================= */

function fillBoard(board) {

    const empty =
        findEmptyCell(board);

    if (!empty) {
        return true;
    }

    const [row, col] = empty;

    const numbers =
        shuffledNumbers();

    for (const number of numbers) {

        if (
            isValidMove(
                board,
                row,
                col,
                number
            )
        ) {

            board[row][col] = number;

            if (fillBoard(board)) {
                return true;
            }

            board[row][col] = 0;

        }

    }

    return false;

}


/* =========================================
   FIND EMPTY CELL
========================================= */

function findEmptyCell(board) {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (board[row][col] === 0) {
                return [row, col];
            }

        }

    }

    return null;

}


/* =========================================
   VALIDATE MOVE
========================================= */

function isValidMove(
    board,
    row,
    col,
    number
) {

    for (let x = 0; x < 9; x++) {

        if (
            board[row][x] === number &&
            x !== col
        ) {
            return false;
        }

    }

    for (let x = 0; x < 9; x++) {

        if (
            board[x][col] === number &&
            x !== row
        ) {
            return false;
        }

    }

    const startRow =
        row - (row % 3);

    const startCol =
        col - (col % 3);

    for (
        let r = startRow;
        r < startRow + 3;
        r++
    ) {

        for (
            let c = startCol;
            c < startCol + 3;
            c++
        ) {

            if (
                board[r][c] === number &&
                (r !== row || c !== col)
            ) {
                return false;
            }

        }

    }

    return true;

}


/* =========================================
   SHUFFLE NUMBERS
========================================= */

function shuffledNumbers() {

    const numbers =
        [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (
        let i = numbers.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            numbers[i],
            numbers[j]
        ] = [
                numbers[j],
                numbers[i]
            ];

    }

    return numbers;

}


/* =========================================
   RENDER BOARD
========================================= */

function renderBoard() {

    boardElement.innerHTML = "";

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            const cell =
                document.createElement("button");

            cell.className = "cell";

            cell.type = "button";

            cell.dataset.row = row;
            cell.dataset.col = col;

            const value =
                currentBoard[row][col];

            const original =
                puzzle[row][col];

            if (value !== 0) {

                cell.textContent = value;

            }

            if (original !== 0) {

                cell.classList.add(
                    "fixed"
                );

            } else if (value !== 0) {

                cell.classList.add(
                    "user-input"
                );

            }

            cell.addEventListener(
                "click",
                () => selectCell(row, col)
            );

            boardElement.appendChild(cell);

        }

    }

}


/* =========================================
   SELECT CELL
========================================= */

function selectCell(row, col) {

    selectedCell = {
        row,
        col
    };

    updateCellHighlights();

}


/* =========================================
   HIGHLIGHT CELLS
========================================= */

function updateCellHighlights() {

    const cells =
        document.querySelectorAll(
            ".cell"
        );

    cells.forEach(cell => {

        cell.classList.remove(
            "selected",
            "related",
            "same-number"
        );

    });

    if (!selectedCell) {
        return;
    }

    const {
        row,
        col
    } = selectedCell;

    const selectedValue =
        currentBoard[row][col];

    cells.forEach(cell => {

        const r =
            Number(cell.dataset.row);

        const c =
            Number(cell.dataset.col);

        if (r === row && c === col) {

            cell.classList.add(
                "selected"
            );

            return;

        }

        if (
            r === row ||
            c === col ||
            (
                Math.floor(r / 3) ===
                Math.floor(row / 3) &&
                Math.floor(c / 3) ===
                Math.floor(col / 3)
            )
        ) {

            cell.classList.add(
                "related"
            );

        }

        if (
            selectedValue !== 0 &&
            currentBoard[r][c] ===
            selectedValue
        ) {

            cell.classList.add(
                "same-number"
            );

        }

    });

}


/* =========================================
   ENTER NUMBER
========================================= */

function enterNumber(number) {

    if (!selectedCell) {

        updateStatus(
            "Select a cell first."
        );

        return;

    }

    const {
        row,
        col
    } = selectedCell;

    // Fixed cells cannot be changed

    if (puzzle[row][col] !== 0) {

        updateStatus(
            "That number is part of the puzzle."
        );

        return;

    }


    // Erase

    if (number === 0) {

        currentBoard[row][col] = 0;

        renderBoard();

        selectCell(row, col);

        updateStats();

        updateStatus(
            "Cell cleared."
        );

        return;

    }


    // Check move

    if (
        !isValidMove(
            currentBoard,
            row,
            col,
            number
        )
    ) {

        markError(
            row,
            col
        );

        updateStatus(
            "That number conflicts with this row, column, or box."
        );

        return;

    }


    currentBoard[row][col] =
        number;

    renderBoard();

    selectCell(row, col);

    updateStats();

    checkCompletion();

}


/* =========================================
   ERROR
========================================= */

function markError(row, col) {

    const cell =
        document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

    if (!cell) {
        return;
    }

    cell.classList.add("error");

    setTimeout(() => {

        cell.classList.remove(
            "error"
        );

    }, 500);

}


/* =========================================
   HINT
========================================= */

function giveHint() {

    if (!selectedCell) {

        // Find random empty cell

        const emptyCells = [];

        for (
            let row = 0;
            row < 9;
            row++
        ) {

            for (
                let col = 0;
                col < 9;
                col++
            ) {

                if (
                    puzzle[row][col] === 0 &&
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

            updateStatus(
                "No empty cells available."
            );

            return;

        }

        selectedCell =
            emptyCells[
            Math.floor(
                Math.random() *
                emptyCells.length
            )
            ];

    }


    const {
        row,
        col
    } = selectedCell;


    if (puzzle[row][col] !== 0) {

        updateStatus(
            "Select an empty cell for a hint."
        );

        return;

    }


    currentBoard[row][col] =
        solution[row][col];

    hintsUsed++;

    renderBoard();

    const cell =
        document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );

    if (cell) {

        cell.classList.add(
            "hint"
        );

    }

    selectCell(row, col);

    updateStats();

    updateStatus(
        "Hint added."
    );

    checkCompletion();

}


/* =========================================
   SOLVE
========================================= */

function solvePuzzle() {

    currentBoard =
        solution.map(row => [...row]);

    renderBoard();

    updateStats();

    puzzleState.textContent =
        "Solved";

    updateStatus(
        "Puzzle solved!"
    );

    stopTimer();

}


/* =========================================
   RESET
========================================= */

function resetPuzzle() {

    currentBoard =
        puzzle.map(row => [...row]);

    selectedCell = null;

    hintsUsed = 0;

    renderBoard();

    updateStats();

    updateStatus(
        "Puzzle reset."
    );

    puzzleState.textContent =
        "In Progress";

}


/* =========================================
   CHECK COMPLETION
========================================= */

function checkCompletion() {

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (
                currentBoard[row][col] === 0
            ) {

                return false;

            }

        }

    }


    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (
                currentBoard[row][col] !==
                solution[row][col]
            ) {

                return false;

            }

        }

    }


    puzzleState.textContent =
        "Completed";

    headerStatus.textContent =
        "Puzzle Complete";

    updateStatus(
        "🎉 Congratulations! Puzzle completed."
    );

    stopTimer();

    return true;

}


/* =========================================
   UPDATE STATS
========================================= */

function updateStats() {

    let filled = 0;

    for (let row = 0; row < 9; row++) {

        for (let col = 0; col < 9; col++) {

            if (
                currentBoard[row][col] !== 0
            ) {

                filled++;

            }

        }

    }

    const difficulty =
        capitalize(
            difficultySelect.value
        );

    difficultyStat.textContent =
        difficulty;

    difficultyDisplay.textContent =
        difficulty;

    filledStat.textContent =
        filled;

    filledDisplay.textContent =
        `${filled} / 81`;

    hintStat.textContent =
        hintsUsed;

}


/* =========================================
   STATUS MESSAGE
========================================= */

function updateStatus(message) {

    messageElement.textContent =
        message;

    headerStatus.textContent =
        message;

}


/* =========================================
   TIMER
========================================= */

function startTimer() {

    stopTimer();

    timerInterval =
        setInterval(() => {

            seconds++;

            updateTimer();

        }, 1000);

}

function stopTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;

    }

}

function updateTimer() {

    const minutes =
        Math.floor(
            seconds / 60
        );

    const secs =
        seconds % 60;

    timerElement.textContent =
        `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

}


/* =========================================
   CAPITALIZE
========================================= */

function capitalize(value) {

    return value.charAt(0).toUpperCase() +
        value.slice(1);

}


/* =========================================
   NUMBER PAD EVENTS
========================================= */

numberButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const number =
                Number(
                    button.dataset.number
                );

            enterNumber(number);

        }
    );

});


/* =========================================
   KEYBOARD INPUT
========================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key;

        if (
            /^[1-9]$/.test(key)
        ) {

            enterNumber(
                Number(key)
            );

        }

        if (
            key === "Backspace" ||
            key === "Delete" ||
            key === "0"
        ) {

            enterNumber(0);

        }

    }
);


/* =========================================
   BUTTON EVENTS
========================================= */

newGameButton.addEventListener(
    "click",
    startNewGame
);

solveButton.addEventListener(
    "click",
    solvePuzzle
);

hintButton.addEventListener(
    "click",
    giveHint
);

resetButton.addEventListener(
    "click",
    resetPuzzle
);

difficultySelect.addEventListener(
    "change",
    () => {

        startNewGame();

    }
);


/* =========================================
   INITIALIZE
========================================= */

startNewGame();