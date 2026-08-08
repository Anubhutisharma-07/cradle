const test = require("node:test");
const assert = require("node:assert/strict");

const {
  canPredictCustom,
  formatConfidence,
  formatCustomPredictions,
  validateClassName,
} = require("../projects/aiml/image-classifier/classifierEngine.js");

// canPredictCustom
test("canPredictCustom returns true when there are at least two trained classes and a test image", () => {
  const classes = [
    { id: "1", name: "Cat", count: 3 },
    { id: "2", name: "Dog", count: 2 },
  ];

  assert.equal(canPredictCustom(classes, {}), true);
});

test("canPredictCustom returns false when fewer than two classes have images", () => {
  const classes = [
    { id: "1", name: "Cat", count: 3 },
    { id: "2", name: "Dog", count: 0 },
  ];

  assert.equal(canPredictCustom(classes, {}), false);
});

test("canPredictCustom returns false when there is no test image", () => {
  const classes = [
    { id: "1", name: "Cat", count: 3 },
    { id: "2", name: "Dog", count: 2 },
  ];

  assert.equal(canPredictCustom(classes, null), false);
});

// formatConfidence
test("formatConfidence converts probability to percentage with two decimals", () => {
  assert.equal(formatConfidence(0.8765), "87.65");
  assert.equal(formatConfidence(0.5), "50.00");
  assert.equal(formatConfidence(1), "100.00");
  assert.equal(formatConfidence(0), "0.00");
});

// formatCustomPredictions
test("formatCustomPredictions converts class IDs into class names", () => {
  const confidences = {
    "class-1": 0.8,
    "class-2": 0.2,
  };

  const classes = [
    { id: "class-1", name: "Cat", count: 3 },
    { id: "class-2", name: "Dog", count: 3 },
  ];

  assert.deepEqual(formatCustomPredictions(confidences, classes), [
    {
      className: "Cat",
      probability: 0.8,
    },
    {
      className: "Dog",
      probability: 0.2,
    },
  ]);
});

test("formatCustomPredictions sorts predictions by probability", () => {
  const confidences = {
    "class-1": 0.2,
    "class-2": 0.8,
  };

  const classes = [
    { id: "class-1", name: "Cat", count: 3 },
    { id: "class-2", name: "Dog", count: 3 },
  ];

  const result = formatCustomPredictions(confidences, classes);

  assert.equal(result[0].className, "Dog");
  assert.equal(result[0].probability, 0.8);
});

// validateClassName
test("validateClassName accepts a new non-empty class name", () => {
  const classes = [{ id: "1", name: "Cat", count: 2 }];

  assert.deepEqual(validateClassName("Dog", classes), {
    valid: true,
    error: null,
  });
});

test("validateClassName rejects an empty class name", () => {
  assert.deepEqual(validateClassName("   ", []), {
    valid: false,
    error: "Class name cannot be empty.",
  });
});

test("validateClassName rejects duplicate class names", () => {
  const classes = [{ id: "1", name: "Cat", count: 2 }];

  assert.deepEqual(validateClassName("Cat", classes), {
    valid: false,
    error: "Class name already exists.",
  });
});