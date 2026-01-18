// ===================================
// ACTION: CREATE NEW COLUMN
// File: create-column.js
// ===================================

/**
 * Create a new column and append it to the CSV
 * @param {Array} headers - existing CSV headers
 * @param {Array} rows - CSV data rows
 * @param {String} columnName - new column name
 * @param {String} defaultValue - value to fill in each row
 */
function createNewColumn(headers, rows, columnName, defaultValue = "") {
  if (!columnName || headers.includes(columnName)) {
    throw new Error("Invalid or duplicate column name");
  }

  const newHeaders = [...headers, columnName];

  const newRows = rows.map(row => {
    return [...row, defaultValue];
  });

  return {
    headers: newHeaders,
    rows: newRows,
    columnAdded: columnName
  };
}

/**
 * Download helper
 */
function downloadCreateColumnCSV(headers, rows, filename = "updated.csv") {
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
// EXPORT (Prompt Tool Ready)
// ===================================
window.createNewColumn = createNewColumn;
window.downloadCreateColumnCSV = downloadCreateColumnCSV;
