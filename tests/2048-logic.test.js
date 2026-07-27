const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createInitialState,
  moveGameState,
  hasWon,
  canMove,
} = require("../projects/games/2048-game/logic");

test("merges tiles to the left and awards score", () => {
  const state = {
    board: [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    score: 0,
    won: false,
    over: false,
    moved: false,
  };

  const next = moveGameState(state, "left", () => 0.5);

  assert.deepStrictEqual(next.board[0], [4, 0, 0, 0]);
  assert.equal(next.score, 4);
  assert.equal(next.moved, true);
});

test("does not merge the same tile twice in one move", () => {
  const state = {
    board: [
      [2, 2, 2, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    score: 0,
    won: false,
    over: false,
    moved: false,
  };

  const next = moveGameState(state, "left", () => 0.5);

  assert.deepStrictEqual(next.board[0], [4, 2, 0, 0]);
  assert.equal(next.score, 4);
});

test("detects a winning tile", () => {
  const board = [
    [2048, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];

  assert.equal(hasWon(board), true);
});

test("detects game over when no moves remain", () => {
  const board = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ];

  assert.equal(canMove(board), false);
});

test("creates a fresh game state with two starting tiles", () => {
  const state = createInitialState(() => 0.1);
  const filledCells = state.board.flat().filter(Boolean).length;

  assert.equal(filledCells, 2);
});
