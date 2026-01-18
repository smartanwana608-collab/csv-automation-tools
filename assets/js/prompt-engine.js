// ======================
// PROMPT ENGINE — FINAL V6 (SPLIT BY COLUMN)
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
let actionParams = {};

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
    filterRealEstate: p.includes("filter real estate"),
    removeMissingEmail: p.includes("missing email"),
    removeDuplicates: p.includes("duplicate"),
    extractHouseNumbers: p.includes("house"),
    createColumn: p.includes("new column"),
    splitByColumn: p.includes("split"),
  };
}

// ======================
// DETECTED ACTIONS UI
// ======================
function renderDetectedActions(actions) {
  detectedActionsList.innerHTML = "";

  const labels = {
    filterRealEstate: "Filter real estate agents",
    removeMissingEmail: "Remove rows missing email",
    removeDuplicates: "Remove duplicate contacts",
    extractHouseNumbers: "Extract house numbers",
    createColumn: "Create a new column",
    splitByColumn: "Split CSV by column",
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
// ACTION PARAMETERS UI
// ======================
function renderActionParams(actions) {
  actionParamsFields.innerHTML = "";
  actionParams = {};

  let needsParams = false;

  // SPLIT BY COLUMN
  if (actions.splitByColumn) {
    needsParams = true;

    const label = document.createElement("label");
    label.textContent = "Select column to split by:";
    label.style.display = "block";

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
  }

  actionParamsCard.style.display = needsParams ? "block" : "none";
}

// ======================
// ENABLE RUN BUTTON
// ======================
function updateRunButton() {
  const hasPrompt = promptInput.value.trim();
  const hasFile = fileInput.files.length;

  const missingSplit =
    detectActions(promptInput.value.trim()).splitByColumn &&
    !actionParams.splitColumn;

  runBtn.disabled = !(hasPrompt && hasFile) || missingSplit;
  runBtn.classList.toggle("enabled", !runBtn.disabled);
}

// ======================
// EVENTS
// ======================
promptInput.addEventListener("input", () => {
  const actions = detectActions(promptInput.value.trim());
  renderDetectedActions(actions);
  renderActionParams(actions);
  updateRunButton();
});

fileInput.addEventListener("change", updateRunButton);

// ======================
// RUN PROMPT
// ======================
runBtn.addEventListener("click", () => {
  const reader = new FileReader();

  statusBox.style.display = "block";
  statusText.textContent = "Processing CSV…";
  progressBar.style.width = "20%";
  progressPercent.textContent = "20%";

  reader.onload = e => {
    parseCSV(e.target.result);

    previewCard.style.display = "block";
    renderCSVPreview(csvPreviewTable, headers, rows);

    finalRows = [...rows];
    const actions = detectActions(promptInput.value.trim());

    // SPLIT BY COLUMN (SAFE DEFAULT OUTPUT)
    if (actions.splitByColumn) {
      const result = window.splitByColumn(headers, finalRows, actionParams.splitColumn);

      // Take the largest group for now
      const largestGroup = Object.values(result.groups)
        .sort((a, b) => b.length - a.length)[0];

      finalRows = largestGroup || [];
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
  };

  reader.readAsText(fileInput.files[0]);
});

// ======================
// DOWNLOAD
// ======================
downloadBtn.addEventListener("click", () => {
  const csv = [headers, ...finalRows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "processed.csv";
  a.click();
  URL.revokeObjectURL(url);
});
