// ======================
// PROMPT ENGINE (V1)
// ======================

const promptInput = document.getElementById("promptInput");
const fileInput = document.getElementById("csvFile");
const runBtn = document.getElementById("runBtn");

const statusBox = document.getElementById("statusBox");
const statusText = document.getElementById("statusText");

const resultCard = document.getElementById("resultCard");
const resultSummary = document.getElementById("resultSummary");
const downloadBtn = document.getElementById("downloadResult");

let headers = [];
let rows = [];
let resultRows = [];

// ======================
// HELPERS
// ======================
function parseCSV(text) {
  const lines = text.trim().split("\n");
  headers = lines[0].split(",");
  rows = lines.slice(1).map(r => r.split(","));
}

function downloadCSV(filename, headers, rows) {
  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ======================
// PROMPT INTENT PARSER
// ======================
function detectActions(prompt) {
  const p = prompt.toLowerCase();

  return {
    removeMissingEmail: p.includes("missing email"),
    removeDuplicates: p.includes("duplicate"),
    splitByColumn: p.includes("split"),
    extractHouseNumber: p.includes("house"),
    fixAddress: p.includes("address"),
  };
}

// ======================
// ACTIONS (BASIC V1)
// ======================
function removeRowsMissingEmail(data) {
  const emailIndex = headers.findIndex(h =>
    h.toLowerCase().includes("email")
  );
  if (emailIndex === -1) return data;
  return data.filter(r => r[emailIndex]?.trim());
}

function removeDuplicates(data) {
  const seen = new Set();
  return data.filter(row => {
    const key = row.join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ======================
// RUN
// ======================
runBtn.addEventListener("click", () => {
  const prompt = promptInput.value.trim();
  const file = fileInput.files[0];

  if (!prompt || !file) {
    alert("Please enter a prompt and upload a CSV file.");
    return;
  }

  statusBox.style.display = "block";
  statusText.textContent = "Reading CSV…";

  const reader = new FileReader();
  reader.onload = e => {
    parseCSV(e.target.result);

    const actions = detectActions(prompt);
    resultRows = [...rows];

    if (actions.removeMissingEmail) {
      resultRows = removeRowsMissingEmail(resultRows);
    }

    if (actions.removeDuplicates) {
      resultRows = removeDuplicates(resultRows);
    }

    resultSummary.textContent = `
      Original rows: ${rows.length}
      → Final rows: ${resultRows.length}
    `;

    resultCard.style.display = "block";
    statusText.textContent = "Completed";
  };

  reader.readAsText(file);
});

downloadBtn.addEventListener("click", () => {
  if (resultRows.length) {
    downloadCSV("processed.csv", headers, resultRows);
  }
});
