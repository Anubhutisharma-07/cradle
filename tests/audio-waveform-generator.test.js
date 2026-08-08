const test = require("node:test");
const assert = require("node:assert/strict");

const {
  NOTES,
  NOTE_NAMES,
} = require("../projects/misc/audio-waveform-generator/waveformEngine.js");

test("NOTES contains the complete C4-B4 piano range", () => {
  assert.equal(NOTES.length, 7);

  assert.deepEqual(
    NOTES.map(({ note }) => note),
    ["C4", "D4", "E4", "F4", "G4", "A4", "B4"]
  );
});

test("NOTE_NAMES contains all piano note frequencies", () => {
  assert.equal(NOTE_NAMES.C4, 261.63);
  assert.equal(NOTE_NAMES.D4, 293.66);
  assert.equal(NOTE_NAMES.E4, 329.63);
  assert.equal(NOTE_NAMES.F4, 349.23);
  assert.equal(NOTE_NAMES.G4, 392.0);
  assert.equal(NOTE_NAMES.A4, 440.0);
  assert.equal(NOTE_NAMES.B4, 493.88);
});

test("NOTES and NOTE_NAMES contain matching frequencies", () => {
  NOTES.forEach(({ note, freq }) => {
    assert.equal(NOTE_NAMES[note], freq);
  });
});

test("A4 is tuned to 440 Hz", () => {
  assert.equal(NOTE_NAMES.A4, 440);
});

test("piano frequencies are in ascending order", () => {
  for (let i = 1; i < NOTES.length; i++) {
    assert.ok(
      NOTES[i].freq > NOTES[i - 1].freq,
      `${NOTES[i].note} should have a higher frequency than ${NOTES[i - 1].note}`
    );
  }
});

test("each NOTE entry has a note name and numeric frequency", () => {
  NOTES.forEach(({ note, freq }) => {
    assert.equal(typeof note, "string");
    assert.equal(typeof freq, "number");
    assert.ok(freq > 0);
  });
});