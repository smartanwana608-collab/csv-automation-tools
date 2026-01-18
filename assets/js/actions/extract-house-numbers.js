// ===================================
// EXTRACT HOUSE NUMBERS (ACTION)
// ===================================

/**
 * Find column index by name (case-insensitive)
 */
function findColumnIndex(headers, columnName) {
  return headers.findIndex(
    h => h.toLowerCase().trim() === columnName.toLowerCase().trim()
  );
}

/**
 * Extract house number from text
 * Examples:
 *  - "123 Main Street" → 123
 *  - "45B Elm Ave" → 45B
 */
function extractHouseNumber(text) {
  if (!text) return "";

  const match = text.toString().match(/\b\d+[a-zA-Z]?\b/);
  return match ? match[0] : "";
}

/**
 * Add "House Number" column extracted from a text column
 *
 * @param {Array} headers
 * @param {Array} rows
 * @param {String} sourceColumnName
 * @returns {Object}
 */
function extractHouseNumbers(headers, rows, sourceColumnName) {
  const sourceIndex = findColumnIndex(headers, sourceColumnName);

  if (sourceIndex === -1) {
    throw new Error(`Column "${sourceColumnName}" not found`);
  }

  const newHeaders = [...headers, "House Number"];

  const newRows = rows.map(row => {
    const text = row[sourceIndex];
    const houseNumber = extractHouseNumber(text);
    return [...row, houseNumber];
  });

  return {
    headers: newHeaders,
    rows: newRows
  };
}

// ===================================
// EXPORT FOR PROMPT ENGINE
// ===================================
window.extractHouseNumbers = extractHouseNumbers;
