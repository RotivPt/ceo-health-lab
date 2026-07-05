const form = document.getElementById("healthForm");
const entriesList = document.getElementById("entriesList");
const totalEntries = document.getElementById("totalEntries");
const lastMember = document.getElementById("lastMember");
const lastDate = document.getElementById("lastDate");
const entryDate = document.getElementById("entryDate");
const entries = [];

entryDate.valueAsDate = new Date();

function getValue(id) {
  return document.getElementById(id).value;
}

function render() {
  totalEntries.textContent = entries.length;
  lastMember.textContent = entries[0] ? entries[0].member : "—";
  lastDate.textContent = entries[0] ? entries[0].entryDate : "—";
  entriesList.innerHTML = "";

  if (entries.length === 0) {
    entriesList.innerHTML = '<p class="muted">Ainda não existem registos.</p>';
    return;
  }

  entries.forEach(function (entry) {
    const item = document.createElement("div");
    item.className = "entry";
    item.innerHTML = `<strong>${entry.member} · ${entry.entryType}</strong><small>${entry.entryDate}</small><p>${entry.notes || "Sem observações."}</p>`;
    entriesList.appendChild(item);
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  entries.unshift({
    member: getValue("member"),
    entryType: getValue("entryType"),
    entryDate: getValue("entryDate"),
    weightKg: getValue("weight"),
    waistCm: getValue("waist"),
    bodyFatPercent: getValue("bodyFat"),
    trainingSessions: getValue("trainingSessions"),
    sleepHours: getValue("sleepHours"),
    energy: getValue("energy"),
    stress: getValue("stress"),
    pain: getValue("pain"),
    notes: getValue("notes")
  });
  form.reset();
  entryDate.valueAsDate = new Date();
  render();
});

render();
