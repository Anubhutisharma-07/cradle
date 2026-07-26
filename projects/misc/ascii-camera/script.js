(function () {
  "use strict";

  const ramps = {
    soft: " .:-=+*#%@",
    classic: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    bold: " .oO0#@",
    binary: " 01"
  };

  const sampleArt = [
    "      ####      ",
    "   ##      ##   ",
    "  #  ASCII   #  ",
    " #   CAMERA   # ",
    "  #          #  ",
    "   ##      ##   ",
    "      ####      "
  ].join("\n");

  const els = {
    video: document.getElementById("cameraVideo"),
    sourceCanvas: document.getElementById("sourceCanvas"),
    analysisCanvas: document.getElementById("analysisCanvas"),
    asciiOutput: document.getElementById("asciiOutput"),
    cameraBtn: document.getElementById("cameraBtn"),
    stopCameraBtn: document.getElementById("stopCameraBtn"),
    imageUpload: document.getElementById("imageUpload"),
    densitySelect: document.getElementById("densitySelect"),
    columnRange: document.getElementById("columnRange"),
    columnValue: document.getElementById("columnValue"),
    contrastRange: document.getElementById("contrastRange"),
    contrastValue: document.getElementById("contrastValue"),
    brightnessRange: document.getElementById("brightnessRange"),
    brightnessValue: document.getElementById("brightnessValue"),
    fpsRange: document.getElementById("fpsRange"),
    fpsValue: document.getElementById("fpsValue"),
    invertToggle: document.getElementById("invertToggle"),
    colorToggle: document.getElementById("colorToggle"),
    ditherToggle: document.getElementById("ditherToggle"),
    copyBtn: document.getElementById("copyBtn"),
    downloadTxtBtn: document.getElementById("downloadTxtBtn"),
    downloadPngBtn: document.getElementById("downloadPngBtn"),
    sampleBtn: document.getElementById("sampleBtn"),
    sourceStatus: document.getElementById("sourceStatus"),
    frameMeta: document.getElementById("frameMeta"),
    exportMeta: document.getElementById("exportMeta"),
    sourceHelp: document.getElementById("sourceHelp"),
    renderStats: document.getElementById("renderStats"),
    emptyPreview: document.getElementById("emptyPreview")
  };

  const sourceCtx = els.sourceCanvas.getContext("2d", { willReadFrequently: true });
  const analysisCtx = els.analysisCanvas.getContext("2d", { willReadFrequently: true });

  const state = {
    stream: null,
    mode: "empty",
    sourceImage: null,
    animationId: null,
    lastFrameAt: 0,
    asciiText: "",
    rows: [],
    sourceName: "",
    objectUrl: ""
  };

  function numberValue(el) {
    return Number(el.value);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function updateControlLabels() {
    els.columnValue.textContent = els.columnRange.value;
    els.contrastValue.textContent = `${els.contrastRange.value}%`;
    els.brightnessValue.textContent = els.brightnessRange.value;
    els.fpsValue.textContent = els.fpsRange.value;
    els.frameMeta.textContent = `${els.columnRange.value} cols`;
  }

  function setStatus(source, detail, help) {
    els.sourceStatus.textContent = source;
    els.exportMeta.textContent = detail;
    els.sourceHelp.textContent = help;
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(function () {
      toast.remove();
    }, 2600);
  }

  function stopCamera() {
    if (state.stream) {
      state.stream.getTracks().forEach(function (track) {
        track.stop();
      });
    }

    state.stream = null;
    els.video.srcObject = null;
    els.cameraBtn.disabled = false;
    els.stopCameraBtn.disabled = true;

    if (state.mode === "camera") {
      state.mode = state.sourceImage ? "image" : "empty";
    }
  }

  function clearObjectUrl() {
    if (state.objectUrl) {
      URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = "";
    }
  }

  function fitCanvasToSource(width, height) {
    const maxWidth = 720;
    const maxHeight = 520;
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    els.sourceCanvas.width = Math.round(width * scale);
    els.sourceCanvas.height = Math.round(height * scale);
  }

  function drawSourceToPreview(source, width, height) {
    fitCanvasToSource(width, height);
    sourceCtx.clearRect(0, 0, els.sourceCanvas.width, els.sourceCanvas.height);
    sourceCtx.drawImage(source, 0, 0, els.sourceCanvas.width, els.sourceCanvas.height);
    els.sourceCanvas.style.display = "block";
    els.emptyPreview.style.display = "none";
  }

  function configureAnalysisCanvas(sourceWidth, sourceHeight) {
    const cols = numberValue(els.columnRange);
    const rows = Math.max(8, Math.round((sourceHeight / sourceWidth) * cols * 0.48));
    els.analysisCanvas.width = cols;
    els.analysisCanvas.height = rows;
    return { cols, rows };
  }

  function adjustedLuma(r, g, b) {
    const brightness = numberValue(els.brightnessRange);
    const contrast = numberValue(els.contrastRange) / 100;
    let luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    luma = (luma - 128) * contrast + 128 + brightness;
    return clamp(luma, 0, 255);
  }

  function ditherOffset(x, y) {
    const matrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5]
    ];
    return (matrix[y % 4][x % 4] / 16 - 0.5) * 42;
  }

  function sourceDimensions() {
    if (state.mode === "camera") {
      return {
        source: els.video,
        width: els.video.videoWidth,
        height: els.video.videoHeight
      };
    }

    if (state.sourceImage) {
      return {
        source: state.sourceImage,
        width: state.sourceImage.naturalWidth,
        height: state.sourceImage.naturalHeight
      };
    }

    return null;
  }

  function renderAscii() {
    const dimensions = sourceDimensions();
    if (!dimensions || !dimensions.width || !dimensions.height) {
      els.asciiOutput.textContent = state.asciiText || "";
      return;
    }

    const { source, width, height } = dimensions;
    const { cols, rows } = configureAnalysisCanvas(width, height);
    drawSourceToPreview(source, width, height);
    analysisCtx.drawImage(source, 0, 0, cols, rows);

    const pixels = analysisCtx.getImageData(0, 0, cols, rows).data;
    const ramp = ramps[els.densitySelect.value] || ramps.classic;
    const shouldInvert = els.invertToggle.checked;
    const shouldColor = els.colorToggle.checked;
    const shouldDither = els.ditherToggle.checked;

    const textRows = [];
    const htmlRows = [];
    const rowData = [];

    for (let y = 0; y < rows; y += 1) {
      let textLine = "";
      let htmlLine = "";
      const row = [];

      for (let x = 0; x < cols; x += 1) {
        const i = (y * cols + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        let luma = adjustedLuma(r, g, b);

        if (shouldDither) {
          luma = clamp(luma + ditherOffset(x, y), 0, 255);
        }

        const normalized = shouldInvert ? luma / 255 : 1 - luma / 255;
        const charIndex = clamp(Math.round(normalized * (ramp.length - 1)), 0, ramp.length - 1);
        const char = ramp[charIndex];
        const color = `rgb(${r}, ${g}, ${b})`;

        textLine += char;
        row.push({ char, color });
        htmlLine += shouldColor
          ? `<span style="color:${color}">${escapeHtml(char)}</span>`
          : escapeHtml(char);
      }

      textRows.push(textLine);
      htmlRows.push(htmlLine);
      rowData.push(row);
    }

    state.asciiText = textRows.join("\n");
    state.rows = rowData;
    els.asciiOutput.innerHTML = htmlRows.join("\n");
    els.renderStats.textContent = `${cols} columns x ${rows} rows from ${state.sourceName || state.mode}.`;
    els.exportMeta.textContent = `${state.asciiText.length.toLocaleString()} text characters`;
  }

  function runCameraLoop(timestamp) {
    if (state.mode !== "camera") return;
    const fps = numberValue(els.fpsRange);
    const interval = 1000 / fps;

    if (!state.lastFrameAt || timestamp - state.lastFrameAt >= interval) {
      state.lastFrameAt = timestamp;
      renderAscii();
    }

    state.animationId = window.requestAnimationFrame(runCameraLoop);
  }

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast("Camera access is not supported in this browser.");
      return;
    }

    try {
      stopCamera();
      state.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      els.video.srcObject = state.stream;
      await els.video.play();
      state.mode = "camera";
      state.sourceName = "webcam";
      els.cameraBtn.disabled = true;
      els.stopCameraBtn.disabled = false;
      setStatus("Camera live", "Rendering live frames", "Webcam frames are converted into ASCII in real time.");
      state.animationId = window.requestAnimationFrame(runCameraLoop);
    } catch (error) {
      showToast("Unable to start camera. Check browser permissions and use a local server.");
    }
  }

  function loadImage(file) {
    if (!file) return;
    stopCamera();
    clearObjectUrl();

    const img = new Image();
    state.objectUrl = URL.createObjectURL(file);
    img.onload = function () {
      state.sourceImage = img;
      state.mode = "image";
      state.sourceName = file.name;
      setStatus("Image loaded", file.name, "Uploaded image is ready for ASCII conversion.");
      renderAscii();
    };
    img.onerror = function () {
      showToast("The selected image could not be loaded.");
      clearObjectUrl();
    };
    img.src = state.objectUrl;
  }

  function loadSample() {
    stopCamera();
    clearObjectUrl();
    state.sourceImage = null;
    state.mode = "sample";
    state.sourceName = "sample";
    state.asciiText = sampleArt;
    state.rows = sampleArt.split("\n").map(function (line) {
      return line.split("").map(function (char) {
        return { char, color: "#38bdf8" };
      });
    });
    els.asciiOutput.textContent = sampleArt;
    els.sourceCanvas.style.display = "none";
    els.emptyPreview.style.display = "grid";
    setStatus("Sample loaded", "Static ASCII sample", "Use this sample to test copy and export actions.");
    els.renderStats.textContent = "Sample ASCII art loaded.";
  }

  function requireAscii() {
    if (!state.asciiText.trim()) {
      showToast("Render or load ASCII art before exporting.");
      return false;
    }
    return true;
  }

  async function copyText() {
    if (!requireAscii()) return;

    try {
      await navigator.clipboard.writeText(state.asciiText);
      showToast("ASCII text copied.");
    } catch (error) {
      showToast("Copy failed in this browser. Download TXT instead.");
    }
  }

  function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function downloadText() {
    if (!requireAscii()) return;
    downloadBlob(new Blob([state.asciiText], { type: "text/plain;charset=utf-8" }), "ascii-camera.txt");
  }

  function downloadPng() {
    if (!requireAscii()) return;

    const lines = state.asciiText.split("\n");
    const fontSize = 12;
    const charWidth = 7.2;
    const lineHeight = 11;
    const padding = 28;
    const width = Math.max(320, Math.ceil(Math.max(...lines.map(function (line) {
      return line.length;
    })) * charWidth + padding * 2));
    const height = Math.max(180, Math.ceil(lines.length * lineHeight + padding * 2));
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = width;
    exportCanvas.height = height;
    const ctx = exportCanvas.getContext("2d");

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${fontSize}px "JetBrains Mono", Consolas, monospace`;
    ctx.textBaseline = "top";

    state.rows.forEach(function (row, y) {
      row.forEach(function (cell, x) {
        ctx.fillStyle = els.colorToggle.checked ? cell.color : "#dbeafe";
        ctx.fillText(cell.char, padding + x * charWidth, padding + y * lineHeight);
      });
    });

    exportCanvas.toBlob(function (blob) {
      if (!blob) {
        showToast("PNG export failed.");
        return;
      }
      downloadBlob(blob, "ascii-camera.png");
    }, "image/png");
  }

  function rerenderCurrentSource() {
    updateControlLabels();
    if (state.mode === "image" || state.mode === "sample") {
      if (state.mode === "sample") {
        loadSample();
      } else {
        renderAscii();
      }
    }
  }

  function bindEvents() {
    els.cameraBtn.addEventListener("click", startCamera);
    els.stopCameraBtn.addEventListener("click", function () {
      stopCamera();
      setStatus("Camera stopped", "Paused", "Start the camera or upload an image to continue.");
    });
    els.imageUpload.addEventListener("change", function (event) {
      loadImage(event.target.files[0]);
    });
    els.sampleBtn.addEventListener("click", loadSample);
    els.copyBtn.addEventListener("click", copyText);
    els.downloadTxtBtn.addEventListener("click", downloadText);
    els.downloadPngBtn.addEventListener("click", downloadPng);

    [
      els.densitySelect,
      els.columnRange,
      els.contrastRange,
      els.brightnessRange,
      els.fpsRange,
      els.invertToggle,
      els.colorToggle,
      els.ditherToggle
    ].forEach(function (control) {
      control.addEventListener("input", rerenderCurrentSource);
      control.addEventListener("change", rerenderCurrentSource);
    });

    window.addEventListener("beforeunload", function () {
      stopCamera();
      clearObjectUrl();
    });
  }

  function init() {
    updateControlLabels();
    els.sourceCanvas.style.display = "none";
    setStatus("Upload mode", "Ready to render", "Upload an image or start the camera to render ASCII.");
    bindEvents();
  }

  init();
})();
