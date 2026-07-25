const projectsGrid = document.getElementById("projects-grid");
const searchInput = document.getElementById("search");
const categoriesContainer = document.getElementById("categories");
const projectCount = document.getElementById("project-count");
const clearFiltersBtn = document.getElementById("clear-filters");

let allProjects = [];
let selectedCategory = "all";

let filterWorker;
if (window.Worker) {
  filterWorker = new Worker("./scripts/worker.js");
  filterWorker.onmessage = function (e) {
    renderProjects(e.data);
  };
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      "Cradfunction renderProjects(projects)leDB",
      1
    );

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("projectsStore")) {
        db.createObjectStore("projectsStore", {
          keyPath: "id",
        });
      }
    };
  });
}

function getCachedProjects(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["projectsStore"], "readonly");
    const store = transaction.objectStore("projectsStore");
    const request = store.get("projects");

    request.onerror = () => reject(request.error);

    request.onsuccess = () =>
      resolve(request.result ? request.result.data : null);
  });
}

async function fetchAndCacheProjects(db) {
  const response = await fetch("./data/projects.json");

  if (!response.ok) {
    throw new Error("Failed to load projects");
  }

  const data = await response.json();
  allProjects = data;

  if (db) {
    const transaction = db.transaction(["projectsStore"], "readwrite");
    const store = transaction.objectStore("projectsStore");

    store.put({
      id: "projects",
      data: data,
    });
  }

  return data;
}

async function loadProjects() {
  try {
    let db;

    try {
      db = await openDB();

      const cachedProjects = await getCachedProjects(db);

      if (cachedProjects && cachedProjects.length > 0) {
        allProjects = cachedProjects;

        renderCategories();
        renderProjects(allProjects);

        fetchAndCacheProjects(db)
          .then(() => {
            renderCategories();
            applyFilters();
          })
          .catch(console.error);

        return;
      }
    } catch (e) {
      console.warn("IndexedDB error:", e);
    }

    await fetchAndCacheProjects(db);

    renderCategories();
    renderProjects(allProjects);
  } catch (error) {
    console.error(error);
    projectsGrid.innerHTML = "<p>Failed to load projects.</p>";
  }
}

function renderCategories() {
  const categories = [
    "all",
    ...new Set(allProjects.map(project => project.category)),
  ];

  categoriesContainer.innerHTML = "";

  categories.forEach(category => {
    const isActive = category === selectedCategory;
    const btn = CradleButton.create({
      variant: isActive ? "primary" : "ghost",
      size: "sm",
      children: category.toUpperCase().replace("-", " "),
      ariaLabel: `${category.toUpperCase().replace("-", " ")} projects`,
      onClick: () => {
        selectedCategory = category;
        applyFilters();
        renderCategories();
        searchInput.focus();
      },
    });

    btn.setAttribute("aria-pressed", isActive ? "true" : "false");

    categoriesContainer.appendChild(btn);
  });
}

function isNewProject(dateAdded) {
  if (!dateAdded) return false;
  const diffDays = (Date.now() - new Date(dateAdded)) / 86400000;
  return diffDays <= 7;
}

function renderProjects(projects) {
  projectCount.textContent = `${projects.length} projects`;

  if (!projects.length) {
    projectsGrid.innerHTML = "<p>No projects found.</p>";
    return;
  }

  projectsGrid.innerHTML = "";

  projects.forEach(project => {
    const card = CradleCard.create({
      title: project.title,
      subtitle: project.path,
      badge: project.category,
      isNew: isNewProject(project.dateAdded),
      image: `${project.path}thumbnail.svg`,
      footer: CradleButton.create({
        variant: "outline",
        size: "sm",
        children: "Open Project",
        rightIcon: "→",
        href: project.path,
        target: "_self",
        rel: "noopener noreferrer",
      }),
      footerAlign: "left",
    });

    projectsGrid.appendChild(card);
  });
}

function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();

  if (filterWorker) {
    filterWorker.postMessage({
      allProjects,
      selectedCategory,
      query,
    });
  } else {
    const filtered = allProjects.filter(
      project =>
        (selectedCategory === "all" || project.category === selectedCategory) &&
        project.title.toLowerCase().includes(query)
    );

    renderProjects(filtered);
  }

  updateClearButtonVisibility(query);
}

function updateClearButtonVisibility(query) {
  const hasActiveFilters = query !== "" || selectedCategory !== "all";

  if (clearFiltersBtn) {
    clearFiltersBtn.hidden = !hasActiveFilters;
  }
}

function clearFilters() {
  searchInput.value = "";
  selectedCategory = "all";

  applyFilters();
  renderCategories();
  searchInput.focus();
}

searchInput.addEventListener("input", applyFilters);

if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", clearFilters);
}

// Floating Back to Top Button Logic
const backToTopBtn = document.getElementById("back-to-top");

