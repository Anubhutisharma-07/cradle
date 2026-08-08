const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  detectUnusedAssetsInProject,
  detectUnusedProjectAssets,
  isAssetFile,
  isImplicitlyUsedAsset,
  isReferencedAsset,
  normalizeAssetReference,
} = require("../scripts/detect-unused-project-assets");

function createProjectFixture(files) {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "cradle-assets-"));

  for (const [fileName, content] of Object.entries(files)) {
    const filePath = path.join(projectDir, fileName);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
  }

  return projectDir;
}

test("isAssetFile identifies tracked project asset extensions", () => {
  assert.equal(isAssetFile("script.js"), true);
  assert.equal(isAssetFile("style.css"), true);
  assert.equal(isAssetFile("thumbnail.svg"), true);
  assert.equal(isAssetFile("photo.webp"), true);
  assert.equal(isAssetFile("README.md"), false);
  assert.equal(isAssetFile("index.html"), false);
});

test("isImplicitlyUsedAsset allows standard project entry assets", () => {
  const projectDir = path.join("projects", "misc", "demo");

  assert.equal(
    isImplicitlyUsedAsset(projectDir, path.join(projectDir, "script.js")),
    true
  );
  assert.equal(
    isImplicitlyUsedAsset(projectDir, path.join(projectDir, "style.css")),
    true
  );
  assert.equal(
    isImplicitlyUsedAsset(projectDir, path.join(projectDir, "thumbnail.svg")),
    true
  );
  assert.equal(
    isImplicitlyUsedAsset(projectDir, path.join(projectDir, "extra.js")),
    false
  );
});

test("normalizeAssetReference returns basename and project-relative path", () => {
  const projectDir = path.join(process.cwd(), "projects", "games", "demo");
  const asset = path.join(projectDir, "assets", "logo.png");

  assert.deepEqual(normalizeAssetReference(projectDir, asset), {
    fileName: "logo.png",
    relativePath: "assets/logo.png",
    relativePathWithoutExtension: "assets/logo",
    repoRelativePath: "projects/games/demo/assets/logo.png",
    repoRelativePathWithoutExtension: "projects/games/demo/assets/logo",
  });
});

test("isReferencedAsset matches relative paths and file names", () => {
  assert.equal(
    isReferencedAsset('<img src="assets/logo.png" />', {
      fileName: "logo.png",
      relativePath: "assets/logo.png",
      relativePathWithoutExtension: "assets/logo",
      repoRelativePath: "projects/games/demo/assets/logo.png",
      repoRelativePathWithoutExtension: "projects/games/demo/assets/logo",
    }),
    true
  );
  assert.equal(
    isReferencedAsset("const fallback = 'logo.png';", {
      fileName: "logo.png",
      relativePath: "assets/logo.png",
      relativePathWithoutExtension: "assets/logo",
      repoRelativePath: "projects/games/demo/assets/logo.png",
      repoRelativePathWithoutExtension: "projects/games/demo/assets/logo",
    }),
    true
  );
  assert.equal(
    isReferencedAsset("require('../projects/games/demo/helpers/gameLogic')", {
      fileName: "gameLogic.js",
      relativePath: "helpers/gameLogic.js",
      relativePathWithoutExtension: "helpers/gameLogic",
      repoRelativePath: "projects/games/demo/helpers/gameLogic.js",
      repoRelativePathWithoutExtension: "projects/games/demo/helpers/gameLogic",
    }),
    true
  );
  assert.equal(
    isReferencedAsset("<main>No assets here</main>", {
      fileName: "logo.png",
      relativePath: "assets/logo.png",
      relativePathWithoutExtension: "assets/logo",
      repoRelativePath: "projects/games/demo/assets/logo.png",
      repoRelativePathWithoutExtension: "projects/games/demo/assets/logo",
    }),
    false
  );
});

test("detectUnusedAssetsInProject reports assets that are not referenced", () => {
  const projectDir = createProjectFixture({
    "index.html":
      '<link rel="stylesheet" href="style.css"><script src="script.js"></script><img src="assets/used.png">',
    "script.js": "console.log('demo');",
    "style.css": "body { color: black; }",
    "thumbnail.svg": "<svg></svg>",
    "assets/used.png": "used",
    "assets/unused.png": "unused",
    "helpers/unused-helper.js": "export const unused = true;",
  });

  const unusedAssets = detectUnusedAssetsInProject(projectDir).map(filePath =>
    path.relative(projectDir, filePath).replace(/\\/g, "/")
  );

  assert.deepEqual(unusedAssets, [
    "assets/unused.png",
    "helpers/unused-helper.js",
  ]);
});

test("detectUnusedProjectAssets treats repo-level references as usage", () => {
  const projectDir = createProjectFixture({
    "index.html": '<script src="script.js"></script>',
    "script.js": "console.log('demo');",
    "style.css": "",
    "helpers/tested-helper.js": "module.exports = {};",
  });

  const unusedAssets = detectUnusedProjectAssets(
    [projectDir],
    "require('./helpers/tested-helper')"
  );

  assert.deepEqual(unusedAssets, []);
});
