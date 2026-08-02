/* =========================================================
   URL PARSER — ENGINE MODULE
   URL decomposition, protocol scheme resolution, query string
   parameter extractor, and component sanitizer.
   ========================================================= */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.URLEngine = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Parse URL string into structured component metadata */
  function parseURLComponents(urlStr = "") {
    if (!urlStr || typeof urlStr !== "string") {
      return { components: null, error: "Empty or invalid URL string" };
    }

    let input = urlStr.trim();
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(input)) {
      input = "https://" + input;
    }

    try {
      const parsed = new URL(input);
      const queryParams = [];

      parsed.searchParams.forEach((value, key) => {
        queryParams.push({ key, value });
      });

      const components = {
        href: parsed.href,
        protocol: parsed.protocol.replace(":", ""),
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === "https:" ? "443" : parsed.protocol === "http:" ? "80" : ""),
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        origin: parsed.origin,
        queryParams,
      };

      return { components, error: null };
    } catch (err) {
      return { components: null, error: "Failed to parse URL: " + err.message };
    }
  }

  /** Build search string from query parameters array */
  function buildQueryString(paramArray = []) {
    if (!Array.isArray(paramArray) || !paramArray.length) return "";
    const params = new URLSearchParams();
    paramArray.forEach(({ key, value }) => {
      if (key) params.append(key, value || "");
    });
    const str = params.toString();
    return str ? "?" + str : "";
  }

  /** Safe percent encoding and decoding helpers */
  function encodeURLComponentSafe(str = "") {
    try {
      return encodeURIComponent(str);
    } catch {
      return str;
    }
  }

  function decodeURLComponentSafe(str = "") {
    try {
      return decodeURIComponent(str);
    } catch {
      return str;
    }
  }

  /** Classify a file extension into a broad media type. */
  function detectFileType(extension) {
    const images = ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif"];
    const videos = ["mp4", "webm", "mov", "mkv"];
    const documents = ["pdf", "doc", "docx", "txt"];

    if (images.includes(extension)) return "Image ";
    if (videos.includes(extension)) return "Video ";
    if (documents.includes(extension)) return "Document ";
    return "Unknown";
  }

  /** Classify a URL (a WHATWG URL instance) into a human-readable type. */
  function detectURLType(url, extension) {
    if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension)) {
      return "Image URL";
    }
    if (["mp4", "webm", "mov"].includes(extension)) {
      return "Video URL";
    }
    if (url.hostname.includes("api")) {
      return "API Endpoint";
    }
    if (url.hostname.includes("github.com")) {
      return "GitHub URL";
    }
    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtu.be")
    ) {
      return "YouTube URL";
    }
    if (url.protocol === "ftp:") {
      return "FTP URL";
    }
    if (url.protocol === "mailto:") {
      return "Email URL";
    }
    return "Website URL";
  }

  /** Escape a value for safe interpolation into innerHTML. */
  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  return {
    parseURLComponents,
    buildQueryString,
    encodeURLComponentSafe,
    decodeURLComponentSafe,
    detectFileType,
    detectURLType,
    escapeHTML,
  };
});
