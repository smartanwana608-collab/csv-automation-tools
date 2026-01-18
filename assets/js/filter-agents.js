// ===== CONFIG =====
const AGENT_KEYWORDS = [
  "realtor",
  "realty",
  "broker",
  "brokerage",
  "kw",
  "coldwell",
  "century",
  "sotheby",
  "property",
  "estate"
];

// ===== HELPERS =====
function isAgentEmail(email) {
  if (!email) return false;
  const lower = email.toLowerCase();
  return AGENT_KEYWORDS.some(keyword => lower.includes(keyword));
}

function isRealEstateAgent(row, emailIndexes) {
  return emailIndexes.some(index => {
    const value = row[index];
    return isAgentEmail(value);
  });
}

// ===== MAIN =====
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.querySelector('input[type="file"]');
  const analyzeBtn = document.querySelector(".btn");

  const fileNameEl = document.getElementById("fileName");
  const rowCountEl = document.getElementById("rowCount");
  const columnCountEl = document.getElementById("columnCount");

  const resultBoxes = document.querySelectorAll(".result-box strong");

  let headers = [];
  let parsedRows = [];
  let agents = [];
  let nonAgents = [];

  fileInput.addEventListener("change", () => {
    if (!fileInput.files.length) return;

    const file = fileInput.files[0];

    fileNameEl.textContent = `File name: ${file.name}`;

    analyzeBtn.classList.add("enabled");
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze CSV";
    analyzeBtn.style.opacity = "1";
    analyzeBtn.style.cursor = "pointer";
  });

  analyzeBtn.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) return;

    analyzeBtn.textContent = "Analyzing…";
    analyzeBtn.disabled = true;
    analyzeBtn.style.opacity = "0.6";

    const reader = new FileReader();

    reader.onload = e => {
      const text = e.target.result;
      const rows = text.trim().split("\n").map(r => r.split(","));

      headers = rows[0];
      parsedRows = rows.slice(1);

      rowCountEl.textContent = `Total rows: ${parsedRows.length}`;
      columnCountEl.textContent = `Detected columns: ${headers.length}`;

      const emailIndexes = headers
        .map((h, i) => ({ h: h.toLowerCase(), i }))
        .filter(obj => obj.h.includes("email"))
        .map(obj => obj.i);

      agents = [];
      nonAgents = [];

      parsedRows.forEach(row => {
        if (isRealEstateAgent(row, emailIndexes)) {
          agents.push(row);
        } else {
          nonAgents.push(row);
        }
      });

      resultBoxes[0].textContent = agents.length;
      resultBoxes[1].textContent = nonAgents.length;

      analyzeBtn.textContent = "Analysis Complete";
    };

    reader.readAsText(file);
  });
});
