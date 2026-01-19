/* =====================================================
PROMPT ENGINE — STEP 2 (LOGIC ONLY)
No UI styling
No direct CSV mutation yet
===================================================== */

/* ================= AVAILABLE ACTIONS =================
These must match action filenames conceptually
===================================================== */
const AVAILABLE_ACTIONS = [
  {
    key: "remove duplicates",
    file: "remove-duplicates.js",
    aliases: ["remove duplicate", "deduplicate"]
  },
  {
    key: "remove missing emails",
    file: "remove-missing-emails.js",
    aliases: ["missing emails", "no email"]
  },
  {
    key: "split by column",
    file: "split-by-column.js",
    aliases: ["split column", "separate column"]
  },
  {
    key: "create column",
    file: "create-column.js",
    aliases: ["add column", "new column"]
  },
  {
    key: "extract house numbers",
    file: "extract-house-numbers.js",
    aliases: ["house number", "street number"]
  },
  {
    key: "fix addresses",
    file: "fix-addresses.js",
    aliases: ["clean address", "normalize address"]
  },
  {
    key: "filter real estate agents",
    file: "filter-real-estate.js",
    aliases: [
      "real estate",
      "real estate agent",
      "brokerage",
      "remax",
      "sutton",
      "rlp",
      "c21",
      "exp",
      "agent"
    ]
  }
];

/* ================= HELPERS ================= */
const normalize = str =>
  (str || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();

/* ================= DOM READY ================= */
document.addEventListener("DOMContentLoaded", () => {
  const promptInput = document.getElementById("userPrompt");
  const runBtn = document.getElementById("runPromptBtn");

  const responseBox = document.getElementById("responseText");
  const previewTable = document.getElementById("previewTable");
  const downloadBtn = document.getElementById("downloadPrimary");

  /* Initial UI state */
  responseBox.textContent = "Waiting for your prompt…";
  previewTable.innerHTML = "";
  downloadBtn.disabled = true;

  /* ================= RUN PROMPT ================= */
  runBtn.addEventListener("click", () => {
    const rawPrompt = promptInput.value;

    if (!rawPrompt.trim()) {
      responseBox.textContent = "Please enter an action.";
      return;
    }

    const userPrompt = normalize(rawPrompt);

    /* ================= MATCH ACTION ================= */
    let matchedAction = null;
    let suggestions = [];

    AVAILABLE_ACTIONS.forEach(action => {
      const allTerms = [action.key, ...action.aliases];

      allTerms.forEach(term => {
        if (userPrompt.includes(normalize(term))) {
          matchedAction = action;
        }
      });

      if (userPrompt.includes(action.key.split(" ")[0])) {
        suggestions.push(action.key);
      }
    });

    /* ================= NO MATCH (OPTION B) ================= */
    if (!matchedAction) {
      responseBox.innerHTML = `
        <strong>We couldn’t find an exact match.</strong><br/><br/>
        You can try one of these available actions:
        <ul>
          ${AVAILABLE_ACTIONS.map(a => `<li>${a.key}</li>`).join("")}
        </ul>
      `;
      return;
    }

    /* ================= MATCH FOUND ================= */
    responseBox.innerHTML = `
      <strong>Action detected:</strong> ${matchedAction.key}<br/>
      Preparing to run this action…
    `;

    /* ================= PLACEHOLDERS =================
    These will be replaced in STEP 3+
    ================================================= */
    previewTable.innerHTML = `
      <thead>
        <tr>
          <th>Preview</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Preview will appear here after processing.</td>
        </tr>
      </tbody>
    `;

    downloadBtn.disabled = false;
  });
});
