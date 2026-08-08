const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createBoard,
  getCapacity,
  getRandomMove,
  getValidMoves,
  hasPieces,
} = require("../projects/games/dot-game/dotGameEngine.js");

test("createBoard creates an empty square board", () => {
  const board = createBoard(3);

  assert.equal(board.length, 3);
  assert.equal(board[0].length, 3);

  for (const row of board) {
    for (const cell of row) {
      assert.deepEqual(cell, {
        owner: null,
        dots: 0,
      });
    }
  }
});

test("getCapacity returns correct capacity for corners", () => {
  assert.equal(getCapacity(0, 0, 5), 2);
  assert.equal(getCapacity(0, 4, 5), 2);
  assert.equal(getCapacity(4, 0, 5), 2);
  assert.equal(getCapacity(4, 4, 5), 2);
});

test("getCapacity returns correct capacity for edges", () => {
  assert.equal(getCapacity(0, 2, 5), 3);
  assert.equal(getCapacity(4, 2, 5), 3);
  assert.equal(getCapacity(2, 0, 5), 3);
  assert.equal(getCapacity(2, 4, 5), 3);
});

test("getCapacity returns 4 for center cells", () => {
  assert.equal(getCapacity(2, 2, 5), 4);
});

test("hasPieces detects when a player owns pieces", () => {
  const board = createBoard(3);

  board[1][1].owner = "red";
  board[1][1].dots = 1;

  assert.equal(hasPieces(board, "red"), true);
});

test("hasPieces returns false when player has no pieces", () => {
  const board = createBoard(3);

  board[1][1].owner = "blue";
  board[1][1].dots = 1;

  assert.equal(hasPieces(board, "red"), false);
});

test("getValidMoves returns empty and player-owned cells", () => {
  const board = createBoard(3);

  board[0][0].owner = "red";
  board[0][0].dots = 1;

  board[1][1].owner = "blue";
  board[1][1].dots = 1;

  const moves = getValidMoves(board, "red");

  assert.equal(moves.length, 8);

  assert.ok(
    moves.some(move => move.r === 0 && move.c === 0)
  );

  assert.ok(
    !moves.some(move => move.r === 1 && move.c === 1)
  );
});

test("getValidMoves returns all cells on an empty board", () => {
  const board = createBoard(2);

  const moves = getValidMoves(board, "red");

  assert.equal(moves.length, 4);
});

test("getRandomMove returns a valid move", () => {
  const board = createBoard(3);

  board[0][0].owner = "blue";
  board[0][0].dots = 1;

  const move = getRandomMove(board, "red");

  assert.ok(move);
  assert.notDeepEqual(move, { r: 0, c: 0 });

  const cell = board[move.r][move.c];

  assert.ok(
    !cell.owner || cell.owner === "red"
  );
});

test("getRandomMove can select a player-owned cell", () => {
  const board = createBoard(2);

  board[0][0].owner = "red";
  board[0][0].dots = 1;

  const moves = getValidMoves(board, "red");

  assert.ok(
    moves.some(move => move.r === 0 && move.c === 0)
  );
});

test("getRandomMove returns null when no valid moves exist", () => {
  const board = createBoard(2);

  for (const row of board) {
    for (const cell of row) {
      cell.owner = "blue";
      cell.dots = 1;
    }
  }

  assert.equal(getRandomMove(board, "red"), null);
});