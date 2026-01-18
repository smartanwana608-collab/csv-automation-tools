// ======================
// PROMPT ENGINE — STABLE V1
// ======================

// ---------- DOM ----------
const promptInput = document.getElementById("promptInput");
const fileInput = document.getElementById("csvFile");
const runBtn = document.getElementById("runBtn");

const statusBox = document.getElementById("statusBox");
const statusText = document.getElementById("statusText");

const detectedActionsCard = document.getElementById("detectedActionsCard");
const detectedActionsList = document.getElementById("detectedActionsList");

const previewCard = document.getElementById("previewCard");
const csvPreviewTable = document.getElementById("csvPreviewTable");

const resultCard = document.getElementById("resultCard");
const resultSummary = document.getElementById("resultSummary");
const downloadBtn = document.getElementById("downloadResult");

// Progress (already styled in CSS)
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

// ---------- DATA ----------
let headers = [];
let rows = [];
let finalRows = [];

// ======================
// CSV HELPERS
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
// CSV PREVIEW
// ======================
function renderCSVPreview(tableEl, headers, rows, limit = 10) {
  tableEl.innerHTML = "";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  tableEl.appendChild(thead);

  const tbody = document.createElement("tbody");

  rows.slice(0, limit).forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  tableEl.appendChild(tbody);
}

// ======================
// PROMPT DETECTION
// ======================
function detectActions(prompt) {
  const p = prompt.toLowerCase();

  return {
    filterRealEstate: p.includes("real estate"),
    removeMissingEmail: p.includes("missing email"),
    removeDuplicates: p.includes("duplicate"),
    extractHouseNumbers: p.includes("house"),
  };
}

// ======================
// DETECTED ACTIONS UI
// ======================
function renderDetectedActions(actions) {
  detectedActionsList.innerHTML = "";

  const map = {
    filterRealEstate: "Filter real estate agents",
    removeMissingEmail: "Remove rows missing email",
    removeDuplicates: "Remove duplicate contacts",
    extractHouseNumbers: "Extract house numbers",
  };

  let found = false;

  Object.keys(actions).forEach(key => {
    if (actions[key]) {
      found = true;
      const li = document.createElement("li");
      li.textContent = map[key];
      detectedActionsList.appendChild(li);
    }
  });

  detectedActionsCard.style.display = found ? "block" : "none";
  return found;
}

// ======================
// RUN BUTTON ENABLE LOGIC
// ======================
function updateRunButton() {
  const enabled =
    promptInput.value.trim().length > 0 &&
    fileInput.files.length > 0;

  runBtn.disabled = !enabled;
  runBtn.classList.toggle("enabled", enabled);
}

promptInput.addEventListener("input", () => {
  renderDetectedActions(detectActions(promptInput.value.trim()));
  updateRunButton();
});

fileInput.addEventListener("change", updateRunButton);

// ======================
// RUN PROMPT
// ======================
runBtn.addEventListener("click", () => {
  const prompt = promptInput.value.trim();
  const file = fileInput.files[0];

  if (!prompt) {
    alert("Please write a prompt before running.");
    return;
  }

  if (!file) {
    alert("Please upload a CSV file.");
    return;
  }

  const actions = detectActions(prompt);
  const hasActions = renderDetectedActions(actions);

  if (!hasActions) {
    alert("No valid actions detected. Use the supported wording.");
    return;
  }

  // UI RESET
  runBtn.disabled = true;
  statusBox.style.display = "block";
  statusText.textContent = "Reading CSV…";
  progressBar.style.width = "20%";
  progressPercent.textContent = "20%";

  const reader = new FileReader();

  reader.onload = e => {
    try {
      // ---------- PARSE ----------
      parseCSV(e.target.result);

      previewCard.style.display = "block";
      renderCSVPreview(csvPreviewTable, headers, rows);

      statusText.textContent = "Applying selected actions…";
      progressBar.style.width = "60%";
      progressPercent.textContent = "60%";

      finalRows = [...rows];

      // ---------- APPLY ACTIONS ----------
      if (actions.filterRealEstate) {
        const res = window.filterRealEstateAgents(headers, finalRows);
        finalRows = res?.agents || finalRows;
      }

      if (actions.removeMissingEmail) {
        const res = window.removeMissingEmail(headers, finalRows);
        finalRows = res?.withEmail || finalRows;
      }

      if (actions.removeDuplicates) {
        finalRows = window.removeDuplicates(finalRows) || finalRows;
      }

      if (actions.extractHouseNumbers) {
        const res = window.extractHouseNumbers(headers, finalRows);
        finalRows = res?.rows || finalRows;
      }

      // ---------- FINALIZE ----------
      statusText.textContent = "Finalizing results…";
      progressBar.style.width = "100%";
      progressPercent.textContent = "100%";

      resultSummary.textContent =
        `Columns detected: ${headers.length}\n` +
        `Original rows: ${rows.length}\n` +
        `Final rows: ${finalRows.length}`;

      resultCard.style.display = "block";
      downloadBtn.disabled = false;
      downloadBtn.classList.add("enabled");

    } catch (err) {
      console.error(err);
      alert("An error occurred while applying actions. Check the CSV or action compatibility.");
    } finally {
      runBtn.disabled = false;
      statusText.textContent = "Completed";
    }
  };

  reader.readAsText(file);
});

// ======================
// DOWNLOAD
// ======================
downloadBtn.addEventListener("click", () => {
  if (finalRows.length) {
    downloadCSV("processed.csv", headers, finalRows);
  }
});