if (backToTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopBtn.hidden = false;
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// Keyboard Shortcuts Modal Toggle
const shortcutsBtn = document.getElementById("shortcuts-btn");
const shortcutsModal = document.getElementById("shortcuts-modal");
const closeShortcutsBtn = document.getElementById("close-shortcuts");
const shortcutsOverlay = document.getElementById("shortcuts-overlay");

function openShortcutsModal() {
  if (shortcutsModal) {
    shortcutsModal.classList.add("visible");
    shortcutsModal.setAttribute("aria-hidden", "false");
  }
}

function closeShortcutsModal() {
  if (shortcutsModal) {
    shortcutsModal.classList.remove("visible");
    shortcutsModal.setAttribute("aria-hidden", "true");
  }
}

if (shortcutsBtn) {
  shortcutsBtn.addEventListener("click", openShortcutsModal);
}
if (closeShortcutsBtn) {
  closeShortcutsBtn.addEventListener("click", closeShortcutsModal);
}
if (shortcutsOverlay) {
  shortcutsOverlay.addEventListener("click", closeShortcutsModal);
}

// Keyboard Shortcuts Listeners
document.addEventListener("keydown", e => {
  const activeEl = document.activeElement;
  const isInputActive =
    activeEl &&
    (activeEl.tagName === "INPUT" ||
      activeEl.tagName === "TEXTAREA" ||
      activeEl.isContentEditable);

  // Focus Search Bar
  if (
    (e.ctrlKey && e.key.toLowerCase() === "k") ||
    (e.key === "/" && !isInputActive)
  ) {
    e.preventDefault();
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }

  // Close Modal or Clear search
  if (e.key === "Escape") {
    if (shortcutsModal && (shortcutsModal.classList.contains("visible") || shortcutsModal.getAttribute("aria-hidden") === "false")) {
      closeShortcutsModal();
    } else {
      clearFilters();
    }
  }

  // Toggle Theme
  if (e.key.toLowerCase() === "t" && !isInputActive) {
    e.preventDefault();
    const themeToggleEl = document.getElementById("themeToggle");
    if (themeToggleEl) {
      themeToggleEl.click();
    } else if (typeof window.toggleTheme === "function") {
      window.toggleTheme();
    } else {
      const isLight =
        document.documentElement.classList.contains("light-theme");
      if (isLight) {
        document.documentElement.classList.remove("light-theme");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.add("light-theme");
        localStorage.setItem("theme", "light");
      }
    }
  }

  // Toggle Shortcuts Panel
  if (e.key === "?" && !isInputActive) {
    e.preventDefault();
    if (shortcutsModal) {
      const isVisible = shortcutsModal.classList.contains("visible") || shortcutsModal.getAttribute("aria-hidden") === "false";
      if (isVisible) {
        closeShortcutsModal();
      } else {
        openShortcutsModal();
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
});

// Keyboard Shortcuts Modal Logic
const shortcutsModal = document.getElementById("shortcuts-modal");
const shortcutsToggleBtn = document.querySelector(
  '[aria-label="Keyboard Shortcuts"]'
);
const closeShortcutsBtn = document.getElementById("close-shortcuts");
const shortcutsOverlay = document.getElementById("shortcuts-overlay");
const themeToggleBtn = document.getElementById("theme-toggle");

function openShortcutsModal() {
  if (shortcutsModal) {
    shortcutsModal.setAttribute("aria-hidden", "false");
  }
}

function closeShortcutsModal() {
  if (shortcutsModal) {
    shortcutsModal.setAttribute("aria-hidden", "true");
  }
}

function toggleShortcutsModal() {
  if (shortcutsModal) {
    const isHidden = shortcutsModal.getAttribute("aria-hidden") === "true";
    if (isHidden) {
      openShortcutsModal();
    } else {
      closeShortcutsModal();
    }
  }
}

if (shortcutsToggleBtn) {
  shortcutsToggleBtn.addEventListener("click", openShortcutsModal);
}

if (closeShortcutsBtn) {
  closeShortcutsBtn.addEventListener("click", closeShortcutsModal);
}

if (shortcutsOverlay) {
  shortcutsOverlay.addEventListener("click", closeShortcutsModal);
}

// Global Keyboard Shortcuts
document.addEventListener("keydown", e => {
  // Esc: Close modal or clear search
  if (e.key === "Escape") {
    if (
      shortcutsModal &&
      shortcutsModal.getAttribute("aria-hidden") === "false"
    ) {
      closeShortcutsModal();
    } else if (document.activeElement === searchInput) {
      clearFilters();
    }
    return;
  }

  // Ignore keyboard shortcuts if focus is inside input elements
  if (
    ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
  ) {
    return;
  }

  if (e.key === "/" || (e.ctrlKey && e.key.toLowerCase() === "k")) {
    e.preventDefault();
    if (searchInput) searchInput.focus();
  } else if (e.key === "?") {
    e.preventDefault();
    toggleShortcutsModal();
  } else if (e.key.toLowerCase() === "t") {
    if (themeToggleBtn) themeToggleBtn.click();
  }
});
