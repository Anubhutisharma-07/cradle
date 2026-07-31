const fs = require("fs");
const path = require("path");

const PROJECTS_DIR = path.join(__dirname, "..", "projects");
const REQUIRED_FILE = "ARCHITECTURE.md";

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
    return;
  }

  console.log(
    `Validated ${projectDirectories.length} mini project architecture document(s).`
  );
}

if (require.main === module) {
  validateArchitectureDocs();
}

module.exports = {
  findMissingArchitectureDocs,
  formatRelativePaths,
  getProjectDirectories,
  validateArchitectureDocs,
};
