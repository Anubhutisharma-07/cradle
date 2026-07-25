const test = require("node:test");
const assert = require("node:assert/strict");
const LudoEngine = require("../projects/games/ludo-game/ludoEngine");
const LudoBot = require("../projects/games/ludo-game/ludoBot");

test("Token initialization and properties", () => {
  const redTokens = LudoEngine.createTokens("red");
  assert.equal(redTokens.length, 4);
  assert.equal(redTokens[0].color, "red");
  assert.equal(redTokens[0].position, -1);
  assert.equal(redTokens[0].isVictoryPath, false);
  assert.equal(redTokens[0].finished, false);
});

test("Spawn rules on dice roll of 6", () => {
  const redTokens = LudoEngine.createTokens("red");

  // Cannot move out of home without rolling 6
  assert.equal(LudoEngine.isValidMove(redTokens[0], "red", 5), false);
  assert.equal(LudoEngine.isValidMove(redTokens[0], "red", 6), true);

  const nextState = LudoEngine.getNextPositionState(redTokens[0], 6);
  assert.equal(nextState.position, LudoEngine.START_INDEX.red);
});

test("Track distance calculations and victory path entry", () => {
  const token = {
    id: 0,
    color: "red",
    position: 48,
    isVictoryPath: false,
    finished: false,
  };

  // Red home entry is at index 50, distance to home entry is 2 steps (50 - 48 = 2)
  const dist = LudoEngine.calculateDistanceToHome(token);
  assert.equal(dist, 2);

  // Rolling 3 (which is > 2) should move token into victory path at position (3 - 2 - 1 = 0)
  const nextState = LudoEngine.getNextPositionState(token, 3);
  assert.equal(nextState.isVictoryPath, true);
  assert.equal(nextState.position, 0);
  assert.equal(nextState.finished, false);
});

test("Capture rules and safe star zones", () => {
  const state = {
    red: LudoEngine.createTokens("red"),
    green: LudoEngine.createTokens("green"),
  };

  // Place red token and green token at position 5
  state.red[0].position = 5;
  state.green[0].position = 5;

  const captured = LudoEngine.checkCaptures(state.red[0], state);
  assert.equal(captured.length, 1);
  assert.equal(captured[0].color, "green");
  assert.equal(state.green[0].position, -1);

  // Safe zone test (e.g. position 0 is [6,1] which is a safe zone)
  state.red[0].position = 0;
  state.green[0].position = 0;
  const safeCaptured = LudoEngine.checkCaptures(state.red[0], state);
  assert.equal(safeCaptured.length, 0);
  assert.equal(state.green[0].position, 0);
});

test("Win state detection", () => {
  const state = {
    red: LudoEngine.createTokens("red"),
  };

  assert.equal(LudoEngine.checkWinner(state, "red"), false);
  state.red.forEach(t => (t.finished = true));
  assert.equal(LudoEngine.checkWinner(state, "red"), true);
});

test("Bot move evaluation heuristics priority", () => {
  const state = {
    green: LudoEngine.createTokens("green"),
    red: LudoEngine.createTokens("red"),
  };

  // Token 0 in home base vs Token 1 already on board
  state.green[1].position = 15;

  // Rolling 6 allows spawning Token 0 or moving Token 1
  const moveToken0Score = LudoBot.evaluateMove(state.green[0], 6, state);

  // Set an opponent token ahead for Token 1 to capture
  state.red[0].position = 21; // 15 + 6 = 21
  const captureScore = LudoBot.evaluateMove(state.green[1], 6, state);

  assert.ok(
    captureScore > moveToken0Score,
    "Bot should prioritize capturing opponent tokens over spawning new token"
  );

  const selected = LudoBot.selectBestMove(
    [state.green[0], state.green[1]],
    6,
    state,
    () => 0
  );
  assert.equal(selected.id, 1);
});
