/**
 * JSON Converter — Core Logic
 *
 * Pure functions for JSON parsing, validation, and conversion
 * to YAML, CSV, and XML formats. Zero external dependencies.
 */

/* ------------------------------------------------------------------ */
/*  JSON Parsing & Validation                                         */
/* ------------------------------------------------------------------ */

/**
 * Parse JSON text and return a result object.
 * On success: { valid: true, value: <parsed> }
 * On error:   { valid: false, error: { message, line, column } }
 */
function parseJSON(text) {
  try {
    const value = JSON.parse(text);
    return { valid: true, value };
  } catch (e) {
    const msg = e.message;
    let line = 1, column = 1;

    // Modern Node.js format: "... at position N (line M column K)"
    const modernMatch = msg.match(/\(line\s+(\d+)\s+column\s+(\d+)\)/);
    if (modernMatch) {
      line = parseInt(modernMatch[1], 10);
      column = parseInt(modernMatch[2], 10);
    } else {
      // Older format: "... at position N"
      const posMatch = msg.match(/position\s+(\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const before = text.slice(0, pos);
        const lines = before.split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      } else {
        // No position info — scan for the first invalid token
        // Default to line 1, column 1 already set
      }
    }

    // Clean up the error message
    let cleanMsg = msg
      .replace(/^JSON\.parse:\s*/i, '')
      .replace(/,\s*".*"\s+is not valid JSON\s*$/, '')
      .replace(/\s*\(line\s+\d+.*\)$/, '')
      .replace(/\s*position\s+\d+.*$/, '')
      .trim();
    if (!cleanMsg || cleanMsg === 'is not valid JSON') cleanMsg = 'Invalid JSON';
    return { valid: false, error: { message: cleanMsg, line, column } };
  }
}

/* ------------------------------------------------------------------ */
/*  JSON → YAML                                                       */
/* ------------------------------------------------------------------ */

function needsYamlQuote(str) {
  return (
    str === '' ||
    str === '~' ||
    str === 'null' ||
    str === 'true' ||
    str === 'false' ||
    str === 'yes' ||
    str === 'no' ||
    str === 'on' ||
    str === 'off' ||
    /^(0|[1-9][0-9]*)(\.\d+)?$/.test(str) ||
    /[:\-#\[\]{},"'!&*?|>%@`\n\r]/.test(str) ||
    /^\s|\s$/.test(str) ||
    /^[ \t]/.test(str)
  );
}

function quoteYaml(str) {
  if (needsYamlQuote(str)) {
    // Use single quotes if no single quote inside, else double quotes with escaping
    if (str.includes("'")) {
      return JSON.stringify(str); // double-quote with JSON escaping
    }
    return `'${str}'`;
  }
  return str;
}

/**
 * Serialize a JavaScript value to YAML string.
 */
function toYaml(obj, indent) {
  if (indent === undefined) indent = 0;
  const pad = '  '.repeat(indent);

  if (obj === null || obj === undefined) return '~';
  if (typeof obj === 'boolean') return obj ? 'true' : 'false';
  if (typeof obj === 'number') {
    if (!Number.isFinite(obj)) return '~';
    return String(obj);
  }
  if (typeof obj === 'string') {
    if (obj === '') return "''";
    return quoteYaml(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return '\n' + obj.map(item => {
      const val = toYaml(item, indent + 1);
      if (typeof item === 'object' && item !== null) {
        // Multi-line value: add marker and indent further
        const lines = val.split('\n');
        const firstLine = lines.shift();
        const rest = lines.map(l => pad + '  ' + l).join('\n');
        const marker = firstLine.trimStart().startsWith('[') ? '' : '';
        return pad + '- ' + firstLine.trimStart() + '\n' + rest;
      }
      return pad + '- ' + val;
    }).join('\n');
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';

    return '\n' + keys.map((key, i) => {
      const val = toYaml(obj[key], indent + 1);
      const needsKeyQuote = /[:\-#\[\]{},"'!&*?|>%@`\n\r\s]/.test(key);
      const k = needsKeyQuote ? quoteYaml(key) : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && Object.keys(obj[key]).length > 0) {
        return pad + k + ':' + val;
      }
      if (Array.isArray(obj[key]) && obj[key].length > 0) {
        return pad + k + ':' + val;
      }
      return pad + k + ': ' + val;
    }).join('\n');
  }

  return String(obj);
}

/* ------------------------------------------------------------------ */
/*  JSON → CSV                                                        */
/* ------------------------------------------------------------------ */

function escapeCsv(val) {
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Flatten a nested object to dot-notation keys.
 * e.g. { a: { b: 1 } } → { 'a.b': 1 }
 */
function flattenObj(obj, prefix, result) {
  if (prefix === undefined) prefix = '';
  if (result === undefined) result = {};

  if (obj === null || obj === undefined) {
    result[prefix || 'value'] = '';
    return result;
  }

  if (typeof obj !== 'object' || Array.isArray(obj)) {
    result[prefix || 'value'] = String(obj);
    return result;
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) {
    result[prefix || 'value'] = '';
    return result;
  }

  for (const key of keys) {
    const newPrefix = prefix ? prefix + '.' + key : key;
    flattenObj(obj[key], newPrefix, result);
  }

  return result;
}

/**
 * Serialize a JavaScript value to CSV string.
 * Best for arrays of objects; other shapes get a single cell.
 */
function toCsv(obj) {
  if (obj === null || obj === undefined) return '';
  if (Array.isArray(obj) && obj.length === 0) return '';
  if (!Array.isArray(obj)) {
    // Single value or object
    const flattened = flattenObj(obj);
    const headers = Object.keys(flattened);
    const values = Object.values(flattened);
    return headers.join(',') + '\n' + values.map(escapeCsv).join(',');
  }

  // Array of items — collect all possible keys across all items
  const allKeys = new Set();
  const rows = obj.map(item => flattenObj(item));
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      allKeys.add(key);
    }
  }

  const headers = Array.from(allKeys);
  const lines = [headers.join(',')];

  for (const row of rows) {
    const vals = headers.map(h => escapeCsv(row[h] !== undefined ? row[h] : ''));
    lines.push(vals.join(','));
  }

  return lines.join('\n');
}

/* ------------------------------------------------------------------ */
/*  JSON → XML                                                        */
/* ------------------------------------------------------------------ */

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isValidXmlName(name) {
  return /^[a-zA-Z_][\w.-]*$/.test(name);
}

function sanitizeXmlName(name) {
  // Replace invalid XML name characters with underscore
  let s = name.replace(/[^a-zA-Z0-9_\-.]/g, '_');
  if (!/^[a-zA-Z_]/.test(s)) s = '_' + s;
  return s || 'item';
}

/**
 * Serialize a JavaScript value to XML string.
 * @param {*} obj         - The value to serialize
 * @param {string} rootName - Root element name (default: 'root')
 * @param {number} indent   - Current indentation level
 */
function toXml(obj, rootName, indent) {
  if (rootName === undefined) rootName = 'root';
  if (indent === undefined) indent = 0;
  const pad = '  '.repeat(indent);

  const name = isValidXmlName(rootName) ? rootName : sanitizeXmlName(rootName);

  if (obj === null || obj === undefined) {
    return `${pad}<${name}/>`;
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return `${pad}<${name}>${escapeXml(String(obj))}</${name}>`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return `${pad}<${name}/>`;
    const items = obj.map(item => {
      // For array items, use the singularized name
      const itemName = name.replace(/s$/, '') || 'item';
      return toXml(item, itemName, indent + 1);
    }).join('\n');
    return `${pad}<${name}>\n${items}\n${pad}</${name}>`;
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) return `${pad}<${name}/>`;
    const children = keys.map(key => {
      const childName = isValidXmlName(key) ? key : sanitizeXmlName(key);
      return toXml(obj[key], childName, indent + 1);
    }).join('\n');
    return `${pad}<${name}>\n${children}\n${pad}</${name}>`;
  }

  return `${pad}<${name}>${escapeXml(String(obj))}</${name}>`;
}

/* ------------------------------------------------------------------ */
/*  Formatting & Minification                                         */
/* ------------------------------------------------------------------ */

function formatJSON(text, indent) {
  if (indent === undefined) indent = 2;
  try {
    const obj = JSON.parse(text);
    return JSON.stringify(obj, null, indent);
  } catch {
    return text; // return as-is if invalid
  }
}

function minifyJSON(text) {
  try {
    const obj = JSON.parse(text);
    return JSON.stringify(obj);
  } catch {
    return text;
  }
}

/* ------------------------------------------------------------------ */
/*  Syntax Highlighting (JSON)                                        */
/* ------------------------------------------------------------------ */

/**
 * Return HTML with <span> tags for JSON syntax coloring.
 */
function highlightJSON(text) {
  // The approach: tokenize by walking the string character by character
  // to handle strings, numbers, booleans, null, and punctuation.
  let html = '';
  let i = 0;
  const chars = text;

  while (i < chars.length) {
    // Whitespace — pass through
    if (chars[i] === ' ' || chars[i] === '\n' || chars[i] === '\r' || chars[i] === '\t') {
      html += chars[i];
      i++;
      continue;
    }

    // String (double-quoted)
    if (chars[i] === '"') {
      let start = i;
      i++; // skip opening quote
      while (i < chars.length) {
        if (chars[i] === '\\') {
          i += 2; // skip escape sequence
        } else if (chars[i] === '"') {
          i++; // closing quote
          break;
        } else {
          i++;
        }
      }
      const token = chars.slice(start, i);
      // Check if this string is a key (followed by ':') or a value
      // We'll style all strings the same for simplicity
      html += `<span class="hl-string">${escapeHtml(token)}</span>`;
      continue;
    }

    // Number
    if (chars[i] === '-' || (chars[i] >= '0' && chars[i] <= '9')) {
      let start = i;
      if (chars[i] === '-') i++;
      while (i < chars.length && /[0-9eE.+\-]/.test(chars[i])) {
        // Avoid consuming operators that aren't part of the number
        if ((chars[i] === '+' || chars[i] === '-') && i > start && chars[i-1] !== 'e' && chars[i-1] !== 'E') break;
        i++;
      }
      const token = chars.slice(start, i);
      html += `<span class="hl-number">${escapeHtml(token)}</span>`;
      continue;
    }

    // true / false / null
    if (chars.slice(i, i + 4) === 'true') {
      html += '<span class="hl-boolean">true</span>';
      i += 4;
      continue;
    }
    if (chars.slice(i, i + 5) === 'false') {
      html += '<span class="hl-boolean">false</span>';
      i += 5;
      continue;
    }
    if (chars.slice(i, i + 4) === 'null') {
      html += '<span class="hl-null">null</span>';
      i += 4;
      continue;
    }

    // Punctuation and other characters
    const ch = chars[i];
    if ('{}[],:'.includes(ch)) {
      html += `<span class="hl-punct">${escapeHtml(ch)}</span>`;
    } else {
      html += escapeHtml(ch);
    }
    i++;
  }

  return html;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const escapeHtml =
  typeof window !== "undefined" && window.CradleEscape
    ? window.CradleEscape.escapeHtml
    : require("../../../src/components/ui/escapeHtml.js").escapeHtml;

/* ------------------------------------------------------------------ */
/*  Module Exports (for Node.js tests)                                */
/* ------------------------------------------------------------------ */

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseJSON,
    toYaml,
    toCsv,
    toXml,
    formatJSON,
    minifyJSON,
    highlightJSON,
  };
}
