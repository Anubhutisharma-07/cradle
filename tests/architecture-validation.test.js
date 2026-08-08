const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  findMissingArchitectureDocs,
  formatRelativePaths,
  getProjectDirectories,
  getRequiredSections,
  hasTemplateNoticeBlock,
  validateArchitectureStructure,
} = require("../scripts/validate-architecture-docs");

// ---------------------------------------------------------------------------
// getProjectDirectories
// ---------------------------------------------------------------------------

test("getProjectDirectories finds mini projects two levels under projects", () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "cradle-architecture-")
  );
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

// ---------------------------------------------------------------------------
// findMissingArchitectureDocs
// ---------------------------------------------------------------------------

test("findMissingArchitectureDocs flags missing and empty architecture files", () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "cradle-architecture-")
  );
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

// ---------------------------------------------------------------------------
// formatRelativePaths
// ---------------------------------------------------------------------------

test("formatRelativePaths emits POSIX-style repo-relative paths", () => {
  const repoRoot = path.resolve(__dirname, "..");
  const paths = [
    path.join(repoRoot, "projects", "math", "graph-theory-explorer"),
  ];

  assert.deepEqual(formatRelativePaths(paths), [
    "projects/math/graph-theory-explorer",
  ]);
});

// ---------------------------------------------------------------------------
// getRequiredSections
// ---------------------------------------------------------------------------

test("getRequiredSections returns all ## headings from the template", () => {
  const sections = getRequiredSections();

  assert.ok(Array.isArray(sections), "should return an array");
  assert.ok(sections.length > 0, "should find at least one section");

  // Spot-check a few headings that must exist in the template
  assert.ok(
    sections.includes("## Overview"),
    'should include "## Overview"'
  );
  assert.ok(
    sections.includes("## Dependencies"),
    'should include "## Dependencies"'
  );
  assert.ok(
    sections.includes("## Future Improvements"),
    'should include "## Future Improvements"'
  );

  // Every entry must start with "## "
  for (const s of sections) {
    assert.match(s, /^## /, `section "${s}" must start with "## "`);
  }
});

test("getRequiredSections reads headings from a custom template file", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cradle-template-"));
  const templatePath = path.join(tmpDir, "ARCHITECTURE_TEMPLATE.md");

  fs.writeFileSync(
    templatePath,
    [
      "# Project Architecture",
      "",
      "## Overview",
      "",
      "<!-- placeholder -->",
      "",
      "## Dependencies",
      "",
      "<!-- placeholder -->",
    ].join("\n")
  );

  const sections = getRequiredSections(templatePath);
  assert.deepEqual(sections, ["## Overview", "## Dependencies"]);
});

test("getRequiredSections throws when the template file does not exist", () => {
  assert.throws(
    () => getRequiredSections("/nonexistent/path/ARCHITECTURE_TEMPLATE.md"),
    /Architecture template not found/
  );
});

// ---------------------------------------------------------------------------
// hasTemplateNoticeBlock
// ---------------------------------------------------------------------------

test("hasTemplateNoticeBlock returns true when the notice block is present", () => {
  const content = [
    "# Project Architecture",
    "",
    "> **This is the standardized ARCHITECTURE.md template for the Cradle repository.**",
    "> Copy this file…",
    "",
    "## Overview",
    "some text",
  ].join("\n");

  assert.equal(hasTemplateNoticeBlock(content), true);
});

test("hasTemplateNoticeBlock returns false when the notice block has been removed", () => {
  const content = [
    "# Project Architecture",
    "",
    "## Overview",
    "Snake Game is a classic arcade game…",
    "",
    "## Dependencies",
    "None.",
  ].join("\n");

  assert.equal(hasTemplateNoticeBlock(content), false);
});

// ---------------------------------------------------------------------------
// validateArchitectureStructure
// ---------------------------------------------------------------------------

test("validateArchitectureStructure passes when all required sections are present", () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "cradle-arch-struct-")
  );
  const projectDir = path.join(root, "good-mini");
  fs.mkdirSync(projectDir, { recursive: true });

  const requiredSections = ["## Overview", "## Dependencies"];
  const content = [
    "# Project Architecture",
    "",
    "## Overview",
    "A great project.",
    "",
    "## Dependencies",
    "None.",
  ].join("\n");

  fs.writeFileSync(path.join(projectDir, "ARCHITECTURE.md"), content);

  const issues = validateArchitectureStructure([projectDir], requiredSections);
  assert.deepEqual(issues, []);
});

