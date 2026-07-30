const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isExternal,
  sanitizePath,
  getDiskProjects,
  parseHtmlAssetLinks,
  validateMiniProjects,
} = require("../scripts/validate-mini-projects");

test("isExternal correctly identifies external URLs and protocols", () => {
  assert.equal(isExternal("https://cdn.jsdelivr.net/script.js"), true);
  assert.equal(isExternal("http://example.com/style.css"), true);
  assert.equal(isExternal("//unpkg.com/library.js"), true);
  assert.equal(isExternal("mailto:user@example.com"), true);
  assert.equal(isExternal("javascript:void(0)"), true);
  assert.equal(isExternal("data:image/png;base64,123"), true);
  assert.equal(isExternal("#section"), true);
  assert.equal(isExternal("script.js"), false);
  assert.equal(isExternal("../style.css"), false);
  assert.equal(isExternal("/src/components/ui/Button.js"), false);
});

test("sanitizePath strips hash fragments and query strings", () => {
  assert.equal(sanitizePath("style.css?v=1.2.3#main"), "style.css");
  assert.equal(sanitizePath("images/photo.png?raw=true"), "images/photo.png");
  assert.equal(sanitizePath("script.js#L10-L20"), "script.js");
  assert.equal(sanitizePath("hello%20world.js"), "hello world.js");
});

test("parseHtmlAssetLinks extracts src and href attributes from HTML content", () => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="style.css" />
        <script src="script.js"></script>
      </head>
      <body>
        <img src="icon.png" alt="Icon" />
        <a href="https://example.com">External</a>
      </body>
    </html>
  `;
  const links = parseHtmlAssetLinks(html);
  assert.deepEqual(links, [
    "style.css",
    "script.js",
    "icon.png",
    "https://example.com",
  ]);
});

test("getDiskProjects discovers all category subdirectories under projects/", () => {
  const diskProjects = getDiskProjects();
  assert.ok(Array.isArray(diskProjects) && diskProjects.length > 0);
  assert.ok(
    diskProjects.some(p => p.name === "2048-game" && p.category === "games")
  );
});

test("validateMiniProjects verifies all mini projects open without load failures or missing pages", () => {
  const issues = validateMiniProjects();
  assert.deepEqual(
    issues,
    [],
    `Expected 0 mini project load issues, but found ${issues.length}:\n` +
      issues.map(i => `  [${i.type}] ${i.message}`).join("\n")
  );
});
