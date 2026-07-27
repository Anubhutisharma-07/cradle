/**
 * Planner Storage - Persistence layer & JSON Data Exporter/Importer
 */
(function (exports) {
  const STORAGE_PREFIX = "cradle_tb_planner_";

  function isLocalStorageAvailable() {
    try {
      return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    } catch (e) {
      return false;
    }
  }

  function getSchedule(dateStr) {
    if (!dateStr || !isLocalStorageAvailable()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + dateStr);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveSchedule(dateStr, blocks) {
    if (!dateStr || !isLocalStorageAvailable()) return false;
    try {
      localStorage.setItem(STORAGE_PREFIX + dateStr, JSON.stringify(blocks));
      return true;
    } catch (e) {
      return false;
    }
  }

  function sanitizeBlocks(blocks) {
    if (!Array.isArray(blocks)) return [];
    return blocks.map((b, idx) => ({
      id: b.id || `block_${Date.now()}_${idx}`,
      title: String(b.title || "Untitled Block"),
      category: String(b.category || "work"),
      start: String(b.start || "09:00"),
      end: String(b.end || "10:00"),
      color: String(b.color || "#3b82f6"),
      notes: String(b.notes || "")
    }));
  }

  exports.getSchedule = getSchedule;
  exports.saveSchedule = saveSchedule;
  exports.sanitizeBlocks = sanitizeBlocks;
})(typeof exports === "undefined" ? (window.PlannerStorage = {}) : exports);
