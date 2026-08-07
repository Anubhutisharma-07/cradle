# CSS Clamp Calculator

CSS Clamp Calculator is a browser-based dev tool for generating responsive
`clamp()` values. It helps developers create fluid CSS for font sizes, spacing,
gaps, widths, and layout tokens.

## Features

- Inputs for minimum viewport, maximum viewport, minimum value, and maximum value
- Generates a copy-ready `clamp()` formula
- Shows the complete CSS rule for a selected property
- Live preview box that applies the generated value
- Presets for font size, padding, gap, and container width
- Explains the calculated preferred value
- Converts min/max values between `px` and `rem`

## Run Locally

From the repository root:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/projects/dev-tools/css-clamp-calculator/
```

## Test

```bash
node --test tests/css-clamp-calculator.test.js
```

The calculation logic lives in `clampCalculator.js`, so formula generation,
unit conversion, and invalid input handling can be tested without opening the
browser.
