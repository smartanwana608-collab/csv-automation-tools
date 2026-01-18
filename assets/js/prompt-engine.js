// ======================
// PROMPT ENGINE — FINAL STABLE
// ======================

// DOM
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

const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");

// Data
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

// ======================
// PREVIEW
// ======================
function renderCSVPreview(tableEl, headers, rows, limit = 10) {
  tableEl.innerHTML = "";

  const thead = document.createElement("thead");
  const tr = document.createElement("tr");

  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    tr.appendChild(th);
  });

  thead.appendChild(tr);
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
// PROMPT DETECTOR
// ======================
function detectActions(prompt) {
  const p = prompt.toLowerCase();

  return {
    filterRealEstate: p.includes("real estate"),
    removeMissingEmail: p.includes("missing email"),
    removeDuplicates: p.includes("duplicate"),
    extractHouseNumbers: p.includes("house"),
    createColumn: p.includes("new column")
  };
}

// ======================
// ACTION LIST UI
// ======================
function renderDetectedActions(actions) {
  detectedActionsList.innerHTML = "";

  const labels = {
    filterRealEstate: "Filter real estate agents",
    removeMissingEmail: "Remove rows missing email",
    removeDuplicates: "Remove duplicate contacts",
    extractHouseNumbers: "Extract house numbers",
    createColumn: "Create a new column"
  };

  let found = false;

  Object.keys(actions).forEach(key => {
    if (actions[key]) {
      found = true;
      const li = document.createElement("li");
      li.textContent = labels[key];
      detectedActionsList.appendChild(li);
    }
  });

  detectedActionsCard.style.display = found ? "block" : "none";
}

// ======================
// ENABLE RUN BUTTON
// ======================
function updateRunButton() {
  runBtn.disabled = !(promptInput.value.trim() && fileInput.files.length);
}

promptInput.addEventListener("input", () => {
  renderDetectedActions(detectActions(promptInput.value.trim()));
  updateRunButton();
});

fileInput.addEventListener("change", updateRunButton);

// ======================
// RUN PROMPT (NORMALIZED)
// ======================
runBtn.addEventListener("click", () => {
  const prompt = promptInput.value.trim();
  const file = fileInput.files[0];

  if (!prompt) {
    alert("Please enter a prompt.");
    return;
  }

  if (!file) {
    alert("Please upload a CSV file.");
    return;
  }

  const actions = detectActions(prompt);

  statusBox.style.display = "block";
  statusText.textContent = "Processing CSV…";
  progressBar.style.width = "10%";
  progressPercent.textContent = "10%";

  const reader = new FileReader();

  reader.onload = e => {
    parseCSV(e.target.result);

    previewCard.style.display = "block";
    renderCSVPreview(csvPreviewTable, headers, rows);

    finalRows = [...rows];
    let currentHeaders = [...headers];

    try {
      if (actions.filterRealEstate) {
        const res = window.filterRealEstateAgents(currentHeaders, finalRows);
        finalRows = res.agents;
      }

      progressBar.style.width = "40%";
      progressPercent.textContent = "40%";

      if (actions.removeMissingEmail) {
        const res = window.removeMissingEmail(currentHeaders, finalRows);
        finalRows = res.withEmail;
      }

      if (actions.removeDuplicates) {
        const res = window.removeDuplicates(currentHeaders, finalRows);
        finalRows = res.rows;
      }

      if (actions.extractHouseNumbers) {
        const res = window.extractHouseNumbers(currentHeaders, finalRows);
        currentHeaders = res.headers;
        finalRows = res.rows;
      }

      if (actions.createColumn) {
        const res = window.createNewColumn(currentHeaders, finalRows);
        currentHeaders = res.headers;
        finalRows = res.rows;
      }

      progressBar.style.width = "100%";
      progressPercent.textContent = "100%";

      resultSummary.textContent =
        `Columns: ${currentHeaders.length}\n` +
        `Original rows: ${rows.length}\n` +
        `Final rows: ${finalRows.length}`;

      resultCard.style.display = "block";
      downloadBtn.disabled = false;
      statusText.textContent = "Completed";

      headers = currentHeaders;
    } catch (err) {
      console.error(err);
      alert("Processing failed. Please check your CSV structure.");
    }
  };

  reader.readAsText(file);
});

// ======================
// DOWNLOAD
// ======================
downloadBtn.addEventListener("click", () => {
  if (!finalRows.length) return;

  const csv = [headers, ...finalRows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "processed.csv";
  a.click();
  URL.revokeObjectURL(url);
});
