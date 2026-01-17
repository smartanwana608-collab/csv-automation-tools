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

// ===== MAIN LOGIC =====
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.querySelector('input[type="file"]');
  const analyzeBtn = document.querySelector(".btn");
  const resultBoxes = document.querySelectorAll(".result-box strong");

  let parsedRows = [];
  let headers = [];
  let agents = [];
  let nonAgents = [];

  fileInput.addEventListener("change", () => {
    analyzeBtn.classList.add("enabled");
    analyzeBtn.disabled = false;
    analyzeBtn.style.cursor = "pointer";
    analyzeBtn.style.opacity = "1";
  });

  analyzeBtn.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = e => {
      const text = e.target.result;
      const rows = text.trim().split("\n").map(r => r.split(","));

      headers = rows[0];
      parsedRows = rows.slice(1);

      // Detect email-related columns
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

      // Update UI counts
      resultBoxes[0].textContent = agents.length;
      resultBoxes[1].textContent = nonAgents.length;

      console.log("Agents:", agents);
      console.log("Non-agents:", nonAgents);
    };

    reader.readAsText(file);
  });
});
