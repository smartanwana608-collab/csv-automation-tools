const STORAGE_KEY = "csv_agent_keywords";

/* =====================================================
SYSTEM KEYWORDS (INVISIBLE TO USER)
===================================================== */
const SYSTEM_KEYWORDS = [
  "remax","sutton","rlp","c21","century","real","realty",
  "exp","kw","coldwell","broker","brokerage","agent","homes"
];

let userKeywords = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const saveUserKeywords = () =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userKeywords));

const normalize = v => (v || "").toString().toLowerCase().trim();

/* =====================================================
CSV PARSER
===================================================== */
function parseCSV(text) {
  const rows = [];
  let row = [], val = "", inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];

    if (c === '"' && inQuotes && n === '"') {
      val += '"'; i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      row.push(val); val = "";
    } else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (row.length || val) {
        row.push(val);
        rows.push(row);
        row = []; val = "";
      }
    } else {
      val += c;
    }
  }

  if (row.length || val) {
    row.push(val);
    rows.push(row);
  }

  return rows;
}

/* =====================================================
UI HELPERS
===================================================== */
function renderUserKeywords(container) {
  container.innerHTML = "";
  userKeywords.forEach((k, i) => {
    const chip = document.createElement("span");
    chip.className = "keyword-chip";
    chip.textContent = k + " ×";
    chip.onclick = () => {
      userKeywords.splice(i, 1);
      saveUserKeywords();
      renderUserKeywords(container);
    };
    container.appendChild(chip);
  });
}

function renderPreview(table, headers, rows) {
  table.innerHTML = "";

  if (!rows.length) {
    table.innerHTML = `
      <tbody>
        <tr><td>No records to preview</td></tr>
      </tbody>`;
    return;
  }

  table.innerHTML = `
    <thead>
      <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rows.slice(0, 5).map(r =>
        `<tr>${r.map(v => `<td>${v || ""}</td>`).join("")}</tr>`
      ).join("")}
    </tbody>
  `;
}

function downloadCSV(filename, headers, rows) {
  const escape = v => `"${(v ?? "").toString().replace(/"/g, '""')}"`;
  const csv = [
    headers.map(escape).join(","),
    ...rows.map(r => r.map(escape).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/* =====================================================
MAIN
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  const fileInput = $("csvFile");
  const analyzeBtn = $("analyzeBtn");

  const fileNameEl = $("fileName");
  const rowCountEl = $("rowCount");
  const columnCountEl = $("columnCount");

  const agentCount = $("agentCount");
  const possibleCount = $("possibleCount");
  const otherCount = $("otherCount");

  const agentsTable = $("agentsPreviewTable");
  const possibleTable = $("possiblePreviewTable");
  const othersTable = $("othersPreviewTable");

  const downloadAgents = $("downloadAgents");
  const downloadPossible = $("downloadPossible");
  const downloadOthers = $("downloadOthers");

  const keywordList = $("keywordList");
  const addKeywordBtn = $("addKeywordBtn");
  const newKeywordInput = $("newKeyword");

  const modal = $("disclaimerModal");
  const accept = $("disclaimerAccept");
  const cancel = $("disclaimerCancel");

  let headers = [];
  let rows = [];
  let disclaimerAccepted = false;

  analyzeBtn.disabled = true;
  renderUserKeywords(keywordList);

  /* ================= DISCLAIMER ================= */
  accept.onclick = () => {
    disclaimerAccepted = true;
    modal.classList.remove("show");
  };

  cancel.onclick = () => {
    modal.classList.remove("show");
    fileInput.value = "";
    analyzeBtn.disabled = true;
  };

  /* ================= FILE UPLOAD ================= */
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;

    modal.classList.add("show");

    const reader = new FileReader();
    reader.onload = e => {
      const parsed = parseCSV(e.target.result);
      headers = parsed[0] || [];
      rows = parsed.slice(1);

      fileNameEl.textContent = `File: ${file.name}`;
      rowCountEl.textContent = `Rows: ${rows.length}`;
      columnCountEl.textContent = `Columns: ${headers.length}`;

      analyzeBtn.disabled = false;
    };
    reader.readAsText(file);
  };

  /* ================= ADD USER KEYWORD ================= */
  addKeywordBtn.onclick = () => {
    const val = normalize(newKeywordInput.value);
    if (val && !userKeywords.includes(val)) {
      userKeywords.push(val);
      saveUserKeywords();
      renderUserKeywords(keywordList);
      newKeywordInput.value = "";
    }
  };

  /* ================= ANALYZE ================= */
  analyzeBtn.onclick = () => {
    if (!disclaimerAccepted) {
      modal.classList.add("show");
      return;
    }

    const agents = [];
    const possible = [];
    const others = [];

    const allKeywords = [...SYSTEM_KEYWORDS, ...userKeywords];

    rows.forEach(r => {
      let score = 0;

      r.forEach(cell => {
        allKeywords.forEach(k => {
          if (normalize(cell).includes(k)) score++;
        });
      });

      if (score >= 3) agents.push(r);
      else if (score === 2) possible.push(r);
      else others.push(r);
    });

    agentCount.textContent = agents.length;
    possibleCount.textContent = possible.length;
    otherCount.textContent = others.length;

    renderPreview(agentsTable, headers, agents);
    renderPreview(possibleTable, headers, possible);
    renderPreview(othersTable, headers, others);

    downloadAgents.onclick = () =>
      downloadCSV("agents.csv", headers, agents);
    downloadPossible.onclick = () =>
      downloadCSV("possible_agents.csv", headers, possible);
    downloadOthers.onclick = () =>
      downloadCSV("other_contacts.csv", headers, others);
  };
});
