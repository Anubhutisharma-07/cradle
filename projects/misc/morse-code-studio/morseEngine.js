/* =========================================================
   MORSE CODE STUDIO — ENGINE MODULE
   Modular Morse code translation dictionary, signal generator,
   Web Audio synth tone timing, and WPM velocity calculator.
   ========================================================= */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.MorseEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const MORSE_MAP = Object.freeze({
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
    I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
    Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
    5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.", ".": ".-.-.-",
    ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--", "/": "-..-.",
    "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...", ";": "-.-.-.",
    "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.",
    "$": "...-..-", "@": ".--.-.", " ": "/",
  });

  const REVERSE_MORSE_MAP = Object.freeze(
    Object.fromEntries(Object.entries(MORSE_MAP).map(([k, v]) => [v, k]))
  );

  /** Calculate dit duration in milliseconds from Words Per Minute (WPM) */
  function getDitDurationMs(wpm = 20) {
    const safeWpm = Math.max(5, Math.min(60, Number(wpm) || 20));
    return Math.round(1200 / safeWpm);
  }

  /** Encode plain text into Morse code */
  function textToMorse(text = "") {
    if (typeof text !== "string") return "";
    return text
      .toUpperCase()
      .split("")
      .map(char => MORSE_MAP[char] || "")
      .filter(Boolean)
      .join(" ");
  }

  /** Decode Morse code back into plain text */
  function morseToText(morse = "") {
    if (typeof morse !== "string") return "";
    return morse
      .trim()
      .split(" ")
      .map(token => {
        if (token === "/") return " ";
        return REVERSE_MORSE_MAP[token] || "";
      })
      .join("");
  }

  /** Build audio timing sequence for Morse string */
  function generateAudioSequence(morseStr, wpm = 20, frequency = 600) {
    const ditMs = getDitDurationMs(wpm);
    const dahMs = ditMs * 3;
    const symbolPauseMs = ditMs;
    const letterPauseMs = ditMs * 3;
    const wordPauseMs = ditMs * 7;

    const sequence = [];
    const tokens = morseStr.split(" ");

    tokens.forEach((token, tIdx) => {
      if (token === "/") {
        sequence.push({ type: "pause", durationMs: wordPauseMs });
        return;
      }

      for (let i = 0; i < token.length; i++) {
        const symbol = token[i];
        const duration = symbol === "." ? ditMs : dahMs;
        sequence.push({ type: "tone", durationMs: duration, frequency });

        if (i < token.length - 1) {
          sequence.push({ type: "pause", durationMs: symbolPauseMs });
        }
      }

      if (tIdx < tokens.length - 1 && tokens[tIdx + 1] !== "/") {
        sequence.push({ type: "pause", durationMs: letterPauseMs });
      }
    });

    return sequence;
  }

  return {
    MORSE_MAP,
    REVERSE_MORSE_MAP,
    getDitDurationMs,
    textToMorse,
    morseToText,
    generateAudioSequence,
  };
});
