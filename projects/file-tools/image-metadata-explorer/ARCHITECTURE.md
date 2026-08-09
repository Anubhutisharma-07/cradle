# Image Metadata Explorer Architecture

## Overview

Image Metadata Explorer is a browser-based tool that reads basic metadata stored inside image files.

The application does not upload images to a server. The selected image is read directly by JavaScript in the browser using the File API and `ArrayBuffer`.

The application mainly performs these steps:

1. User selects or drops an image.
2. The image is loaded for preview and its basic file information is collected.
3. The metadata engine reads the raw binary image data.
4. The engine searches for the EXIF section inside JPEG files.
5. The EXIF section is interpreted using the TIFF structure.
6. Individual EXIF tags are identified and converted into readable values.
7. GPS coordinates and other special values are converted into normal formats.
8. Only the metadata needed by the application is kept.
9. The processed metadata is sent to the UI.
10. The user can export the final metadata as JSON.

---

## Project Structure

```text
image-metadata-explorer/
├── ARCHITECTURE.md
├── index.html
├── metadataEngine.js
├── script.js
└── style.css

Your Image
   ↓
<input type="file">
   ↓
JavaScript receives the File
   ↓
file.arrayBuffer()
   ↓
Raw image bytes
   ↓
EXIF parser reads those bytes
   ↓
Metadata is separated into values
