const test = require("node:test");
const assert = require("node:assert/strict");
const {
  wrapText,
  getDefaultMemeOptions,
} = require("../projects/misc/meme-generator/memeEngine");
const {
  getSavedMemes,
  saveMemePreset,
  deleteMemePreset,
} = require("../projects/misc/meme-generator/memeStorage");
const { setupLocalStorageMock } = require("./helpers/localstorage-mock");

setupLocalStorageMock();

test("getDefaultMemeOptions provides valid default values", () => {
  const opts = getDefaultMemeOptions();
  assert.equal(opts.fontSize, 36);
  assert.equal(opts.textColor, "#FFFFFF");
  assert.equal(opts.strokeColor, "#000000");
  assert.ok(opts.topText.length > 0);
});

test("wrapText correctly splits long text into line array", () => {
  const mockCtx = {
    measureText: text => ({ width: text.length * 10 }),
  };

  const lines = wrapText(
    mockCtx,
    "THIS IS A VERY LONG MEME CAPTION THAT WRAPS",
    150
  );
  assert.ok(lines.length > 1);
  assert.equal(lines[0], "THIS IS A VERY");
});

test("memeStorage manages presets in localStorage", () => {
  localStorage.clear();
  assert.equal(getSavedMemes().length, 0);

  saveMemePreset({
    topText: "HELLO",
    bottomText: "WORLD",
    fontSize: 32,
    textColor: "#FFFFFF",
    strokeColor: "#000000",
  });

  const saved = getSavedMemes();
  assert.equal(saved.length, 1);
  assert.equal(saved[0].topText, "HELLO");

  deleteMemePreset(saved[0].id);
  assert.equal(getSavedMemes().length, 0);
});
