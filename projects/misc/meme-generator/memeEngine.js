// --- MEME CANVAS RENDERING & TEXT ENGINE ---
function wrapText(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.toUpperCase().split(" ");
  const lines = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

function getDefaultMemeOptions() {
  return {
    topText: "WHEN THE BUILD PASSES",
    bottomText: "FIRST TRY WITHOUT BUGS",
    fontSize: 36,
    textColor: "#FFFFFF",
    strokeColor: "#000000",
    strokeWidth: 4,
    fontFamily: "Impact, sans-serif",
  };
}

function renderMemeCanvas(canvas, imgElement, options = {}) {
  if (!canvas || !imgElement) return;
  const ctx = canvas.getContext("2d");
  const opts = { ...getDefaultMemeOptions(), ...options };

  canvas.width = imgElement.naturalWidth || imgElement.width || 600;
  canvas.height = imgElement.naturalHeight || imgElement.height || 400;

  // Draw background image
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

  // Text styling setup
  ctx.fillStyle = opts.textColor;
  ctx.strokeStyle = opts.strokeColor;
  ctx.lineWidth = opts.strokeWidth;
  ctx.textAlign = "center";
  ctx.font = `${opts.fontSize}px ${opts.fontFamily}`;

  const padding = 20;
  const maxWidth = canvas.width - padding * 2;
  const lineHeight = opts.fontSize * 1.2;

  // Render Top Text
  if (opts.topText) {
    ctx.textBaseline = "top";
    const topLines = wrapText(ctx, opts.topText, maxWidth);
    topLines.forEach((line, index) => {
      const y = padding + index * lineHeight;
      ctx.strokeText(line, canvas.width / 2, y);
      ctx.fillText(line, canvas.width / 2, y);
    });
  }

  // Render Bottom Text
  if (opts.bottomText) {
    ctx.textBaseline = "bottom";
    const bottomLines = wrapText(ctx, opts.bottomText, maxWidth);
    const totalHeight = bottomLines.length * lineHeight;
    bottomLines.forEach((line, index) => {
      const y =
        canvas.height - padding - (bottomLines.length - 1 - index) * lineHeight;
      ctx.strokeText(line, canvas.width / 2, y);
      ctx.fillText(line, canvas.width / 2, y);
    });
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    wrapText,
    getDefaultMemeOptions,
    renderMemeCanvas,
  };
}
