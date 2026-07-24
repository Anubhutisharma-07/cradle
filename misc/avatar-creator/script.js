// Grab the SVG parts we want to control
const bg = document.getElementById('bg');
const face = document.getElementById('face');
const hair = document.getElementById('hair');

// Grab the color pickers
const bgColorInput = document.getElementById('bg-color');
const skinColorInput = document.getElementById('skin-color');
const hairColorInput = document.getElementById('hair-color');
const hairStyleInput = document.getElementById('hair-style');

// Hair style shapes (SVG path "d" attributes)
const hairStyles = [
  "M40,80 Q100,10 160,80 Z",        // 0: Bowl Cut
  "M40,80 L60,30 L80,70 L100,20 L120,70 L140,30 L160,80 Z", // 1: Spiky
  ""                                  // 2: Bald (empty path = invisible)
];

// Update background color live
bgColorInput.addEventListener('input', (e) => {
  bg.setAttribute('fill', e.target.value);
});

// Update skin tone live
skinColorInput.addEventListener('input', (e) => {
  face.setAttribute('fill', e.target.value);
});

// Update hair color live
hairColorInput.addEventListener('input', (e) => {
  hair.setAttribute('fill', e.target.value);
});

// Update hair style live
hairStyleInput.addEventListener('change', (e) => {
  const styleIndex = parseInt(e.target.value);
  hair.setAttribute('d', hairStyles[styleIndex]);
});

// Randomize everything
const randomizeBtn = document.getElementById('randomize-btn');

function randomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

randomizeBtn.addEventListener('click', () => {
  // Random background
  const newBg = randomColor();
  bg.setAttribute('fill', newBg);
  bgColorInput.value = newBg;

  // Random skin tone
  const newSkin = randomColor();
  face.setAttribute('fill', newSkin);
  skinColorInput.value = newSkin;

  // Random hair color
  const newHairColor = randomColor();
  hair.setAttribute('fill', newHairColor);
  hairColorInput.value = newHairColor;

  // Random hair style
  const newStyleIndex = Math.floor(Math.random() * hairStyles.length);
  hair.setAttribute('d', hairStyles[newStyleIndex]);
  hairStyleInput.value = newStyleIndex;
});

// Download the avatar as a PNG
const downloadBtn = document.getElementById('download-btn');

downloadBtn.addEventListener('click', () => {
  const svg = document.getElementById('avatar-svg');

  // Convert SVG to a string
  const svgData = new XMLSerializer().serializeToString(svg);

  // Create an image from the SVG string
  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    // Draw the image onto a canvas
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    // Trigger download
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'my-avatar.png';
    link.href = pngUrl;
    link.click();
  };

  img.src = url;
});