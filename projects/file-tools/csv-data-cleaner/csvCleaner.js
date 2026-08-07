(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CsvCleaner = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  function parseCsv(text) {
    if (typeof text !== "string") {
      throw new Error("CSV input must be a string.");
    }

    const rows = [];
    let field = "";
    let row = [];
    let insideQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"') {
        if (insideQuotes && next === '"') {
          field += '"';
          index += 1;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        row.push(field);
        field = "";
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
        if (char === "\r" && next === "\n") {
          index += 1;
        }
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += char;
      }
    }

    if (field.length > 0 || row.length > 0 || text.endsWith(",")) {
      row.push(field);
      rows.push(row);
    }

    const headerIndex = rows.findIndex(cells =>
      cells.some(cell => String(cell).trim() !== "")
    );

    if (headerIndex === -1) {
      return { headers: [], rows: [] };
    }

    const headers = rows[headerIndex].map((header, index) => {
      const trimmed = header.trim();
      return trimmed || `Column ${index + 1}`;
    });

    const dataRows = rows.slice(headerIndex + 1).map(cells =>
      normalizeRowLength(cells, headers.length)
    );

    return { headers, rows: dataRows };
  }

  function normalizeRowLength(row, length) {
    const normalized = row.slice(0, length);
    while (normalized.length < length) {
      normalized.push("");
    }
    return normalized;
  }

  function trimCells(dataset) {
    return {
      headers: dataset.headers.map(header => String(header).trim()),
      rows: dataset.rows.map(row => row.map(cell => String(cell).trim())),
    };
  }

  function isEmptyRow(row) {
    return row.every(cell => String(cell).trim() === "");
  }

  function removeEmptyRows(dataset) {
    return {
      headers: dataset.headers.slice(),
      rows: dataset.rows.filter(row => !isEmptyRow(row)),
    };
  }

  function removeDuplicateRows(dataset) {
    const seen = new Set();
    const rows = [];

    for (const row of dataset.rows) {
      const key = JSON.stringify(row.map(cell => String(cell)));
      if (!seen.has(key)) {
        seen.add(key);
        rows.push(row.slice());
      }
    }

    return {
      headers: dataset.headers.slice(),
      rows,
    };
  }

  function detectMissingValues(dataset) {
    const missing = [];

    dataset.rows.forEach((row, rowIndex) => {
      dataset.headers.forEach((header, columnIndex) => {
        if (String(row[columnIndex] || "").trim() === "") {
          missing.push({
            rowIndex,
            columnIndex,
            header,
          });
        }
      });
    });

    return missing;
  }

  function cleanDataset(dataset, options = {}) {
    const beforeRows = dataset.rows.length;
    let cleaned = {
      headers: dataset.headers.slice(),
      rows: dataset.rows.map(row => normalizeRowLength(row, dataset.headers.length)),
    };

    if (options.trimSpaces !== false) {
      cleaned = trimCells(cleaned);
    }

    let emptyRowsRemoved = 0;
    if (options.removeEmptyRows !== false) {
      const rowsBeforeEmpty = cleaned.rows.length;
      cleaned = removeEmptyRows(cleaned);
      emptyRowsRemoved = rowsBeforeEmpty - cleaned.rows.length;
    }

    let duplicateRowsRemoved = 0;
    if (options.removeDuplicates !== false) {
      const rowsBeforeDuplicates = cleaned.rows.length;
      cleaned = removeDuplicateRows(cleaned);
      duplicateRowsRemoved = rowsBeforeDuplicates - cleaned.rows.length;
    }

    const missingValues = detectMissingValues(cleaned);

    return {
      dataset: cleaned,
      summary: {
        beforeRows,
        afterRows: cleaned.rows.length,
        emptyRowsRemoved,
        duplicateRowsRemoved,
        missingValueCount: missingValues.length,
        missingValues,
      },
    };
  }

  function escapeCsvCell(value) {
    const text = String(value == null ? "" : value);
    if (/[",\n\r]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  function exportCsv(dataset) {
    const lines = [
      dataset.headers.map(escapeCsvCell).join(","),
      ...dataset.rows.map(row =>
        normalizeRowLength(row, dataset.headers.length).map(escapeCsvCell).join(",")
      ),
    ];

    return lines.join("\n");
  }

  function analyzeCsv(text, options = {}) {
    const parsed = parseCsv(text);
    return cleanDataset(parsed, options);
  }

  return {
    analyzeCsv,
    cleanDataset,
    detectMissingValues,
    escapeCsvCell,
    exportCsv,
    isEmptyRow,
    normalizeRowLength,
    parseCsv,
    removeDuplicateRows,
    removeEmptyRows,
    trimCells,
  };
});
