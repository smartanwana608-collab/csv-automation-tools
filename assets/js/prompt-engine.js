// ======================
// PROMPT ENGINE — FINAL V1 (LOCKED & STABLE)
// ======================

// DOM
const promptInput = document.getElementById("promptInput");
const fileInput = document.getElementById("csvFile");
const runBtn = document.getElementById("runBtn");

const statusBox = document.getElementById("statusBox");
const statusText = document.getElementById("statusText");

const detectedActionsCard = document.getElementById("detectedActionsCard");
const detectedActionsList = document.getElementById("detectedActionsList");

const actionParamsCard = document.getElementById("actionParamsCard");
const actionParamsFields = document.getElementById("actionParamsFields");

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
let splitGroups = null;
let actionParams = {};

// ======================
// CSV HELPERS
// ======================
function parseCSV(text) {
  const lines = text.trim().split("\n");
  headers = lines[0].split(",").map(h => h.trim());
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
      td.textContent = cell || "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  tableEl.appendChild(tbody);
}

// ======================
// ACTION DETECTOR (LOCKED)
// ======================
function detectActions(prompt) {
  const p = prompt.toLowerCase();

  return {
    createColumn: p.includes("create"),
    extractHouseNumbers: p.includes("house"),
    filterRealEstate: p.includes("real estate"),
    fixAddresses: p.includes("fix address"),
    removeMissingEmail: p.includes("remove") && p.includes("missing email"),
    findMissingEmail: p.includes("find") && p.includes("missing email"),
    removeDuplicates: p.includes("duplicate"),
    splitByColumn: p.includes("split"),
  };
}

// ======================
// ACTION LIST UI
// ======================
function renderDetectedActions(actions) {
  detectedActionsList.innerHTML = "";
  let found = false;

  const labels = {
    createColumn: "Create a new column",
    extractHouseNumbers: "Extract house numbers",
    filterRealEstate: "Filter real estate agents",
    fixAddresses: "Fix addresses",
    removeMissingEmail: "Remove rows missing email",
    findMissingEmail: "Find contacts missing email",
    removeDuplicates: "Remove duplicate contacts",
    splitByColumn: "Split CSV by column",
  };

  Object.keys(actions).forEach(key => {
    if (actions[key]) {
      found = true;
      const li = document.createElement("li");
      li.textContent = labels[key];
      detectedActionsList.appendChild(li);
    }
  });

  detectedActionsCard.style.display = found ? "block" : "none";
  return found;
}

// ======================
// ACTION PARAMETERS UI (MINIMAL)
// ======================
function renderActionParams(actions) {
  actionParamsFields.innerHTML = "";
  actionParams = {};

  // CREATE COLUMN
  if (actions.createColumn) {
    const label = document.createElement("label");
    label.textContent = "New column name:";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "e.g. Lead Source";
    input.style.width = "100%";
    input.style.padding = "10px";

    input.addEventListener("input", () => {
      actionParams.columnName = input.value.trim();
      updateRunButton();
    });

    actionParamsFields.appendChild(label);
    actionParamsFields.appendChild(input);
    actionParamsCard.style.display = "block";
    return;
  }

  // SPLIT BY COLUMN
  if (actions.splitByColumn && headers.length) {
    const label = document.createElement("label");
    label.textContent = "Select column to split by:";

    const select = document.createElement("select");
    select.style.width = "100%";
    select.style.padding = "10px";

    headers.forEach(h => {
      const opt = document.createElement("option");
      opt.value = h;
      opt.textContent = h;
      select.appendChild(opt);
    });

    select.addEventListener("change", () => {
      actionParams.splitColumn = select.value;
      updateRunButton();
    });

    actionParamsFields.appendChild(label);
    actionParamsFields.appendChild(select);
    actionParamsCard.style.display = "block";
    return;
  }

  actionParamsCard.style.display = "none";
}

// ======================
// ENABLE RUN BUTTON
// ======================
function updateRunButton() {
  const hasPrompt = promptInput.value.trim();
  const hasFile = fileInput.files.length;

  const actions = detectActions(promptInput.value.trim());
  const needsColumnName = actions.createColumn && !actionParams.columnName;
  const needsSplitColumn = actions.splitByColumn && !actionParams.splitColumn;

  runBtn.disabled = !(hasPrompt && hasFile) || needsColumnName || needsSplitColumn;
  runBtn.classList.toggle("enabled", !runBtn.disabled);
}

// ======================
// EVENTS
// ======================
promptInput.addEventListener("input", () => {
  const actions = detectActions(promptInput.value.trim());
  const found = renderDetectedActions(actions);
  renderActionParams(actions);
  updateRunButton();

  if (!found && promptInput.value.trim()) {
    statusBox.style.display = "block";
    statusText.textContent = "No supported action detected.";
  }
});

fileInput.addEventListener("change", updateRunButton);

// ======================
// RUN PROMPT
// ======================
runBtn.addEventListener("click", () => {
  const prompt = promptInput.value.trim();
  const file = fileInput.files[0];

  if (!prompt || !file) return;

  const actions = detectActions(prompt);
  if (!renderDetectedActions(actions)) {
    alert("No supported action detected.");
    return;
  }

  statusBox.style.display = "block";
  statusText.textContent = "Processing CSV…";
  progressBar.style.width = "20%";
  progressPercent.textContent = "20%";

  const reader = new FileReader();
  reader.onload = e => {
    parseCSV(e.target.result);

    renderCSVPreview(csvPreviewTable, headers, rows);
    previewCard.style.display = "block";

    finalRows = [...rows];

    try {
      if (actions.filterRealEstate) {
        finalRows = window.filterRealEstateAgents(headers, finalRows).agents;
      }

      if (actions.removeMissingEmail) {
        finalRows = window.removeMissingEmail(headers, finalRows).withEmail;
      }

      if (actions.findMissingEmail) {
        finalRows = window.findContactsMissingEmail(headers, finalRows).missingEmailRows;
      }

      if (actions.removeDuplicates) {
        finalRows = window.removeDuplicates(headers, finalRows).rows;
      }

      if (actions.extractHouseNumbers) {
        const result = window.extractHouseNumbers(headers, finalRows);
        headers = result.headers;
        finalRows = result.rows;
      }

      if (actions.fixAddresses) {
        const result = window.fixAddresses(headers, finalRows);
        headers = result.headers;
        finalRows = result.rows;
      }

      if (actions.createColumn) {
        const result = window.createNewColumn(headers, finalRows);
        headers = result.headers;
        finalRows = result.rows;
      }

      if (actions.splitByColumn) {
        const result = window.splitByColumn(headers, finalRows, actionParams.splitColumn);
        splitGroups = result.groups;
      }

      progressBar.style.width = "100%";
      progressPercent.textContent = "100%";

      resultSummary.textContent =
        `Columns: ${headers.length}\n` +
        `Original rows: ${rows.length}\n` +
        `Final rows: ${finalRows.length}`;

      resultCard.style.display = "block";
      downloadBtn.disabled = false;
      statusText.textContent = "Completed";
    } catch (err) {
      console.error(err);
      alert(err.message || "Action failed on this CSV.");
    }
  };

  reader.readAsText(file);
});

// ======================
// DOWNLOAD
// ======================
downloadBtn.addEventListener("click", () => {
  if (!finalRows.length) return;
  downloadCSV("processed.csv", headers, finalRows);
});