test("validateArchitectureStructure reports missing sections", () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "cradle-arch-struct-")
  );
  const projectDir = path.join(root, "incomplete-mini");
  fs.mkdirSync(projectDir, { recursive: true });

  const requiredSections = [
    "## Overview",
    "## Dependencies",
    "## Future Improvements",
  ];
  const content = [
    "# Project Architecture",
    "",
    "## Overview",
    "A great project.",
    // "## Dependencies" is intentionally absent
    // "## Future Improvements" is intentionally absent
  ].join("\n");

  fs.writeFileSync(path.join(projectDir, "ARCHITECTURE.md"), content);

  const issues = validateArchitectureStructure([projectDir], requiredSections);

  assert.equal(issues.length, 1);
  assert.equal(issues[0].projectDir, projectDir);
  assert.deepEqual(issues[0].missingSections, [
    "## Dependencies",
    "## Future Improvements",
  ]);
  assert.equal(issues[0].hasNoticeBlock, false);
});

test("validateArchitectureStructure reports un-removed template notice block", () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "cradle-arch-struct-")
  );
  const projectDir = path.join(root, "notice-mini");
  fs.mkdirSync(projectDir, { recursive: true });

  const requiredSections = ["## Overview"];
  const content = [
    "# Project Architecture",
    "",
    "> **This is the standardized ARCHITECTURE.md template for the Cradle repository.**",
    "",
    "## Overview",
    "Some content.",
  ].join("\n");

  fs.writeFileSync(path.join(projectDir, "ARCHITECTURE.md"), content);

  const issues = validateArchitectureStructure([projectDir], requiredSections);

  assert.equal(issues.length, 1);
  assert.equal(issues[0].hasNoticeBlock, true);
  assert.deepEqual(issues[0].missingSections, []);
});

test("validateArchitectureStructure skips projects without ARCHITECTURE.md", () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "cradle-arch-struct-")
  );
  const projectDir = path.join(root, "no-arch-mini");
  fs.mkdirSync(projectDir, { recursive: true });
  // No ARCHITECTURE.md created — should be silently skipped

  const issues = validateArchitectureStructure([projectDir], ["## Overview"]);
  assert.deepEqual(issues, []);
});

test("validateArchitectureStructure skips empty ARCHITECTURE.md files", () => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "cradle-arch-struct-")
  );
  const projectDir = path.join(root, "empty-mini");
  fs.mkdirSync(projectDir, { recursive: true });
  fs.writeFileSync(path.join(projectDir, "ARCHITECTURE.md"), "   \n");

  const issues = validateArchitectureStructure([projectDir], ["## Overview"]);
  assert.deepEqual(issues, []);
});

// ---------------------------------------------------------------------------
// Integration: validateArchitectureStructure works correctly against real projects
// ---------------------------------------------------------------------------

test("validateArchitectureStructure returns an array when run against real projects", () => {
  const {
    getProjectDirectories: getRealDirs,
    findMissingArchitectureDocs: findMissing,
    validateArchitectureStructure: validate,
    getRequiredSections: getSections,
  } = require("../scripts/validate-architecture-docs");

  const allDirs = getRealDirs();
  const missingDirs = findMissing(allDirs);
  const presentDirs = allDirs.filter(d => !missingDirs.includes(d));
  const requiredSections = getSections();

  const issues = validate(presentDirs, requiredSections);

  // Result must always be an array
  assert.ok(Array.isArray(issues), "validateArchitectureStructure must return an array");

  // Every issue must have the expected shape
  for (const issue of issues) {
    assert.ok(
      typeof issue.projectDir === "string",
      "each issue must have a projectDir string"
    );
    assert.ok(
      Array.isArray(issue.missingSections),
      "each issue must have a missingSections array"
    );
    assert.ok(
      typeof issue.hasNoticeBlock === "boolean",
      "each issue must have a hasNoticeBlock boolean"
    );
    // Every missing section must start with "## "
    for (const section of issue.missingSections) {
      assert.match(section, /^## /, `missing section "${section}" must start with "## "`);
    }
  }
});
