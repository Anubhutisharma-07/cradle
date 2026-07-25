# ASCII Camera

ASCII Camera converts a webcam feed or uploaded image into ASCII art directly in the browser. It includes density controls, brightness and contrast tuning, optional colorized ASCII, dithering, and export options for both text and PNG output.

## Features

- Live webcam-to-ASCII rendering with adjustable FPS.
- Uploaded image support for still-frame conversion.
- Character density presets: Soft, Classic, Bold, and Binary.
- Column count, contrast, brightness, invert, color, and dither controls.
- Source preview beside the ASCII output.
- Copy ASCII text to the clipboard.
- Download ASCII output as `.txt`.
- Export ASCII output as a PNG image.
- No external runtime dependencies.

## How to Run

Open `index.html` directly in a browser for uploaded images and export testing.

For webcam access, run the repository through a local server because most browsers require a secure context or localhost for camera permissions:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/projects/misc/ascii-camera/
```

## Manual Testing

1. Open the project page.
2. Click `Upload Image`, choose an image, and confirm ASCII output appears.
3. Move the `Columns`, `Contrast`, and `Brightness` sliders and confirm the output updates.
4. Switch density presets and toggle `Invert`, `Color ASCII`, and `Dither`.
5. Use `Copy Text`, `Download TXT`, and `Export PNG`.
6. Start the camera on localhost, allow permission, confirm live rendering, then stop the camera.

## Dependencies

The project uses HTML, CSS, vanilla JavaScript, browser canvas APIs, and `getUserMedia`. It does not add any packages.
