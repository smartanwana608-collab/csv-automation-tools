// ======================
// PROMPT ENGINE — FINAL V5 (SMART PARAMETERS)
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
    createColumn: "Create a new column",
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

  // Extract House Numbers → needs address column
  if (actions.extractHouseNumbers) {
    needsParams = true;

    const label = document.createElement("label");
    label.textContent = "Select address column:";
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
      actionParams.addressColumn = select.value;
      updateRunButton();
    });

    actionParamsFields.appendChild(label);
    actionParamsFields.appendChild(select);
  }

  // Create Column → needs column name
  if (actions.createColumn) {
    needsParams = true;

    const label = document.createElement("label");
    label.textContent = "New column name:";
    label.style.display = "block";

    const input = document.createElement("input");
    input.placeholder = "e.g. Source Tag";
    input.style.width = "100%";
    input.style.padding = "10px";

    input.addEventListener("input", () => {
      actionParams.newColumnName = input.value.trim();
      updateRunButton();
    });

    actionParamsFields.appendChild(label);
    actionParamsFields.appendChild(input);
  }

  actionParamsCard.style.display = needsParams ? "block" : "none";
}

// ======================
// ENABLE RUN BUTTON
// ======================
function updateRunButton() {
  const hasPrompt = promptInput.value.trim();
  const hasFile = fileInput.files.length;

  const missingParams =
    ("extractHouseNumbers" in actionParams && !actionParams.addressColumn) ||
    ("createColumn" in actionParams && !actionParams.newColumnName);

  runBtn.disabled = !(hasPrompt && hasFile) || missingParams;
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

fileInput.addEventListener("change", () => {
  updateRunButton();
});

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

    if (actions.filterRealEstate) {
      finalRows = window.filterRealEstateAgents(headers, finalRows).agents;
    }

    if (actions.removeMissingEmail) {
      finalRows = window.removeMissingEmail(headers, finalRows).withEmail;
    }

    if (actions.removeDuplicates) {
      finalRows = window.removeDuplicates(headers, finalRows).rows;
    }

    if (actions.extractHouseNumbers) {
      const res = window.extractHouseNumbers(headers, finalRows);
      headers = res.headers;
      finalRows = res.rows;
    }

    if (actions.createColumn) {
      const res = window.createNewColumn(headers, finalRows);
      headers = res.headers;
      finalRows = res.rows;
    }

    progressBar.style.width = "100%";
    progressPercent.textContent = "100%";

    resultSummary.textContent =
      `Columns: ${headers.length}\nOriginal rows: ${rows.length}\nFinal rows: ${finalRows.length}`;

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
