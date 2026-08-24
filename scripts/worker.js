import {
  formatCategoryLabel,
  getSearchableCategory,
} from "../src/components/ui/utils/categoryFilter.js";

self.onmessage = function (e) {
  const { allProjects, selectedCategory, query } = e.data;

  const filtered = allProjects.filter(
    project =>
      (selectedCategory === "all" || project.category === selectedCategory) &&
      (project.title.toLowerCase().includes(query) ||
        getSearchableCategory(project.category).includes(query))
  );

  self.postMessage(filtered);
};
