const test = require("node:test");
const assert = require("node:assert");
const engine = require("../projects/misc/ascii-camera/asciiEngine.js");
const exporter = require("../projects/misc/ascii-camera/asciiExporter.js");

test("ASCIIEngine luminance calculations work correctly", () => {
  const lumWhite = engine.getLuminance(255, 255, 255);
  assert.strictEqual(Math.round(lumWhite), 255);

  const lumBlack = engine.getLuminance(0, 0, 0);
  assert.strictEqual(lumBlack, 0);

  const lumRec709 = engine.getLuminance(100, 100, 100, "rec709");
  assert.strictEqual(Math.round(lumRec709), 100);
});

test("ASCIIEngine maps luminance to palette characters", () => {
  const palette = engine.PALETTES.standard;
  const darkChar = engine.mapLuminanceToChar(0, palette, false);
  const brightChar = engine.mapLuminanceToChar(255, palette, false);

  assert.strictEqual(darkChar, palette[0]);
  assert.strictEqual(brightChar, palette[palette.length - 1]);

  const invertedDark = engine.mapLuminanceToChar(0, palette, true);
  assert.strictEqual(invertedDark, palette[palette.length - 1]);
});

test("ASCIIEngine adjusts contrast and brightness", () => {
  const val = 128;
  const brightened = engine.adjustPixel(val, 1.0, 50);
  assert.strictEqual(brightened, 178);

  const clampedHigh = engine.adjustPixel(200, 2.0, 50);
  assert.strictEqual(clampedHigh, 255);
});

test("ASCIIExporter formats Plain Text, HTML, and SVG payloads", () => {
  const lines = ["  ##  ", " #### "];

  const plain = exporter.toPlainText(lines);
  assert.strictEqual(plain, "  ##  \n #### ");

  const html = exporter.toHTML(lines, { title: "Test Export" });
  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("<title>Test Export</title>"));
  assert.ok(html.includes("##"));

  const svg = exporter.toSVG(lines, { fontSize: 12 });
  assert.ok(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert.ok(svg.includes("<text x="));
});
