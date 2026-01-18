// ===============================
// FIX ADDRESSES ACTION (PHASE 1) — SAFE V1
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
// MAIN ACTION (SAFE)
// ===============================

/**
 * Fix addresses in CSV rows
 * @param {Array} headers
 * @param {Array} rows
 * @param {String} addressColumnName
 */
function fixAddresses(headers, rows, addressColumnName = "Address") {
  const addressIndex = headers.findIndex(
    h => h.toLowerCase() === addressColumnName.toLowerCase()
  );

  // ✅ SAFE EXIT — address column not found
  if (addressIndex === -1) {
    return {
      headers,
      rows
    };
  }

  // Add "House Number" column if missing
  let houseNumberIndex = headers.findIndex(
    h => h.toLowerCase() === "house number"
  );

  let newHeaders = [...headers];
  let newRows = rows.map(row => [...row]);

  if (houseNumberIndex === -1) {
    newHeaders.push("House Number");
    houseNumberIndex = newHeaders.length - 1;

    newRows = newRows.map(row => [...row, ""]);
  }

  newRows.forEach(row => {
    const original = row[addressIndex];
    row[addressIndex] = normalizeAddress(original);
    row[houseNumberIndex] = extractHouseNumber(original);
  });

  return {
    headers: newHeaders,
    rows: newRows
  };
}

// ===============================
// EXPORT (FOR PROMPT ENGINE)
// ===============================
window.fixAddresses = fixAddresses;
