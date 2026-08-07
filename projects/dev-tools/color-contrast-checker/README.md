# Color Contrast Checker

Color Contrast Checker is a browser-based dev tool for testing foreground and
background color pairs against WCAG contrast guidance. It validates hex inputs,
calculates the contrast ratio instantly, and shows AA/AAA pass or fail states
for normal text, large text, and interface components.

## Features

- Foreground and background color pickers with editable hex fields
- 3 and 6 digit hex validation
- WCAG contrast ratio calculation
- AA/AAA status cards for normal text, large text, and UI components
- Suggested lighter or darker foreground alternatives when the current pair fails
- Copy button for reusable CSS variables
- Local sample palettes for quick testing

## Run Locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/projects/dev-tools/color-contrast-checker/
```

## Test

```bash
node --test tests/color-contrast-checker.test.js
```

The core contrast logic lives in `contrastEngine.js`, so it can be tested with
Node.js without opening the browser.
