/**
 * Periodic Table Storage Handler - Manages bookmarks and filter preferences
 * Compatible with Node.js (in-memory fallback) and Browser environments
 */

(function (exports) {
  const STORAGE_KEY_BOOKMARKS = "cradle_periodic_bookmarks";
  const STORAGE_KEY_SETTINGS = "cradle_periodic_settings";

  let memoryBookmarks = [];
  let memorySettings = {
    tempK: 298,
    tempUnit: "C",
    themeMode: "standard"
  };

  function isLocalStorageAvailable() {
    try {
      return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    } catch (e) {
      return false;
    }
  }

  /**
   * Retrieves bookmarked atomic numbers.
   * @returns {number[]} Array of atomic numbers
   */
  function getBookmarkedElements() {
    if (!isLocalStorageAvailable()) return memoryBookmarks;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return memoryBookmarks;
    }
  }

  /**
   * Toggles bookmark state for an element by its atomic number.
   * @param {number} atomicNumber
   * @returns {boolean} True if now bookmarked, false if removed
   */
  function toggleBookmark(atomicNumber) {
    const list = getBookmarkedElements();
    const index = list.indexOf(atomicNumber);
    let isBookmarked = false;

    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(atomicNumber);
      isBookmarked = true;
    }

    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(list));
      } catch (e) {}
    } else {
      memoryBookmarks = list;
    }

    return isBookmarked;
  }

  /**
   * Checks if an element is bookmarked.
   * @param {number} atomicNumber
   * @returns {boolean}
   */
  function isBookmarked(atomicNumber) {
    const list = getBookmarkedElements();
    return list.includes(atomicNumber);
  }

  /**
   * Retrieves user preferences.
   * @returns {Object} Settings object
   */
  function getSettings() {
    if (!isLocalStorageAvailable()) return memorySettings;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return raw ? { ...memorySettings, ...JSON.parse(raw) } : memorySettings;
    } catch (e) {
      return memorySettings;
    }
  }

  /**
   * Saves user preferences.
   * @param {Object} newSettings
   */
  function saveSettings(newSettings) {
    const current = getSettings();
    const updated = { ...current, ...newSettings };

    if (isLocalStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      } catch (e) {}
    } else {
      memorySettings = updated;
    }

    return updated;
  }

  exports.getBookmarkedElements = getBookmarkedElements;
  exports.toggleBookmark = toggleBookmark;
  exports.isBookmarked = isBookmarked;
  exports.getSettings = getSettings;
  exports.saveSettings = saveSettings;

})(typeof exports === "undefined" ? (window.PeriodicStorage = {}) : exports);
