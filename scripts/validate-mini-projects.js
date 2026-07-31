const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const PROJECTS_DIR = path.join(REPO_ROOT, "projects");
const PROJECTS_JSON = path.join(REPO_ROOT, "data", "projects.json");
const REQUIRED_STANDARD_FILES = ["index.html", "script.js", "style.css"];

const EXTERNAL_PREFIXES = [
  "http://",
  "https://",
  "//",
  "mailto:",
  "javascript:",
  "data:",
  "tel:",
  "#",
];

function isExternal(url) {
  if (!url) return true;
  const trimmed = url.trim().toLowerCase();
  return EXTERNAL_PREFIXES.some(prefix => trimmed.startsWith(prefix));
}

function sanitizePath(url) {
  let cleaned = url.split("#")[0].split("?")[0].trim();
  try {
    cleaned = decodeURIComponent(cleaned);
  } catch (e) {
    // Keep un-decoded if URI decode fails
  }
  return cleaned;
}

/**
 * Scans projects directory to discover all mini project folders.
 */
function getDiskProjects() {
  const diskProjects = [];
  if (!fs.existsSync(PROJECTS_DIR)) return diskProjects;

  const categories = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory());

  for (const cat of categories) {
    const catPath = path.join(PROJECTS_DIR, cat.name);
    const projects = fs
      .readdirSync(catPath, { withFileTypes: true })
      .filter(d => d.isDirectory());

    for (const proj of projects) {
      const relPath = `projects/${cat.name}/${proj.name}/`;
      diskProjects.push({
        category: cat.name,
        name: proj.name,
        relPath,
        absPath: path.join(catPath, proj.name),
      });
    }
  }

  return diskProjects;
}

/**
 * Parses internal file references (scripts, stylesheets, images, media, links) from HTML.
 */
function parseHtmlAssetLinks(htmlContent) {
  const links = [];
  const regex = /(?:src|href)=["']([^"']+)["']/gi;
  let match;

  while ((match = regex.exec(htmlContent)) !== null) {
    links.push(match[1]);
  }

  return links;
}

function validateStandardProjectFiles(diskProjects) {
  const issues = [];

  for (const project of diskProjects) {
    for (const fileName of REQUIRED_STANDARD_FILES) {
      const filePath = path.join(project.absPath, fileName);

      if (!fs.existsSync(filePath)) {
        issues.push({
          type: "MISSING_STANDARD_FILE",
          project: project.name,
          message: `Project folder "${project.relPath}" is missing required standard file "${fileName}".`,
        });
      }
    }
  }

  return issues;
}

/**
 * Validates that every mini project opens successfully without missing pages or load failures.
 */
function validateMiniProjects() {
  const issues = [];

  // 1. Validate data/projects.json presence & content
  if (!fs.existsSync(PROJECTS_JSON)) {
    return [{ type: "CONFIG", message: "data/projects.json does not exist." }];
  }

  let projectsJsonData = [];
  try {
    projectsJsonData = JSON.parse(fs.readFileSync(PROJECTS_JSON, "utf-8"));
  } catch (e) {
    return [
      {
        type: "CONFIG",
        message: `data/projects.json contains invalid JSON: ${e.message}`,
      },
    ];
  }

  const registeredPaths = new Set(projectsJsonData.map(p => p.path));

  // 2. Check disk projects against projects.json registry
  const diskProjects = getDiskProjects();
  issues.push(...validateStandardProjectFiles(diskProjects));

  for (const proj of diskProjects) {
    if (!registeredPaths.has(proj.relPath)) {
      issues.push({
        type: "UNINDEXED_PROJECT",
        project: proj.name,
        message: `Project folder "${proj.relPath}" exists on disk but is missing from data/projects.json.`,
      });
    }
  }

  // 3. Validate each registered project entry in projects.json
  for (const project of projectsJsonData) {
    const projRelPath = project.path;
    const projAbsPath = path.join(REPO_ROOT, projRelPath);

    // Check directory existence
    if (
      !fs.existsSync(projAbsPath) ||
      !fs.statSync(projAbsPath).isDirectory()
    ) {
      issues.push({
        type: "MISSING_DIR",
        project: project.title,
        message: `Project directory "${projRelPath}" listed in projects.json does not exist.`,
      });
      continue;
    }

    // Check entry point index.html
    const htmlPath = path.join(projAbsPath, "index.html");
    if (!fs.existsSync(htmlPath)) {
      issues.push({
        type: "MISSING_INDEX",
        project: project.title,
        message: `Entry point "${projRelPath}index.html" is missing.`,
      });
      continue;
    }

    const htmlStat = fs.statSync(htmlPath);
    if (htmlStat.size === 0) {
      issues.push({
        type: "EMPTY_INDEX",
        project: project.title,
        message: `Entry point "${projRelPath}index.html" is an empty 0-byte file.`,
      });
      continue;
    }

    const htmlContent = fs.readFileSync(htmlPath, "utf-8");
    if (!/<(?:html|body|head|doctype)/i.test(htmlContent)) {
      issues.push({
        type: "INVALID_HTML",
        project: project.title,
        message: `Entry point "${projRelPath}index.html" does not contain valid HTML structure.`,
      });
    }

    // 4. Validate internal asset/resource references in index.html
    const assetLinks = parseHtmlAssetLinks(htmlContent);
    for (const rawLink of assetLinks) {
      if (isExternal(rawLink)) continue;

      const cleanLink = sanitizePath(rawLink);
      if (!cleanLink) continue;

      let resolvedPath;
      if (cleanLink.startsWith("/")) {
        resolvedPath = path.join(REPO_ROOT, cleanLink);
      } else {
        resolvedPath = path.resolve(projAbsPath, cleanLink);
      }

      if (!fs.existsSync(resolvedPath)) {
        issues.push({
          type: "BROKEN_ASSET",
          project: project.title,
          message: `In "${projRelPath}index.html": Referenced resource "${rawLink}" could not be found on disk (Resolved: "${path.relative(
            REPO_ROOT,
            resolvedPath
          )}").`,
        });
      }
    }
  }

  return issues;
}

function main() {
  console.log(
    "Validating all mini projects for load accessibility, entry points, and asset integrity..."
  );
  const issues = validateMiniProjects();

  if (issues.length > 0) {
    console.error(
      `\n❌ Found ${issues.length} mini project accessibility or load issue(s):\n`
    );
    issues.forEach(issue => {
      console.error(`  - [${issue.type}] ${issue.message}`);
    });
    console.error(
      "\nPlease resolve all missing pages, broken resource links, or unindexed project issues."
    );
    process.exit(1);
  } else {
    console.log(
      "\n✅ All mini projects opened and validated successfully without page or load failures!"
    );
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  isExternal,
  sanitizePath,
  getDiskProjects,
  parseHtmlAssetLinks,
  validateStandardProjectFiles,
  validateMiniProjects,
};
