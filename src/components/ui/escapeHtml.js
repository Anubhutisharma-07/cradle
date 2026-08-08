/**
 * Cradle UI — HTML Escaping Utility
 * ─────────────────────────────────
 * Shared helper for escaping user-controlled text before it is
 * interpolated into innerHTML. Mirrors the UMD shape used by
 * projects/productivity/terminal-portfolio-generator/exportHtml.js:
 *
 *   Browser:  window.CradleEscape.escapeHtml(value)
 *   Node:     require("src/components/ui/escapeHtml.js").escapeHtml(value)
 *
 * Escapes & < > " ' so that markup in the input is rendered inert.
 * Returns "" for null/undefined and coerces other values via String().
 *
 * Usage (HTML):
 *   <script src="../../../src/components/ui/escapeHtml.js"></script>
 *   ...
 *   el.innerHTML = `<p>${CradleEscape.escapeHtml(userInput)}</p>`;
 */
(function (exports) {
  "use strict";

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  exports.escapeHtml = escapeHtml;
})(typeof exports === "undefined" ? (window.CradleEscape = {}) : exports);
