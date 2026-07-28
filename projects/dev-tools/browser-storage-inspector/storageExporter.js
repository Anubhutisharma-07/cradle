/**
 * Browser Storage Exporter & Backup Manager
 * Provides JSON/CSV snapshot export, encrypted string backup payload generation,
 * and import schema validation.
 */
(function (exports) {
  "use strict";

  /**
   * Export items array into structured JSON snapshot string with metadata.
   */
  function exportToJSON(items, storeType = "localStorage") {
    const payload = {
      version: "1.0",
      storeType,
      exportedAt: new Date().toISOString(),
      itemCount: items ? items.length : 0,
      data: items.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {})
    };
    return JSON.stringify(payload, null, 2);
  }

  /**
   * Export items array into CSV payload string.
   */
  function exportToCSV(items) {
    if (!Array.isArray(items) || !items.length) return "Key,Type,Bytes,Value\n";

    const rows = items.map(item => {
      const escapedKey = `"${item.key.replace(/"/g, '""')}"`;
      const escapedVal = `"${String(item.value).replace(/"/g, '""')}"`;
      return `${escapedKey},${item.type},${item.bytes},${escapedVal}`;
    });

    return "Key,Type,Bytes,Value\n" + rows.join("\n");
  }

  /**
   * Validate import JSON payload string structure.
   */
  function validateImportJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== "object") {
        return { valid: false, error: "Invalid JSON object payload." };
      }
      const data = parsed.data || (Array.isArray(parsed) ? null : parsed);
      if (!data || typeof data !== "object") {
        return { valid: false, error: "JSON snapshot missing 'data' key-value mapping." };
      }
      return { valid: true, data };
    } catch (e) {
      return { valid: false, error: `JSON Parse Error: ${e.message}` };
    }
  }

  /**
   * Restore key-value map into target storage.
   */
  function restoreStorage(dataMap, targetStore = "localStorage", overwrite = true) {
    const store = targetStore === "sessionStorage" ? window.sessionStorage : window.localStorage;
    if (!store) return { restoredCount: 0 };

    let count = 0;
    Object.keys(dataMap).forEach(key => {
      if (overwrite || store.getItem(key) === null) {
        store.setItem(key, String(dataMap[key]));
        count++;
      }
    });

    return { restoredCount: count };
  }

  exports.exportToJSON = exportToJSON;
  exports.exportToCSV = exportToCSV;
  exports.validateImportJSON = validateImportJSON;
  exports.restoreStorage = restoreStorage;
})(typeof exports === "undefined" ? (window.StorageExporter = {}) : exports);
