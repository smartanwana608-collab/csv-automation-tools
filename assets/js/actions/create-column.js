// ===================================
// CREATE NEW COLUMN (ACTION)
// ===================================

/**
 * Create a new column with empty values
 *
 * @param {Array} headers
 * @param {Array} rows
 * @param {String} columnName
 * @returns {Object}
 */
function createNewColumn(headers, rows, columnName) {
  if (!columnName || typeof columnName !== "string") {
    throw new Error("Column name is required");
  }

  // Prevent duplicate column
  if (headers.map(h => h.toLowerCase()).includes(columnName.toLowerCase())) {
    return {
      headers,
      rows
    };
  }

  const newHeaders = [...headers, columnName];

  const newRows = rows.map(row => {
    return [...row, ""];
  });

  return {
    headers: newHeaders,
    rows: newRows
  };
}

// ===================================
// EXPORT FOR PROMPT ENGINE
// ===================================
window.createNewColumn = createNewColumn;
