// ===================================
// ACTION: REMOVE ROWS MISSING EMAIL (SAFE V1)
// File: missing-email.js
// ===================================

/**
 * Detect email-related columns
 */
function findEmailColumns(headers) {
  return headers
    .map((h, i) => ({ name: h.toLowerCase(), index: i }))
    .filter(col => col.name.includes("email"))
    .map(col => col.index);
}

/**
 * Check if a row has at least one email
 */
function rowHasEmail(row, emailIndexes) {
  return emailIndexes.some(
    idx => row[idx] && row[idx].toString().trim() !== ""
  );
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

  // ✅ SAFE EXIT — no email column found
  if (!emailIndexes.length) {
    return {
      headers,
      withEmail: rows,
      withoutEmail: [],
      emailColumnCount: 0
    };
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
    withoutEmail,
    emailColumnCount: emailIndexes.length
  };
}

// ===================================
// EXPORT (FOR PROMPT ENGINE)
// ===================================
window.removeMissingEmail = removeMissingEmail;
