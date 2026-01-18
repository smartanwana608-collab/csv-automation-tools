// ===================================
// SPLIT CSV BY COLUMN VALUE (ACTION)
// ===================================

/**
 * Split CSV rows by a column's values
 *
 * @param {Array} headers - CSV headers
 * @param {Array} rows - CSV data rows
 * @param {String} columnName - Column to split by
 *
 * @returns {Object} - { value1: rows[], value2: rows[] }
 */
function splitByColumn(headers, rows, columnName) {
  const columnIndex = headers.findIndex(
    h => h.toLowerCase() === columnName.toLowerCase()
  );

  if (columnIndex === -1) {
    throw new Error(`Column "${columnName}" not found`);
  }

  const result = {};

  rows.forEach(row => {
    let value = row[columnIndex] || "EMPTY";

    value = value.toString().trim();
    if (!value) value = "EMPTY";

    if (!result[value]) {
      result[value] = [];
    }

    result[value].push(row);
  });

  return {
    headers,
    groups: result
  };
}

/**
 * Generate safe filename from value
 */
function formatFilename(base, value) {
  return `${base}_${value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")}.csv`;
}

/**
 * Download grouped CSVs
 */
function downloadSplitCSVs(baseName, headers, groups) {
  Object.keys(groups).forEach(value => {
    const rows = groups[value];
    const filename = formatFilename(baseName, value);

    const csv = [headers, ...rows]
      .map(r => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// ===================================
// EXPORT FOR PROMPT ENGINE
// ===================================
window.splitByColumn = splitByColumn;
window.downloadSplitCSVs = downloadSplitCSVs;
