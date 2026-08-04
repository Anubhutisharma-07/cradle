# ASCII Camera Studio 📸

Real-time browser-based webcam & image ASCII art generator featuring customizable character palettes, Sobel edge detection mode, luminance mapping, and multi-format export capabilities.

## Features

- **Live Webcam & Image Processing**: Stream real-time camera feed or upload local image files for ASCII conversion.
- **Multiple Character Palettes**:
  - **Standard**: `.:-=+*#%@`
  - **Detailed**: 70-character high-density ramp.
  - **Blocks**: `░▒▓█`
  - **Binary**: `01`
- **Sobel Edge Detection Mode**: Highlight structural contours and boundaries in ASCII format.
- **Contrast & Brightness Controls**: Fine-tune luminance, invert colors, and adjust character density dynamically.
- **Multi-Format Export**:
  - **Plain Text (.txt)** — Download raw text layout.
  - **HTML Document (.html)** — Export pre-styled HTML page with custom color themes.
  - **Vector SVG (.svg)** — Scalable vector text graphics output.

## How to Run

1. Open `index.html` in any web browser.
2. Grant camera permissions for webcam streaming OR upload an image using the Upload Image button.
3. Use the control panel sliders to adjust contrast, edge detection mode, and character density.
4. Export your ASCII masterpiece in TXT, HTML, or SVG format!

## Architecture

- `asciiEngine.js` — Core image processing (Sobel filters, luminance mapping, palette scaling).
- `asciiExporter.js` — Format serialization (Text, HTML document, SVG vector graphics).
- `script.js` — Webcam stream controller, canvas renderer loop, and UI event handlers.
- `style.css` — Modern UI layout, glassmorphic cards, character picker pills, and responsive viewports.
