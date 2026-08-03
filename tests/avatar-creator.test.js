const test = require("node:test");
const assert = require("node:assert/strict");
const AvatarEngine = require("../projects/misc/avatar-creator/avatarEngine");

test("AvatarEngine constants grid properties are correct", () => {
  assert.equal(AvatarEngine.GRID_SIZE, 16);
  assert.equal(AvatarEngine.CANVAS_SIZE, 200);
  assert.equal(AvatarEngine.PIXEL_SIZE, 12.5);
});

test("AvatarEngine generateAvatarSVG outputs valid SVG string", () => {
  const svg = AvatarEngine.generateAvatarSVG({
    bgColor: "#ffffff",
    skinColor: "#ffdbac",
    hairColor: "#000000",
    hairStyle: 0,
  });

  assert.ok(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(svg.includes('fill="#ffffff"'));
  assert.ok(svg.includes('fill="#ffdbac"'));
  assert.ok(svg.includes('fill="#000000"'));
});

test("AvatarEngine generateRandomOptions returns valid option structure", () => {
  const opts = AvatarEngine.generateRandomOptions();
  assert.ok(opts.bgColor.startsWith("#"));
  assert.ok(opts.skinColor.startsWith("#"));
  assert.ok(opts.hairColor.startsWith("#"));
  assert.ok(opts.hairStyle >= 0);
});
