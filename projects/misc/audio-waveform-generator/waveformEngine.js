/**
 * Audio Waveform & Tone Generator — Engine
 *
 * Pure data/constants extracted from the UI layer for testing.
 */

/**
 * Piano notes from C4 to B4 using equal temperament
 * with A4 = 440 Hz.
 */
export const NOTES = [
  { note: "C4", freq: 261.63 },
  { note: "D4", freq: 293.66 },
  { note: "E4", freq: 329.63 },
  { note: "F4", freq: 349.23 },
  { note: "G4", freq: 392.0 },
  { note: "A4", freq: 440.0 },
  { note: "B4", freq: 493.88 },
];

/**
 * Maps keyboard note names to their frequencies.
 */
export const NOTE_NAMES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
};
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NOTES,
    NOTE_NAMES,
  };
}