/* =====================================================
PROMPT ENGINE
Free-text → Action Resolver → Executor
===================================================== */

import { filterRealEstateAgents } from "../actions/filter-real-estate.js";

/* ================= REGISTERED ACTIONS ================= */
const ACTIONS = [
  {
    key: "filter-real-estate",
    name: "Filter Real Estate Agents",
    triggers: [
      "real estate",
      "real estate agent",
      "broker",
      "brokerage",
      "agent"
    ],
    handler: filterRealEstateAgents
  }
];

/* ================= HELPERS ================= */
const normalize = text =>
  (text || "")
    .toString()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();

/* ================= CORE ENGINE ================= */
export function runPrompt({
  prompt,
  headers,
  rows
}) {
  const cleanPrompt = normalize(prompt);

  /* 1️⃣ Detect matching action */
  const matchedAction = ACTIONS.find(action =>
    action.triggers.some(t => cleanPrompt.includes(t))
  );

  /* 2️⃣ Graceful fallback (Option 1) */
  if (!matchedAction) {
    return {
      success: false,
      message: `We don’t have an action for "${prompt}" yet.`,
      suggestions: ACTIONS.map(a => a.name)
    };
  }

  /* 3️⃣ Execute action */
  const result = matchedAction.handler(headers, rows);

  return {
    success: true,
    action: matchedAction.name,
    result
  };
}

/* ================= AVAILABLE ACTIONS (UI USE) ================= */
export function getAvailableActions() {
  return ACTIONS.map(a => a.name);
}
