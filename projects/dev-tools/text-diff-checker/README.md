# Text Difference Checker

A lightweight, dependency-free tool to compare two blocks of text and highlight
additions, removals, and modifications - side by side.

Built for issue #138: https://github.com/Facelessism/cradle/issues/138

## Features

- Side-by-side comparison view (original vs modified)
- Line mode - highlights whole lines added or removed
- Word mode - additionally highlights word-level changes within modified lines
- Live stats: additions, removals, modified lines
- Swap and clear controls
- Keyboard shortcut: Ctrl/Cmd + Enter to compare

## How it works

The diff engine uses a classic LCS (Longest Common Subsequence) algorithm:

1. The two texts are split into lines and diffed with diffArrays.
2. Contiguous runs of removed/added lines are detected as "change blocks."
3. In Word mode, paired removed/added lines within a change block are
   treated as a single modified line and re-diffed at the word level for
   inline highlighting.
4. In Line mode, changes are shown as whole-line additions/removals only.

No external libraries are used - pure HTML/CSS/JavaScript.

## Usage

Open index.html directly in a browser, or serve the repo locally:

python -m http.server 8000

Then visit http://localhost:8000/projects/devtools/text-diff-checker/

- Paste your original text on the left, modified text on the right.
- Choose Line Mode or Word Mode.
- Click Compare (or press Ctrl/Cmd + Enter).
