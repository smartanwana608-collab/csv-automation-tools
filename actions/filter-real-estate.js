/* =====================================================
ACTION: FILTER REAL ESTATE AGENTS
Used by prompt-engine.js
===================================================== */

/* ================= KEYWORDS ================= */
/* Based on Peter’s feedback */
const BROKERAGE_KEYWORDS = [
  "remax",
  "sutton",
  "rlp",
  "c21",
  "century",
  "real",
  "realty",
  "exp",
  "broker",
  "brokerage",
  "agent",
  "home",
  "homes"
];

/* ================= HELPERS ================= */
const normalize = v =>
  (v || "")
    .toString()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();

/* ================= CORE LOGIC ================= */
export function filterRealEstateAgents(headers, rows) {
  const agentRows = [];
  const possibleRows = [];
  const otherRows = [];

  /* Identify key columns */
  const emailIndex = headers.findIndex(h =>
    normalize(h).includes("email")
  );

  const nameIndex = headers.findIndex(h =>
    normalize(h).includes("name")
  );

  const companyIndex = headers.findIndex(h =>
    normalize(h).includes("company") ||
    normalize(h).includes("broker") ||
    normalize(h).includes("office")
  );

  rows.forEach(row => {
    let score = 0;

    const email = normalize(row[emailIndex]);
    const name = normalize(row[nameIndex]);
    const company = normalize(row[companyIndex]);

    /* Email scan */
    BROKERAGE_KEYWORDS.forEach(k => {
      if (email.includes(k)) score += 2;
    });

    /* Company scan */
    BROKERAGE_KEYWORDS.forEach(k => {
      if (company.includes(k)) score += 2;
    });

    /* Name scan (lighter weight) */
    BROKERAGE_KEYWORDS.forEach(k => {
      if (name.includes(k)) score += 1;
    });

    /* Classification */
    if (score >= 4) {
      agentRows.push(row);
    } else if (score >= 2) {
      possibleRows.push(row);
    } else {
      otherRows.push(row);
    }
  });

  return {
    agents: agentRows,
    possible: possibleRows,
    others: otherRows
  };
}
