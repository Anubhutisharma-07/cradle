const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const PROJECTS_DIR = path.join(REPO_ROOT, "projects");

const ASSET_EXTENSIONS = new Set([
  ".css",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".mp3",
  ".mp4",
  ".png",
  ".svg",
  ".wav",
  ".webm",
  ".webp",
]);

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".svg",
  ".txt",
]);

const IMPLICIT_PROJECT_FILES = new Set([
  "index.html",
  "script.js",
  "style.css",
  "thumbnail.svg",
]);

function toPosixPath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function getProjectDirectories(projectsDir = PROJECTS_DIR) {
  if (!fs.existsSync(projectsDir)) return [];

  const projectDirectories = [];
  const categories = fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory());

  for (const category of categories) {
    const categoryPath = path.join(projectsDir, category.name);
    const projects = fs
      .readdirSync(categoryPath, { withFileTypes: true })
      .filter(entry => entry.isDirectory());

    for (const project of projects) {
      projectDirectories.push(path.join(categoryPath, project.name));
    }
  }

  return projectDirectories.sort();
}

function getFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function isAssetFile(filePath) {
  return ASSET_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function normalizeAssetReference(projectDir, filePath) {
  const relativePath = toPosixPath(path.relative(projectDir, filePath));
  const parsedRelativePath = path.posix.parse(relativePath);
  const repoRelativePath = toPosixPath(path.relative(REPO_ROOT, filePath));
  const parsedRepoRelativePath = path.posix.parse(repoRelativePath);

  return {
    fileName: path.basename(filePath),
    relativePath,
    relativePathWithoutExtension: toPosixPath(
      path.posix.join(parsedRelativePath.dir, parsedRelativePath.name)
    ),
    repoRelativePath,
    repoRelativePathWithoutExtension: toPosixPath(
      path.posix.join(parsedRepoRelativePath.dir, parsedRepoRelativePath.name)
    ),
  };
}

function isImplicitlyUsedAsset(projectDir, filePath) {
  const relativePath = toPosixPath(path.relative(projectDir, filePath));
  return IMPLICIT_PROJECT_FILES.has(relativePath);
}

function readTextFiles(files) {
  return files
    .filter(isTextFile)
    .map(filePath => fs.readFileSync(filePath, "utf8"))
    .join("\n");
}

function readProjectText(projectFiles) {
  return readTextFiles(projectFiles);
}

function readRepositoryText(repoRoot = REPO_ROOT) {
  return readTextFiles(getFiles(repoRoot));
}

// `ownText` is the asset's own project text; it defaults to `projectText` for
// backward compatibility. The path-scoped clauses match against `projectText`
// (which may include repo-wide reference text, so cross-project references by
// PATH still count), but the bare-basename clause is matched only against
// `ownText`. Matching a bare filename against the whole repo produced false
// negatives: an orphaned asset named e.g. `logic.js` was deemed "used" merely
// because some other project also has a `logic.js`.
function isReferencedAsset(projectText, reference, ownText = projectText) {
  return (
    projectText.includes(reference.relativePath) ||
    projectText.includes(`./${reference.relativePath}`) ||
    projectText.includes(reference.relativePathWithoutExtension) ||
    projectText.includes(`./${reference.relativePathWithoutExtension}`) ||
    projectText.includes(reference.repoRelativePath) ||
    projectText.includes(`./${reference.repoRelativePath}`) ||
    projectText.includes(reference.repoRelativePathWithoutExtension) ||
    projectText.includes(`./${reference.repoRelativePathWithoutExtension}`) ||
    ownText.includes(reference.fileName)
  );
}

function detectUnusedAssetsInProject(projectDir, referenceText = "") {
  const projectFiles = getFiles(projectDir);
  const ownText = readProjectText(projectFiles);
  const projectText = `${ownText}\n${referenceText}`;

  return projectFiles
    .filter(isAssetFile)
    .filter(filePath => !isImplicitlyUsedAsset(projectDir, filePath))
    .filter(filePath => {
      const reference = normalizeAssetReference(projectDir, filePath);
      return !isReferencedAsset(projectText, reference, ownText);
    });
}

function detectUnusedProjectAssets(
  projectDirs = getProjectDirectories(),
  referenceText = readRepositoryText()
) {
  return projectDirs.flatMap(projectDir =>
    detectUnusedAssetsInProject(projectDir, referenceText).map(filePath => ({
      projectDir,
      filePath,
      relativePath: toPosixPath(path.relative(REPO_ROOT, filePath)),
    }))
  );
}

function main() {
  const unusedAssets = detectUnusedProjectAssets();
  const shouldFail = process.argv.includes("--fail-on-unused");

  if (unusedAssets.length > 0) {
    console.log(`Found ${unusedAssets.length} unused project asset(s):\n`);

    for (const asset of unusedAssets) {
      console.log(`- ${asset.relativePath}`);
    }

    console.log("\nRemove unused assets or reference them from the project.");
    process.exit(shouldFail ? 1 : 0);
  }

  console.log("No unused project assets found.");
}

if (require.main === module) {
  main();
}

module.exports = {
  detectUnusedAssetsInProject,
  detectUnusedProjectAssets,
  getFiles,
  getProjectDirectories,
  isAssetFile,
  isImplicitlyUsedAsset,
  isReferencedAsset,
  normalizeAssetReference,
  readProjectText,
  readRepositoryText,
  readTextFiles,
  toPosixPath,
};
