const STORAGE_KEY = "ceo-health-lab.entries.v1";

const form = document.getElementById("healthForm");
const entriesList = document.getElementById("entriesList");
const totalEntries = document.getElementById("totalEntries");
const visibleEntries = document.getElementById("visibleEntries");
const lastMember = document.getElementById("lastMember");
const lastDate = document.getElementById("lastDate");
const entryDate = document.getElementById("entryDate");
const memberFilter = document.getElementById("memberFilter");
const typeFilter = document.getElementById("typeFilter");
const resetFiltersButton = document.getElementById("resetFilters");
const copyJsonButton = document.getElementById("copyJson");
const downloadJsonButton = document.getElementById("downloadJson");
const clearDataButton = document.getElementById("clearData");
const statusMessage = document.getElementById("statusMessage");

let entries = loadEntries();
let statusTimerId;

function loadEntries() {
  const storedEntries = window.localStorage.getItem(STORAGE_KEY);

  if (!storedEntries) {
    return [];
  }

  try {
    const parsedEntries = JSON.parse(storedEntries);
    return Array.isArray(parsedEntries) ? parsedEntries.map(normalizeEntry) : [];
  } catch (error) {
    console.warn("Could not parse stored health entries.", error);
    return [];
  }
}

function normalizeEntry(entry) {
  return {
    id: entry.id || createId(),
    createdAt: entry.createdAt || new Date().toISOString(),
    member: entry.member || "",
    entryType: entry.entryType || "weekly_checkin",
    entryDate: entry.entryDate || "",
    metrics: {
      weightKg: normalizeNumber(entry.metrics?.weightKg ?? entry.weightKg),
      waistCm: normalizeNumber(entry.metrics?.waistCm ?? entry.waistCm),
      bodyFatPercent: normalizeNumber(entry.metrics?.bodyFatPercent ?? entry.bodyFatPercent),
      trainingSessions: normalizeNumber(entry.metrics?.trainingSessions ?? entry.trainingSessions),
      sleepHours: normalizeNumber(entry.metrics?.sleepHours ?? entry.sleepHours),
      energy: normalizeNumber(entry.metrics?.energy ?? entry.energy),
      stress: normalizeNumber(entry.metrics?.stress ?? entry.stress),
      pain: normalizeNumber(entry.metrics?.pain ?? entry.pain)
    },
    notes: entry.notes || ""
  };
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isNaN(number) ? null : number;
}

function saveEntries() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getValue(id) {
  return document.getElementById(id).value.trim();
}

function getNumberValue(id) {
  const value = getValue(id);
  return value === "" ? null : Number(value);
}

function setDefaultDate() {
  entryDate.valueAsDate = new Date();
}

function setStatus(message, type = "success") {
  window.clearTimeout(statusTimerId);
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", type === "error");

  statusTimerId = window.setTimeout(function () {
    statusMessage.textContent = "";
    statusMessage.classList.remove("error");
  }, 3500);
}

function createEntry() {
  return {
    id: createId(),
    createdAt: new Date().toISOString(),
    member: getValue("member"),
    entryType: getValue("entryType"),
    entryDate: getValue("entryDate"),
    metrics: {
      weightKg: getNumberValue("weight"),
      waistCm: getNumberValue("waist"),
      bodyFatPercent: getNumberValue("bodyFat"),
      trainingSessions: getNumberValue("trainingSessions"),
      sleepHours: getNumberValue("sleepHours"),
      energy: getNumberValue("energy"),
      stress: getNumberValue("stress"),
      pain: getNumberValue("pain")
    },
    notes: getValue("notes")
  };
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getExportPayload() {
  return {
    product: "CEO Health Lab",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    entryCount: entries.length,
    entries: entries
  };
}

function formatEntryType(entryType) {
  const labels = {
    weekly_checkin: "Check-in semanal",
    body_metrics: "Metricas corporais",
    clinical_intake: "Intake clinico"
  };

  return labels[entryType] || entryType;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-PT").format(new Date(`${dateValue}T00:00:00`));
}

function addTextElement(parent, tagName, text, className) {
  const element = document.createElement(tagName);
  element.textContent = text;

  if (className) {
    element.className = className;
  }

  parent.appendChild(element);
  return element;
}

function addMetric(metricsList, label, value, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return;
  }

  addTextElement(metricsList, "dt", label);
  addTextElement(metricsList, "dd", `${value}${suffix}`);
}

function renderEmptyState() {
  const emptyState = document.createElement("p");
  emptyState.className = "empty-state";
  emptyState.textContent = entries.length === 0 ? "Ainda nao existem registos." : "Nao existem registos para estes filtros.";
  entriesList.appendChild(emptyState);
}

