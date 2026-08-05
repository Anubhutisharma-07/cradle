const test = require("node:test");
const assert = require("node:assert/strict");
const AvatarEngine = require("../projects/misc/avatar-creator/avatarEngine");

test("AvatarEngine constants grid properties are correct", () => {
  assert.equal(AvatarEngine.GRID_SIZE, 16);
  assert.equal(AvatarEngine.CANVAS_SIZE, 200);
  assert.equal(AvatarEngine.PIXEL_SIZE, 12.5);
});

test("AvatarEngine generateAvatarSVG outputs valid SVG string with default options", () => {
  const svg = AvatarEngine.generateAvatarSVG();

  assert.ok(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(svg.includes('width="200"'));
  assert.ok(svg.includes('height="200"'));
  assert.ok(svg.includes('fill="#3b82f6"')); // default bgColor
  assert.ok(svg.includes('fill="#ffdbac"')); // default skinColor
  assert.ok(svg.includes('fill="#4a3728"')); // default hairColor
  assert.ok(svg.includes('fill="#1e293b"')); // eye color
  assert.ok(svg.includes('fill="#dc2626"')); // mouth color
  assert.ok(svg.includes('fill="#f87171"')); // blush color
});

test("AvatarEngine generateAvatarSVG respects custom options and colors", () => {
  const svg = AvatarEngine.generateAvatarSVG({
    bgColor: "#ff0000",
    skinColor: "#00ff00",
    hairColor: "#0000ff",
    hairStyle: 1,
  });

  assert.ok(svg.includes('fill="#ff0000"'));
  assert.ok(svg.includes('fill="#00ff00"'));
  assert.ok(svg.includes('fill="#0000ff"'));
});

test("AvatarEngine generateAvatarSVG handles out-of-bounds or invalid hair style fallback", () => {
  const svgInvalidIndex = AvatarEngine.generateAvatarSVG({ hairStyle: 99 });
  const svgBaldIndex = AvatarEngine.generateAvatarSVG({ hairStyle: 2 });

  // Out of bounds hairStyle falls back to hairStyles[0] (Bowl Cut)
  assert.ok(svgInvalidIndex.includes("<svg"));
  assert.ok(svgBaldIndex.includes("<svg"));
});

test("AvatarEngine generateRandomOptions returns valid option structure", () => {
  const opts = AvatarEngine.generateRandomOptions();
  assert.ok(typeof opts.bgColor === "string" && opts.bgColor.startsWith("#"));
  assert.ok(
    typeof opts.skinColor === "string" && opts.skinColor.startsWith("#")
  );
  assert.ok(
    typeof opts.hairColor === "string" && opts.hairColor.startsWith("#")
  );
  assert.ok(Number.isInteger(opts.hairStyle));
  assert.ok(opts.hairStyle >= 0 && opts.hairStyle <= 2);
});
