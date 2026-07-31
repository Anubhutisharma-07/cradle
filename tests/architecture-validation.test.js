const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  findMissingArchitectureDocs,
  formatRelativePaths,
  getProjectDirectories,
} = require("../scripts/validate-architecture-docs");

function createTempProjects() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "cradle-architecture-"));
}

test("getProjectDirectories finds mini projects two levels under projects", () => {
  const root = createTempProjects();
  const alpha = path.join(root, "games", "alpha-game");
  const beta = path.join(root, "math", "beta-tool");

  fs.mkdirSync(alpha, { recursive: true });
  fs.mkdirSync(beta, { recursive: true });
  fs.writeFileSync(path.join(root, "README.md"), "not a category");

  const projects = getProjectDirectories(root).map(projectDir =>
    path.relative(root, projectDir).replace(/\\/g, "/")
  );

  assert.deepEqual(projects, ["games/alpha-game", "math/beta-tool"]);
});

test("findMissingArchitectureDocs flags missing and empty architecture files", () => {
  const root = createTempProjects();
  const valid = path.join(root, "valid-mini");
  const missing = path.join(root, "missing-mini");
  const empty = path.join(root, "empty-mini");

  fs.mkdirSync(valid, { recursive: true });
  fs.mkdirSync(missing, { recursive: true });
  fs.mkdirSync(empty, { recursive: true });
  fs.writeFileSync(path.join(valid, "ARCHITECTURE.md"), "# Architecture\n");
  fs.writeFileSync(path.join(empty, "ARCHITECTURE.md"), "   \n");

  const missingDocs = findMissingArchitectureDocs([valid, missing, empty]).map(
    projectDir => path.basename(projectDir)
  );

  assert.deepEqual(missingDocs, ["missing-mini", "empty-mini"]);
});

test("formatRelativePaths emits POSIX-style repo-relative paths", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const paths = [
    path.join(repoRoot, "projects", "math", "graph-theory-explorer"),
  ];

  assert.deepEqual(formatRelativePaths(paths), [
    "projects/math/graph-theory-explorer",
  ]);
});