function renderEntry(entry) {
  const item = document.createElement("article");
  item.className = "entry";

  addTextElement(item, "strong", `${entry.member} - ${formatEntryType(entry.entryType)}`);
  addTextElement(item, "small", formatDate(entry.entryDate));

  const metricsList = document.createElement("dl");
  addMetric(metricsList, "Peso", entry.metrics.weightKg, " kg");
  addMetric(metricsList, "Cintura", entry.metrics.waistCm, " cm");
  addMetric(metricsList, "Gordura", entry.metrics.bodyFatPercent, "%");
  addMetric(metricsList, "Treinos", entry.metrics.trainingSessions);
  addMetric(metricsList, "Sono", entry.metrics.sleepHours, " h");
  addMetric(metricsList, "Energia", entry.metrics.energy, "/10");
  addMetric(metricsList, "Stress", entry.metrics.stress, "/10");
  addMetric(metricsList, "Dor", entry.metrics.pain, "/10");

  if (metricsList.children.length > 0) {
    item.appendChild(metricsList);
  }

  addTextElement(item, "p", entry.notes || "Sem observacoes.");

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "text-danger";
  deleteButton.dataset.entryId = entry.id;
  deleteButton.textContent = "Apagar registo";
  item.appendChild(deleteButton);

  entriesList.appendChild(item);
}

function getFilteredEntries() {
  return entries.filter(function (entry) {
    const matchesMember = memberFilter.value === "all" || entry.member === memberFilter.value;
    const matchesType = typeFilter.value === "all" || entry.entryType === typeFilter.value;
    return matchesMember && matchesType;
  });
}

function render() {
  const filteredEntries = getFilteredEntries();

  totalEntries.textContent = entries.length;
  visibleEntries.textContent = filteredEntries.length;
  lastMember.textContent = entries[0] ? entries[0].member : "-";
  lastDate.textContent = entries[0] ? formatDate(entries[0].entryDate) : "-";
  entriesList.replaceChildren();

  if (filteredEntries.length === 0) {
    renderEmptyState();
    return;
  }

  filteredEntries.forEach(renderEntry);
}

function resetForm() {
  form.reset();
  setDefaultDate();
}

async function copyJson() {
  const json = JSON.stringify(getExportPayload(), null, 2);

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(json);
    setStatus("JSON copiado.");
    return;
  }

  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = json;
  tempTextArea.setAttribute("readonly", "");
  tempTextArea.style.position = "absolute";
  tempTextArea.style.left = "-9999px";
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  tempTextArea.remove();
  setStatus("JSON copiado.");
}

function downloadJson() {
  const json = JSON.stringify(getExportPayload(), null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const date = new Date().toISOString().slice(0, 10);
  const link = document.createElement("a");

  link.href = url;
  link.download = `ceo-health-lab-${date}.health-export.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Exportacao JSON criada.");
}

function clearLocalData() {
  if (entries.length === 0) {
    setStatus("Nao existem dados locais para limpar.");
    return;
  }

  const confirmed = window.confirm("Queres apagar todos os registos guardados neste navegador?");

  if (!confirmed) {
    return;
  }

  entries = [];
  window.localStorage.removeItem(STORAGE_KEY);
  render();
  setStatus("Dados locais limpos.");
}

function deleteEntry(entryId) {
  const entry = entries.find(function (item) {
    return item.id === entryId;
  });

  if (!entry) {
    return;
  }

  const confirmed = window.confirm("Queres apagar este registo?");

  if (!confirmed) {
    return;
  }

  entries = entries.filter(function (item) {
    return item.id !== entryId;
  });

  saveEntries();
  render();
  setStatus("Registo apagado.");
}

function resetFilters() {
  memberFilter.value = "all";
  typeFilter.value = "all";
  render();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  entries.unshift(createEntry());
  saveEntries();
  resetForm();
  render();
  setStatus("Registo guardado localmente.");
});

memberFilter.addEventListener("change", render);
typeFilter.addEventListener("change", render);
resetFiltersButton.addEventListener("click", resetFilters);

entriesList.addEventListener("click", function (event) {
  if (!event.target.matches("[data-entry-id]")) {
    return;
  }

  deleteEntry(event.target.dataset.entryId);
});

copyJsonButton.addEventListener("click", function () {
  copyJson().catch(function () {
    setStatus("Nao foi possivel copiar o JSON.", "error");
  });
});

downloadJsonButton.addEventListener("click", downloadJson);
clearDataButton.addEventListener("click", clearLocalData);

setDefaultDate();
render();
