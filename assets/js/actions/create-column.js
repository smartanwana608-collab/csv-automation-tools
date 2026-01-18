// ===================================
// CREATE COLUMN (ACTION)
// ===================================

/**
 * Create a new empty column in the CSV
 *
 * @param {Array} headers
 * @param {Array} rows
 * @param {String} columnName
 * @returns {{ headers: Array, rows: Array }}
 */
export function createColumn(headers, rows, columnName) {
  if (!columnName || !columnName.trim()) {
    return { headers, rows };
  }

  // Prevent duplicate column names
  if (headers.includes(columnName)) {
    return { headers, rows };
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
