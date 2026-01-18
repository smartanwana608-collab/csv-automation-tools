// ================================
// PROMPT ENGINE — STABLE V1
// ================================

const promptInput = document.getElementById("promptInput");
const csvFileInput = document.getElementById("csvFile");
const runBtn = document.getElementById("runBtn");
const statusBox = document.getElementById("statusBox");
const statusText = document.getElementById("statusText");
const resultCard = document.getElementById("resultCard");
const resultSummary = document.getElementById("resultSummary");

let parsedHeaders = [];
let parsedRows = [];

// Enable run when CSV is selected
csvFileInput.addEventListener("change", () => {
  runBtn.disabled = !csvFileInput.files.length;
});

// Parse CSV
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines.shift().split(",");
  const rows = lines.map(l => l.split(","));
  return { headers, rows };
}

// Handle run
runBtn.addEventListener("click", () => {
  try {
    statusBox.style.display = "block";
    statusText.textContent = "Processing...";

    const prompt = promptInput.value.toLowerCase();

    if (!window.filterRealEstateAgents) {
      throw new Error("filterRealEstateAgents not loaded");
    }

    const file = csvFileInput.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const { headers, rows } = parseCSV(reader.result);

      let result = { headers, rows };

      if (prompt.includes("filter real estate")) {
        result = window.filterRealEstateAgents(headers, rows);
      }

      resultCard.style.display = "block";
      resultSummary.textContent = JSON.stringify(result.meta || {}, null, 2);
      statusText.textContent = "Completed";
    };

    reader.readAsText(file);

  } catch (err) {
    console.error(err);
    alert("An error occurred while applying actions.");
    statusText.textContent = "Error";
  }
});
