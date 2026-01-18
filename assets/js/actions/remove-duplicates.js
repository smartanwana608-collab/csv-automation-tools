// ===================================
// REMOVE DUPLICATES (ACTION)
// ===================================

/**
 * Find email column indexes
 */
function findEmailColumns(headers) {
  return headers
    .map((h, i) => ({ name: h.toLowerCase(), index: i }))
    .filter(col => col.name.includes("email"))
    .map(col => col.index);
}

/**
 * Generate unique key for a row
 * Priority:
 * 1. Email value (if exists)
 * 2. Full row string
 */
function generateRowKey(row, emailIndexes) {
  for (const index of emailIndexes) {
    const value = row[index];
    if (value && value.toString().trim() !== "") {
      return value.toString().trim().toLowerCase();
    }
  }

  // Fallback: entire row
  return row.join("|").toLowerCase();
}

/**
 * Remove duplicate rows
 *
 * @param {Array} headers
 * @param {Array} rows
 * @returns {Object}
 */
function removeDuplicates(headers, rows) {
  const emailIndexes = findEmailColumns(headers);

  const seen = new Set();
  const uniqueRows = [];
  const duplicateRows = [];

  rows.forEach(row => {
    const key = generateRowKey(row, emailIndexes);

    if (seen.has(key)) {
      duplicateRows.push(row);
    } else {
      seen.add(key);
      uniqueRows.push(row);
    }
  });

  return {
    headers,
    uniqueRows,
    duplicateRows
  };
}

/**
 * Download CSV helper
 */
function downloadDuplicateResults(headers, rows, filename) {
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===================================
// EXPORT FOR PROMPT ENGINE
// ===================================
window.removeDuplicates = removeDuplicates;
window.downloadDuplicateResults = downloadDuplicateResults;
