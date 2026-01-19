// js/prompt-engine.js

import { filterRealEstate } from "../actions/filter-real-estate.js";

let parsedRows = [];

const ACTIONS = [
  {
    name: "filter real estate",
    handler: filterRealEstate,
    aliases: [
      "filter real estate",
      "real estate",
      "realty",
      "agents",
      "brokerage"
    ]
  }
];

function normalize(text) {
  return text.toLowerCase().trim();
}

function matchAction(prompt) {
  const input = normalize(prompt);

  for (const action of ACTIONS) {
    if (
      action.aliases.some(alias => input.includes(alias))
    ) {
      return action;
    }
  }

  return null;
}

function renderResults(result) {
  const container = document.getElementById("promptResults");
  container.innerHTML = "";

  const section = document.createElement("div");
  section.className = "tool-card";

  section.innerHTML = `
    <h2>${result.title}</h2>
    <p>${result.summary}</p>

    <h3>Real Estate Agents</h3>
    ${renderTable(result.preview.agents)}

    <h3>Possible Agents</h3>
    ${renderTable(result.preview.possibleAgents)}

    <h3>Other Contacts</h3>
    ${renderTable(result.preview.others)}

    <div class="download-actions">
      <button class="btn primary" onclick="downloadCSV('agents')">Download Agents CSV</button>
      <button class="btn secondary" onclick="downloadCSV('possibleAgents')">Download Possible CSV</button>
      <button class="btn secondary" onclick="downloadCSV('others')">Download Others CSV</button>
    </div>
  `;

  container.appendChild(section);

  window.__DOWNLOAD_DATA__ = result.downloads;
}

function renderTable(rows) {
  if (!rows.length) return "<p>No rows</p>";

  const headers = Object.keys(rows[0]);

  return `
    <div class="table-wrap">
      <table class="preview-table">
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              row =>
                `<tr>${headers
                  .map(h => `<td>${row[h] ?? ""}</td>`)
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

window.downloadCSV = function (type) {
  const rows = window.__DOWNLOAD_DATA__[type];
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${type}.csv`;
  a.click();

  URL.revokeObjectURL(url);
};

document.addEventListener("DOMContentLoaded", () => {
  const runBtn = document.getElementById("runPromptBtn");
  const promptInput = document.getElementById("promptInput");

  runBtn.addEventListener("click", () => {
    const action = matchAction(promptInput.value);

    if (!action) {
      document.getElementById("promptResults").innerHTML = `
        <div class="tool-card">
          <p>
            We don’t have an action for that yet.<br />
            Try one of the available actions below.
          </p>
        </div>
      `;
      return;
    }

    const result = action.handler(parsedRows);
    renderResults(result);
  });

  document.addEventListener("csvParsed", e => {
    parsedRows = e.detail.rows;
  });
});
