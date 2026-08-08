const fs = require("fs");
const path = require("path");

const PROJECTS_DIR = path.join(__dirname, "..", "projects");
const OUTPUT_FILE = path.join(
  __dirname,
  "..",
  "data",
  "projects.json"
);

function titleCase(str) {
  let title = str
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());

  const acronyms = {
    "Ai": "AI",
    "Cpu": "CPU"
  };

  return title.replace(/\b(Ai|Cpu)\b/g, match => acronyms[match]);
}

function generateProjects() {
  const projects = [];
  const errors = [];

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`❌ Error: Projects directory not found at ${PROJECTS_DIR}`);
    process.exit(1);
  }

  const categories = fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());

  const seenPaths = new Set();
  const seenTitles = new Set();

  for (const category of categories) {
    const categoryName = category.name;
    const categoryPath = path.join(PROJECTS_DIR, categoryName);

    const projectFolders = fs
      .readdirSync(categoryPath, {
        withFileTypes: true
      })
      .filter(dirent => dirent.isDirectory());

    for (const project of projectFolders) {
      const projectName = project.name;
      const title = titleCase(projectName);
      const projectPathStr = `projects/${categoryName}/${projectName}/`;
      const fullProjectPath = path.join(__dirname, "..", projectPathStr);

      // Validation checks
      if (!title || title.trim() === "") {
        errors.push(`Project in category '${categoryName}' has a missing or empty title.`);
      }
      if (!categoryName || categoryName.trim() === "") {
        errors.push(`Project '${projectName}' has a missing or empty category.`);
      }
      if (!fs.existsSync(fullProjectPath)) {
        errors.push(`Project path does not exist on disk: ${projectPathStr}`);
      }
      if (seenPaths.has(projectPathStr)) {
        errors.push(`Duplicate project path detected: ${projectPathStr}`);
      } else {
        seenPaths.add(projectPathStr);
      }
      if (seenTitles.has(title)) {
        errors.push(`Duplicate project title detected: '${title}'`);
      } else {
        seenTitles.add(title);
      }

      projects.push({
        title: title,
        category: categoryName,
        path: projectPathStr
      });
    }
  }

  // Report validation errors and fail build if any exist
  if (errors.length > 0) {
    console.error("❌ Project Metadata Validation Failed:");
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  projects.sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(projects, null, 2)
  );

  console.log(
    `✅ Generated and validated ${projects.length} projects successfully → data/projects.json`
  );
}

generateProjects();
