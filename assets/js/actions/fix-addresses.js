// ===============================
// FIX ADDRESSES ACTION (PHASE 1)
// ===============================

// Common address replacements (extend anytime)
const ADDRESS_REPLACEMENTS = {
  " st ": " street ",
  " rd ": " road ",
  " ave ": " avenue ",
  " blvd ": " boulevard ",
  " dr ": " drive ",
  " ln ": " lane ",
  " ct ": " court ",
  " hwy ": " highway ",
  " pkwy ": " parkway ",
  " apt ": " apartment ",
  " ste ": " suite ",
  "#": " unit "
};

// ===============================
// HELPERS
// ===============================

function normalizeAddress(text) {
  if (!text) return "";

  let value = text.toLowerCase();

  // Normalize spacing
  value = value.replace(/\s+/g, " ").trim();

  // Replace abbreviations safely
  Object.keys(ADDRESS_REPLACEMENTS).forEach(key => {
    value = value.replaceAll(key, ADDRESS_REPLACEMENTS[key]);
  });

  // Capitalize words
  value = value.replace(/\b\w/g, char => char.toUpperCase());

  return value;
}

function extractHouseNumber(text) {
  if (!text) return "";

  const match = text.match(/\b\d{1,6}\b/);
  return match ? match[0] : "";
}

// ===============================
// MAIN ACTION
// ===============================

/**
 * Fix addresses in CSV rows
 * @param {Array} headers - CSV headers
 * @param {Array} rows - CSV rows
 * @param {String} addressColumnName - column to fix (e.g. "Address")
 */
function fixAddresses(headers, rows, addressColumnName = "Address") {
  const addressIndex = headers.findIndex(
    h => h.toLowerCase() === addressColumnName.toLowerCase()
  );

  if (addressIndex === -1) {
    throw new Error(`Address column "${addressColumnName}" not found`);
  }

  // Add house number column if missing
  let houseNumberIndex = headers.findIndex(
    h => h.toLowerCase() === "house number"
  );

  if (houseNumberIndex === -1) {
    headers.push("House Number");
    houseNumberIndex = headers.length - 1;

    rows.forEach(row => row.push(""));
  }

  rows.forEach(row => {
    const original = row[addressIndex];
    const fixed = normalizeAddress(original);
    const houseNumber = extractHouseNumber(original);

    row[addressIndex] = fixed;
    row[houseNumberIndex] = houseNumber;
  });

  return {
    headers,
    rows
  };
}

// ===============================
// EXPORT (FOR PROMPT ENGINE)
// ===============================
window.fixAddresses = fixAddresses;
