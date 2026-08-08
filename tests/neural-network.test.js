const test = require("node:test");
const assert = require("node:assert/strict");
const {
  Activations,
  generateDataset,
  normalizeDataset,
  NeuralNetwork,
} = require("../projects/aiml/neural-network-playground/nnEngine");

test("activations evaluate correctly and derivates match expected values", () => {
  assert.equal(Activations.relu.fn(5), 5);
  assert.equal(Activations.relu.fn(-3), 0);
  assert.equal(Activations.relu.deriv(5), 1);
  assert.equal(Activations.relu.deriv(-3), 0);

  assert.ok(Activations.sigmoid.fn(0) - 0.5 < 1e-5);
  assert.ok(Activations.sigmoid.deriv(0) - 0.25 < 1e-5);
});

test("dataset generator builds valid normalized 2D data points", () => {
  const data = generateDataset("circle", 50, 10);
  assert.equal(data.length, 50);
  data.forEach(p => {
    assert.equal(p.length, 3);
    assert.ok(p[0] >= -1.05 && p[0] <= 1.05);
    assert.ok(p[1] >= -1.05 && p[1] <= 1.05);
    assert.ok(p[2] === 0 || p[2] === 1);
  });
});

test("neural network forward pass initializes weights and produces probability in [0, 1]", () => {
  const net = new NeuralNetwork([2, 4, 4, 1], "relu", 0.01);
  const result = net.forward([0.5, -0.2]);
  assert.equal(result.as.length, 4); // 4 layers
  const prob = net.predict([0.5, -0.2]);
  assert.ok(prob >= 0 && prob <= 1);
});

test("neural network reduces loss after training steps on XOR problem", () => {
  const net = new NeuralNetwork([2, 8, 4, 1], "tanh", 0.1);
  const inputs = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  const targets = [0, 1, 1, 0];

  const initialLoss = net.train(inputs, targets, 4).loss;
  let finalLoss = initialLoss;

  for (let epoch = 0; epoch < 100; epoch++) {
    finalLoss = net.train(inputs, targets, 4).loss;
  }

  assert.ok(
    finalLoss < initialLoss,
    `Final loss (${finalLoss}) should be smaller than initial loss (${initialLoss})`
  );
});

// ── DATASET GENERATOR: ALL TYPES ────────────────────────────────

test("generateDataset produces valid data for 'xor' type", () => {
  const data = generateDataset("xor", 40, 10);
  assert.equal(data.length, 40);
  data.forEach(p => {
    assert.equal(p.length, 3);
    assert.ok(p[0] >= -1.05 && p[0] <= 1.05);
    assert.ok(p[1] >= -1.05 && p[1] <= 1.05);
    assert.ok(p[2] === 0 || p[2] === 1);
  });
});

test("generateDataset produces valid data for 'spiral' type", () => {
  const data = generateDataset("spiral", 40, 10);
  assert.equal(data.length, 40);
  data.forEach(p => {
    assert.equal(p.length, 3);
    assert.ok(p[0] >= -1.05 && p[0] <= 1.05);
    assert.ok(p[1] >= -1.05 && p[1] <= 1.05);
    assert.ok(p[2] === 0 || p[2] === 1);
  });
});

test("generateDataset produces valid data for 'gaussian' type", () => {
  const data = generateDataset("gaussian", 40, 10);
  assert.equal(data.length, 40);
  data.forEach(p => {
    assert.equal(p.length, 3);
    assert.ok(p[0] >= -1.05 && p[0] <= 1.05);
    assert.ok(p[1] >= -1.05 && p[1] <= 1.05);
    assert.ok(p[2] === 0 || p[2] === 1);
  });
});

test("generateDataset produces valid data for 'moon' type", () => {
  const data = generateDataset("moon", 40, 10);
  assert.equal(data.length, 40);
  data.forEach(p => {
    assert.equal(p.length, 3);
    assert.ok(p[0] >= -1.05 && p[0] <= 1.05);
    assert.ok(p[1] >= -1.05 && p[1] <= 1.05);
    assert.ok(p[2] === 0 || p[2] === 1);
  });
});

test("generateDataset falls back to 'circle' for unknown type", () => {
  const data = generateDataset("unknown_type", 30, 5);
  assert.equal(data.length, 30);
  data.forEach(p => {
    assert.equal(p.length, 3);
    assert.ok(p[0] >= -1.05 && p[0] <= 1.05);
    assert.ok(p[1] >= -1.05 && p[1] <= 1.05);
  });
});

// ── NORMALIZE DATASET ────────────────────────────────────────────

test("normalizeDataset returns empty array for empty input", () => {
  assert.deepEqual(normalizeDataset([]), []);
});

test("normalizeDataset returns empty array for null/undefined input", () => {
  assert.deepEqual(normalizeDataset(null), []);
  assert.deepEqual(normalizeDataset(undefined), []);
});

test("normalizeDataset scales points to [-1, 1] range", () => {
  const raw = [
    [10, 20, 0],
    [30, 40, 1],
    [50, 60, 0],
  ];
  const normalized = normalizeDataset(raw);
  assert.equal(normalized.length, 3);
  normalized.forEach(p => {
    assert.ok(p[0] >= -1.05 && p[0] <= 1.05);
    assert.ok(p[1] >= -1.05 && p[1] <= 1.05);
  });
  // Labels should be preserved
  assert.equal(normalized[0][2], 0);
  assert.equal(normalized[1][2], 1);
  assert.equal(normalized[2][2], 0);
});

test("normalizeDataset handles single-point data", () => {
  const raw = [[5, 10, 1]];
  const normalized = normalizeDataset(raw);
  assert.equal(normalized.length, 1);
  // Single point: range is 0, so normalized to 0 (center)
  assert.equal(normalized[0][0], -1);
  assert.equal(normalized[0][1], -1);
  assert.equal(normalized[0][2], 1);
});

// ── NEURAL NETWORK: EXPORT COMPATIBILITY ─────────────────────────

test("NeuralNetwork weights/biases/layers are accessible for export", () => {
  const net = new NeuralNetwork([2, 6, 4, 1], "relu", 0.01);
  assert.deepEqual(net.layers, [2, 6, 4, 1]);
  assert.equal(net.weights.length, 3);
  assert.equal(net.biases.length, 3);
  assert.equal(net.weights[0].length, 6);
  assert.equal(net.weights[0][0].length, 2);
  assert.equal(net.weights[1].length, 4);
  assert.equal(net.weights[1][0].length, 6);
  assert.equal(net.weights[2].length, 1);
  assert.equal(net.weights[2][0].length, 4);
  assert.equal(net.activationName, "relu");
  assert.equal(net.lr, 0.01);
});

test("NeuralNetwork produces consistent predictions with same weights", () => {
  const net = new NeuralNetwork([2, 4, 1], "sigmoid", 0.01);
  const input = [0.5, -0.3];
  const pred1 = net.predict(input);
  const pred2 = net.predict(input);
  assert.equal(pred1, pred2);
});
