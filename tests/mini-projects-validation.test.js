const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  isExternal,
  sanitizePath,
  getDiskProjects,
  parseHtmlAssetLinks,
  validateStandardProjectFiles,
  validateProjectIndexEntries,
  validateProjectNavigation,
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

test("validateStandardProjectFiles reports missing standard mini files", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cradle-mini-files-"));
  const miniPath = path.join(root, "sample-mini");

  fs.mkdirSync(miniPath, { recursive: true });
  fs.writeFileSync(path.join(miniPath, "index.html"), "<!doctype html>");
  fs.writeFileSync(path.join(miniPath, "style.css"), "");

  const issues = validateStandardProjectFiles([
    {
      name: "sample-mini",
      relPath: "projects/test/sample-mini/",
      absPath: miniPath,
    },
  ]);

  assert.equal(issues.length, 1);
  assert.equal(issues[0].type, "MISSING_STANDARD_FILE");
  assert.match(issues[0].message, /script\.js/);
});

test("validateProjectIndexEntries reports mini folders missing from projects.json", () => {
  const diskProjects = [
    {
      category: "games",
      name: "indexed-game",
      relPath: "projects/games/indexed-game/",
      absPath: "/repo/projects/games/indexed-game",
    },
    {
      category: "math",
      name: "missing-tool",
      relPath: "projects/math/missing-tool/",
      absPath: "/repo/projects/math/missing-tool",
    },
  ];

  const projectsJsonData = [
    {
      title: "Indexed Game",
      category: "games",
      path: "projects/games/indexed-game/",
    },
  ];

  const issues = validateProjectIndexEntries(diskProjects, projectsJsonData);

  assert.equal(issues.length, 1);
  assert.equal(issues[0].type, "UNINDEXED_PROJECT");
  assert.equal(issues[0].project, "missing-tool");
  assert.match(issues[0].message, /projects\/math\/missing-tool\//);
});

test("validateProjectIndexEntries passes when every mini folder is indexed", () => {
  const diskProjects = [
    {
      category: "productivity",
      name: "task-tool",
      relPath: "projects/productivity/task-tool/",
      absPath: "/repo/projects/productivity/task-tool",
    },
  ];

  const projectsJsonData = [
    {
      title: "Task Tool",
      category: "productivity",
      path: "projects/productivity/task-tool/",
    },
  ];

  assert.deepEqual(
    validateProjectIndexEntries(diskProjects, projectsJsonData),
    []
  );
});

test("validateProjectNavigation reports mini projects missing shared navigation", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cradle-mini-nav-"));
  const miniWithNav = path.join(root, "with-nav");
  const miniWithoutNav = path.join(root, "without-nav");

  fs.mkdirSync(miniWithNav, { recursive: true });
  fs.mkdirSync(miniWithoutNav, { recursive: true });

  fs.writeFileSync(
    path.join(miniWithNav, "index.html"),
    '<!doctype html><html><body><script src="../../../src/components/ui/BackToHome/BackToHome.js" defer></script></body></html>'
  );
  fs.writeFileSync(
    path.join(miniWithoutNav, "index.html"),
    "<!doctype html><html><body><h1>No Nav</h1></body></html>"
  );

  const diskProjects = [
    {
      name: "with-nav",
      relPath: "projects/test/with-nav/",
      absPath: miniWithNav,
    },
    {
      name: "without-nav",
      relPath: "projects/test/without-nav/",
      absPath: miniWithoutNav,
    },
  ];

  const issues = validateProjectNavigation(diskProjects);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].type, "MISSING_NAVIGATION");
  assert.equal(issues[0].project, "without-nav");
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
