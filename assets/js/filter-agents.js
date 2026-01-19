const STORAGE_KEY = "csv_agent_keywords";

/* ================= DEFAULT KEYWORDS ================= */
let keywords = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  "remax","sutton","rlp","c21","century","real","realty",
  "exp","kw","coldwell","broker","brokerage","agent","homes"
];

const saveKeywords = () =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));

const normalize = v => (v || "").toString().toLowerCase().trim();

/* ================= CSV PARSER ================= */
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

/* ================= UI HELPERS ================= */
function renderKeywords(container) {
  container.innerHTML = "";
  keywords.forEach((k, i) => {
    const chip = document.createElement("span");
    chip.className = "keyword-chip";
    chip.innerHTML = `${k} ✕`;
    chip.onclick = () => {
      keywords.splice(i, 1);
      saveKeywords();
      renderKeywords(container);
    };
    container.appendChild(chip);
  });
}

function renderPreview(table, headers, rows) {
  table.innerHTML = "";
  if (!rows.length) {
    table.innerHTML = "<tbody><tr><td>No records to preview</td></tr></tbody>";
    return;
  }

  table.innerHTML = `
    <thead>
      <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rows.slice(0,5).map(r =>
        `<tr>${r.map(v => `<td>${v || ""}</td>`).join("")}</tr>`
      ).join("")}
    </tbody>
  `;
}

/* ================= DOWNLOAD ================= */
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

/* ================= MAIN ================= */
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

  let parsedRows = [];
  let headers = [];

  analyzeBtn.disabled = true;
  renderKeywords(keywordList);

  /* ===== FILE UPLOAD ===== */
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const parsed = parseCSV(e.target.result);
      headers = parsed[0];
      parsedRows = parsed.slice(1);

      fileNameEl.textContent = file.name;
      rowCountEl.textContent = parsedRows.length;
      columnCountEl.textContent = headers.length;

      analyzeBtn.disabled = false;
    };
    reader.readAsText(file);
  };

  /* ===== ADD KEYWORD ===== */
  addKeywordBtn.onclick = () => {
    const val = normalize(newKeywordInput.value);
    if (val && !keywords.includes(val)) {
      keywords.push(val);
      saveKeywords();
      renderKeywords(keywordList);
      newKeywordInput.value = "";
    }
  };

  /* ===== ANALYZE ===== */
  analyzeBtn.onclick = () => {
    const agents = [], possible = [], others = [];

    parsedRows.forEach(r => {
      let score = 0;

      r.forEach(cell => {
        keywords.forEach(k => {
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
