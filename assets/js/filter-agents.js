// assets/js/filter-agents.js

const analyzeBtn = document.getElementById("analyzeBtn");
const fileInput = document.getElementById("csvFile");

let parsedData = [];
let headers = [];

const AGENT_KEYWORDS = [
  "realty",
  "realtor",
  "realestate",
  "property",
  "broker",
  "kw",
  "coldwell",
  "century",
  "sotheby",
  "exp",
  "remax"
];

analyzeBtn.addEventListener("click", () => {
  if (!fileInput.files.length) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const text = e.target.result.trim();
    const rows = text.split("\n").map(r => r.split(","));

    headers = rows[0];
    parsedData = rows.slice(1);

    let agentCount = 0;
    let nonAgentCount = 0;

    parsedData.forEach(row => {
      const rowText = row.join(" ").toLowerCase();

      const isAgent = AGENT_KEYWORDS.some(keyword =>
        rowText.includes(keyword)
      );

      if (isAgent) {
        agentCount++;
      } else {
        nonAgentCount++;
      }
    });

    alert(
      `Analysis Complete\n\n` +
      `Total Rows: ${parsedData.length}\n` +
      `Real Estate Agents: ${agentCount}\n` +
      `Non-Agents: ${nonAgentCount}`
    );
  };

  reader.readAsText(file);
});
