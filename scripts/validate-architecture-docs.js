const fs = require("fs");
const path = require("path");

const PROJECTS_DIR = path.join(__dirname, "..", "projects");
const TEMPLATE_PATH = path.join(__dirname, "..", "ARCHITECTURE_TEMPLATE.md");
const REQUIRED_FILE = "ARCHITECTURE.md";

/**
 * Extract all `## Heading` lines from the template file.
 * Skips the notice / preamble blockquote at the top of ARCHITECTURE_TEMPLATE.md.
 *
 * @param {string} [templatePath]
 * @returns {string[]}  e.g. ["## Overview", "## Purpose & Goals", …]
 */
function getRequiredSections(templatePath = TEMPLATE_PATH) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Architecture template not found: ${templatePath}`);
  }

  const content = fs.readFileSync(templatePath, "utf8");
  const headings = [];

  for (const line of content.split(/\r?\n/)) {
    if (/^## /.test(line)) {
      headings.push(line.trim());
    }
  }

  return headings;
}

function getProjectDirectories(projectsDir = PROJECTS_DIR) {
  if (!fs.existsSync(projectsDir)) {
    throw new Error(`Projects directory not found: ${projectsDir}`);
  }

  const projectDirectories = [];
  const categories = fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  for (const category of categories) {
    const categoryPath = path.join(projectsDir, category.name);
    const minis = fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());

    for (const mini of minis) {
      projectDirectories.push(path.join(categoryPath, mini.name));
    }
  }

  return projectDirectories.sort();
}

function findMissingArchitectureDocs(projectDirectories) {
  return projectDirectories.filter(projectDir => {
    const architecturePath = path.join(projectDir, REQUIRED_FILE);

    if (!fs.existsSync(architecturePath)) {
      return true;
    }

    return fs.readFileSync(architecturePath, "utf8").trim().length === 0;
  });
}

function formatRelativePaths(paths) {
  return paths.map(filePath =>
    path.relative(path.join(__dirname, ".."), filePath).replace(/\\/g, "/")
  );
}

/**
 * Check whether a single ARCHITECTURE.md contains the notice/preamble block
 * that contributors are required to remove before submitting.
 *
 * The notice block is identified by the distinctive first line of the blockquote
 * that appears in ARCHITECTURE_TEMPLATE.md.
 *
 * @param {string} content  File contents
 * @returns {boolean}
 */
function hasTemplateNoticeBlock(content) {
  return content.includes(
    "This is the standardized ARCHITECTURE.md template for the Cradle repository."
  );
}

/**
 * For every project directory that has a non-empty ARCHITECTURE.md, return a
 * list of validation issues describing which required sections are missing and
 * whether the template notice block was not removed.
 *
 * @param {string[]} projectDirectories  Absolute paths to mini-project folders
 * @param {string[]} [requiredSections]  Headings to require (default: parsed from template)
 * @returns {{ projectDir: string; missingSections: string[]; hasNoticeBlock: boolean }[]}
 */
function validateArchitectureStructure(
  projectDirectories,
  requiredSections = getRequiredSections()
) {
  const issues = [];

  for (const projectDir of projectDirectories) {
    const architecturePath = path.join(projectDir, REQUIRED_FILE);

    if (!fs.existsSync(architecturePath)) {
      continue; // already caught by findMissingArchitectureDocs
    }

    const content = fs.readFileSync(architecturePath, "utf8");

    if (content.trim().length === 0) {
      continue; // already caught by findMissingArchitectureDocs
    }

    const presentHeadings = new Set(
      content
        .split(/\r?\n/)
        .filter(line => /^## /.test(line))
        .map(line => line.trim())
    );

    const missingSections = requiredSections.filter(
      heading => !presentHeadings.has(heading)
    );

    const noticeBlock = hasTemplateNoticeBlock(content);

    if (missingSections.length > 0 || noticeBlock) {
      issues.push({ projectDir, missingSections, hasNoticeBlock: noticeBlock });
    }
  }

  return issues;
}

function validateArchitectureDocs() {
  const projectDirectories = getProjectDirectories();
  const missingDocs = findMissingArchitectureDocs(projectDirectories);

  if (missingDocs.length > 0) {
    console.error(
      `Missing or empty ${REQUIRED_FILE} files found in ${missingDocs.length} mini project(s):`
    );

    for (const projectDir of formatRelativePaths(missingDocs)) {
      console.error(`- ${projectDir}/${REQUIRED_FILE}`);
    }

    process.exitCode = 1;
  }

  // Validate structure only for projects that have a non-empty ARCHITECTURE.md
  const presentDocs = projectDirectories.filter(
    d => !missingDocs.includes(d)
  );
  const structureIssues = validateArchitectureStructure(presentDocs);

  if (structureIssues.length > 0) {
    console.error(
      `\nStructure issues found in ${structureIssues.length} ${REQUIRED_FILE} file(s):`
    );

    for (const { projectDir, missingSections, hasNoticeBlock } of structureIssues) {
      const relPath = formatRelativePaths([projectDir])[0];
      console.error(`\n  ${relPath}/${REQUIRED_FILE}`);

      if (hasNoticeBlock) {
        console.error(
          `    ✗ Template notice block was not removed — delete the blockquote at the top of the file before submitting.`
        );
      }

      for (const section of missingSections) {
        console.error(`    ✗ Missing required section: ${section}`);
      }
    }

    process.exitCode = 1;
    return;
  }

  if (!process.exitCode) {
    console.log(
      `Validated ${projectDirectories.length} mini project architecture document(s).`
    );
  }
}

if (require.main === module) {
  validateArchitectureDocs();
}

module.exports = {
  findMissingArchitectureDocs,
  formatRelativePaths,
  getProjectDirectories,
  getRequiredSections,
  hasTemplateNoticeBlock,
  validateArchitectureDocs,
  validateArchitectureStructure,
};
