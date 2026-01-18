// ===================================
// REMOVE ROWS MISSING EMAIL (ACTION)
// ===================================

/**
 * Detect email columns automatically
 */
function findEmailColumns(headers) {
  return headers
    .map((h, i) => ({ name: h.toLowerCase(), index: i }))
    .filter(col => col.name.includes("email"))
    .map(col => col.index);
}

/**
 * Check if row contains at least one email
 */
function rowHasEmail(row, emailIndexes) {
  return emailIndexes.some(index => {
    const value = row[index];
    return value && value.toString().trim() !== "";
  });
}

/**
 * Remove rows missing email
 *
 * @param {Array} headers
 * @param {Array} rows
 * @returns {Object}
 */
function removeMissingEmail(headers, rows) {
  const emailIndexes = findEmailColumns(headers);

  if (!emailIndexes.length) {
    throw new Error("No email column found");
  }

  const withEmail = [];
  const withoutEmail = [];

  rows.forEach(row => {
    rowHasEmail(row, emailIndexes)
      ? withEmail.push(row)
      : withoutEmail.push(row);
  });

  return {
    headers,
    withEmail,
    withoutEmail
  };
}

/**
 * Download CSV helper
 */
function downloadEmailResults(headers, rows, filename) {
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
window.removeMissingEmail = removeMissingEmail;
window.downloadEmailResults = downloadEmailResults;
