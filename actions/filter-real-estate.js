/* =====================================================
FILTER REAL ESTATE ACTION — FINAL
===================================================== */

/*
  Classification rules (Peter-approved):

  STRONG MATCH → Real Estate Agent
  - Brokerage keywords in email domain OR company
  - Multiple keyword hits across fields

  WEAK MATCH → Possible Agent
  - One keyword hit
  - Job-related words (agent, broker, realtor)

  ELSE → Other Contact
*/

const BROKERAGE_KEYWORDS = [
  "remax",
  "sutton",
  "rlp",
  "royal lepage",
  "c21",
  "century",
  "exp",
  "kw",
  "keller",
  "coldwell",
  "realty",
  "brokerage",
  "homes"
];

const ROLE_KEYWORDS = [
  "agent",
  "broker",
  "realtor"
];

function normalize(value = "") {
  return value.toString().toLowerCase();
}

function countMatches(text, keywords) {
  let count = 0;
  keywords.forEach(k => {
    if (text.includes(k)) count++;
  });
  return count;
}

export default function filterRealEstate({ headers, rows }) {
  const results = {
    agents: [],
    possible: [],
    others: []
  };

  const emailIndex = headers.findIndex(h =>
    normalize(h).includes("email")
  );

  const nameIndex = headers.findIndex(h =>
    normalize(h).includes("name")
  );

  const companyIndex = headers.findIndex(h =>
    normalize(h).includes("company")
  );

  rows.forEach(row => {
    const email = normalize(row[emailIndex] || "");
    const name = normalize(row[nameIndex] || "");
    const company = normalize(row[companyIndex] || "");

    const combined = `${email} ${name} ${company}`;

    const brokerageHits =
      countMatches(combined, BROKERAGE_KEYWORDS);

    const roleHits =
      countMatches(combined, ROLE_KEYWORDS);

    let classification = "Other Contact";

    if (brokerageHits >= 2 || (brokerageHits >= 1 && roleHits >= 1)) {
      classification = "Real Estate Agent";
      results.agents.push([...row, classification]);
    }
    else if (brokerageHits === 1 || roleHits === 1) {
      classification = "Possible Agent";
      results.possible.push([...row, classification]);
    }
    else {
      results.others.push([...row, classification]);
    }
  });

  return {
    headers: [...headers, "leadcleer_classification"],
    results
  };
}
