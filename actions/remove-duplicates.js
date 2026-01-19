/**
 * ACTION: remove-duplicates
 * Logic:
 * - Prefer email column if found
 * - Otherwise deduplicate by full row string
 */

export function removeDuplicates({ headers, rows }) {
  if (!headers.length || !rows.length) {
    return {
      action: "remove-duplicates",
      error: "No data provided"
    };
  }

  const emailIndex = headers.findIndex(h =>
    h.toLowerCase().includes("email")
  );

  const seen = new Set();
  const cleaned = [];

  rows.forEach(row => {
    let key;

    if (emailIndex !== -1) {
      key = (row[emailIndex] || "").toLowerCase().trim();
    } else {
      key = row.join("|").toLowerCase();
    }

    if (!seen.has(key)) {
      seen.add(key);
      cleaned.push(row);
    }
  });

  return {
    action: "remove-duplicates",
    summary: {
      originalRows: rows.length,
      cleanedRows: cleaned.length,
      removed: rows.length - cleaned.length
    },
    headers,
    rows: cleaned
  };
}
