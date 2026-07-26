self.onmessage = function (e) {
  const { allProjects, selectedCategory, query } = e.data;

  function formatCategoryLabel(category) {
    return category.toUpperCase().replace("-", " ");
  }

  function getSearchableCategory(category) {
    return `${category} ${formatCategoryLabel(category)}`.toLowerCase();
  }

  const filtered = allProjects.filter(
    project =>
      (selectedCategory === "all" || project.category === selectedCategory) &&
      (project.title.toLowerCase().includes(query) ||
        getSearchableCategory(project.category).includes(query))
  );

  self.postMessage(filtered);
};
