// ===================================
// REMOVE DUPLICATES (ACTION)
// ===================================

/**
 * Remove duplicate rows from CSV
 * Duplicate = rows with identical values across all columns
 *
 * @param {Array} headers
 * @param {Array} rows
 * @returns {Object}
 */
function removeDuplicates(headers, rows) {
  const seen = new Set();
  const uniqueRows = [];
  const removedRows = [];

  rows.forEach(row => {
    const key = row.join("||");

    if (seen.has(key)) {
      removedRows.push(row);
    } else {
      seen.add(key);
      uniqueRows.push(row);
    }
  });

  return {
    headers,
    rows: uniqueRows,
    removedCount: removedRows.length
  };
}

// ===================================
// EXPORT FOR PROMPT ENGINE
// ===================================
window.removeDuplicates = removeDuplicates;
