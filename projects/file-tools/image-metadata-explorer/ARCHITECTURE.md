# Image Metadata Explorer Architecture

## Overview

Image Metadata Explorer is a browser-based utility for inspecting metadata embedded in image files.

Users can upload an image and view available metadata such as camera information, image dimensions, capture details, and GPS coordinates. Metadata can also be exported as JSON.

The project runs entirely in the browser and does not require a backend.

## Project Structure

```text
image-metadata-explorer/
├── ARCHITECTURE.md
├── index.html
├── metadataEngine.js
├── script.js
└── style.css