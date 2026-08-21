/**
 * Shared utility functions for category labeling and search filtering.
 */

export function formatCategoryLabel(category) {
    if (!category) return 'All';
    // Standardize category formatting to prevent drift
    return category.trim().charAt(0).toUpperCase() + category.trim().slice(1).toLowerCase();
}

export function getSearchableCategory(category) {
    if (!category) return '';
    return category.trim().toLowerCase();
}
