const inputContainer = document.getElementById("inputContainer");
const inputTemplate = document.getElementById("inputCardTemplate");
const addCardBtn = document.getElementById("addCardBtn");
const codeTypeSelect = document.getElementById("codeType");
const jsonPaste = document.getElementById("jsonPaste");
const jsonFile = document.getElementById("jsonFile");
const jsonGenerateBtn = document.getElementById("jsonGenerateBtn");
const jsonClearBtn = document.getElementById("jsonClearBtn");
const jsonError = document.getElementById("jsonError");
const jsonBarcodeMount = document.getElementById("jsonBarcodeMount");
const savedJsonSelect = document.getElementById("savedJsonSelect");
const jsonLoadSavedBtn = document.getElementById("jsonLoadSavedBtn");
const jsonSaveBtn = document.getElementById("jsonSaveBtn");
const jsonDeleteSavedBtn = document.getElementById("jsonDeleteSavedBtn");
const saveShipmentOverride = document.getElementById("saveShipmentOverride");
const jsonSaveStatus = document.getElementById("jsonSaveStatus");

const SAVED_JSON_STORAGE_KEY = "ecolabSavedJsonByShipment";

/** @type {{ label: string, value: string }[] | null} */
let lastJsonEntries = null;

function drawBarcode(outputEl, value, format) {
  outputEl.innerHTML = "";
  const v = String(value ?? "").trim();
  if (!v) return;

  if (format === "QR") {
    const qrHolder = document.createElement("div");
    outputEl.appendChild(qrHolder);
    new QRCode(qrHolder, {
      text: v,
      width: 100,
      height: 100
    });
    return;
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  outputEl.appendChild(svg);
  try {
    JsBarcode(svg, v, {
      format,
      lineColor: "#111827",
      width: 1.35,
      height: 50,
      displayValue: true,
      fontSize: 11,
      margin: 2
    });
  } catch {
    try {
      const qrHolder = document.createElement("div");
      outputEl.appendChild(qrHolder);
      new QRCode(qrHolder, {
        text: v,
        width: 100,
        height: 100
      });
    } catch {
      outputEl.textContent = "Could not encode";
    }
  }
}

function pushField(rows, label, val) {
  if (val === null || val === undefined) return;
  const s = String(val).trim();
  if (!s) return;
  rows.push({ label, value: s });
}

function pushSlashComposite(rows, label, left, right) {
  const a = left != null && String(left).trim() ? String(left).trim() : "";
  const b = right != null && String(right).trim() ? String(right).trim() : "";
  if (!a || !b) return;
  rows.push({ label, value: `${a}/${b}` });
}

/** @param {unknown[]} deliveries */
function nsapDeliveryPrefix(deliveries, del, index) {
  const dn =
    del.DeliveryNumber != null && String(del.DeliveryNumber).trim()
      ? String(del.DeliveryNumber).trim()
      : "";
  const sdid =
    del.ShipmentDeliveryId != null && del.ShipmentDeliveryId !== ""
      ? String(del.ShipmentDeliveryId)
      : "";
  const n = String(index + 1);
  if (dn) return `${n} (#${dn})`;
  if (sdid) return `${n} (delivery id ${sdid})`;
  return n;
}

function unwrapNsapPayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.ShipmentDetail) return raw;
  const keys = Object.keys(raw);
  if (keys.length === 1) {
    const inner = raw[keys[0]];
    if (inner && typeof inner === "object" && inner.ShipmentDetail) return inner;
  }
  return null;
}

function getShipmentNumberFromParsed(data) {
  const nsap = unwrapNsapPayload(data);
  if (!nsap?.ShipmentDetail) return "";
  const sn = nsap.ShipmentDetail.ShipmentNumber;
  if (sn == null) return "";
  return String(sn).trim();
}

function readSavedJsonCatalog() {
  try {
    const raw = localStorage.getItem(SAVED_JSON_STORAGE_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return o && typeof o === "object" && !Array.isArray(o) ? o : {};
  } catch {
    return {};
  }
}

function writeSavedJsonCatalog(catalog) {
  localStorage.setItem(SAVED_JSON_STORAGE_KEY, JSON.stringify(catalog));
}

function refreshSavedJsonSelect() {
  const catalog = readSavedJsonCatalog();
  const keys = Object.keys(catalog);
  savedJsonSelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select saved shipment…";
  savedJsonSelect.appendChild(placeholder);
  keys
    .sort((a, b) => {
      const ta = catalog[a]?.savedAt || "";
      const tb = catalog[b]?.savedAt || "";
      return tb.localeCompare(ta);
    })
    .forEach((key) => {
      const opt = document.createElement("option");
      opt.value = key;
      const at = catalog[key]?.savedAt;
      const when = at ? ` — ${new Date(at).toLocaleString()}` : "";
      opt.textContent = `${key}${when}`;
      savedJsonSelect.appendChild(opt);
    });
}

function showSaveStatus(msg, isError) {
  if (!msg) {
    jsonSaveStatus.hidden = true;
    jsonSaveStatus.textContent = "";
    jsonSaveStatus.classList.remove("is-error");
    return;
  }
  jsonSaveStatus.hidden = false;
  jsonSaveStatus.textContent = msg;
  jsonSaveStatus.classList.toggle("is-error", Boolean(isError));
}

function collectNsapBarcodeRows(payload) {
  const rows = [];
  const detail = payload.ShipmentDetail || null;
  const deliveries = payload.ShipmentDeliveryDetails || [];
  const items = payload.ShipmentDeliveryItemsDetails || [];

  if (detail) {
    pushField(rows, "ShipmentNumber", detail.ShipmentNumber);
  }

  function lineItemsForDelivery(del) {
    return items
      .filter((it) => it.ShipmentDeliveryId == del.ShipmentDeliveryId)
      .sort((a, b) => {
        const la = Number.parseFloat(String(a.LineNumber ?? "").trim());
        const lb = Number.parseFloat(String(b.LineNumber ?? "").trim());
        const na = Number.isFinite(la) ? la : 0;
        const nb = Number.isFinite(lb) ? lb : 0;
        if (na !== nb) return na - nb;
        return (Number(a.ShipmentDeliveryItemId) || 0) - (Number(b.ShipmentDeliveryItemId) || 0);
      });
  }

  function showCompartmentBatchForContainerType(it) {
    const t =
      it.ContainerType != null ? String(it.ContainerType).trim().toUpperCase() : "";
    return t !== "BULK";
  }

  /** Classify line barcodes by ShipmentDeliveryItemId (fallback: LineNumber, then unspecified). */
  function nsapItemClassPrefix(it) {
    if (it.ShipmentDeliveryItemId != null && String(it.ShipmentDeliveryItemId).trim() !== "") {
      return `ShipmentDeliveryItemId ${String(it.ShipmentDeliveryItemId).trim()}`;
    }
    if (it.LineNumber != null && String(it.LineNumber).trim() !== "") {
      return `LineNumber ${String(it.LineNumber).trim()}`;
    }
    return "ShipmentDeliveryItemId (unspecified)";
  }

  function pushNsapLineFields(deliveryPrefix, it) {
    const prefix = `${deliveryPrefix} — ${nsapItemClassPrefix(it)}`;
    pushField(rows, `${prefix} — CompartmentBottomSeal`, it.CompartmentBottomSeal);
    pushField(rows, `${prefix} — CompartmentEVDSeal`, it.CompartmentEVDSeal);
    if (showCompartmentBatchForContainerType(it)) {
      pushField(rows, `${prefix} — CompartmentBatch`, it.CompartmentBatch);
    }
    pushField(rows, `${prefix} — StorageUnitNumber`, it.StorageUnitNumber);
    pushField(rows, `${prefix} — GTIN`, it.GTIN);
    pushField(rows, `${prefix} — EANNumber`, it.EANNumber);
    pushField(rows, `${prefix} — YSLDPackageCode`, it.YSLDPackageCode);
    pushField(rows, `${prefix} — ProductNumber`, it.ProductNumber);
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/ProductNumber`,
      it.EquipmentNumber,
      it.ProductNumber
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/EANNumber`,
      it.EquipmentNumber,
      it.EANNumber
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/GTIN`,
      it.EquipmentNumber,
      it.GTIN
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/FormulaCode`,
      it.EquipmentNumber,
      it.FormulaCode
    );
  }

  deliveries.forEach((del, index) => {
    const p = nsapDeliveryPrefix(deliveries, del, index);

    pushField(rows, `${p} — DeliveryNumber`, del.DeliveryNumber);

    for (const it of lineItemsForDelivery(del)) {
      pushNsapLineFields(p, it);
    }
  });

  const assigned = new Set();
  for (const del of deliveries) {
    if (del.ShipmentDeliveryId != null) assigned.add(String(del.ShipmentDeliveryId));
  }
  for (const it of items) {
    const sid = it.ShipmentDeliveryId;
    if (sid != null && assigned.has(String(sid))) continue;
    const orphan = `Unmatched line (ShipmentDeliveryId ${sid ?? "none"})`;
    pushField(rows, `${orphan} — DeliveryNumber`, it.DeliveryNumber);
    pushNsapLineFields(orphan, it);
  }

  return dedupeRows(rows);
}

function dedupeRows(rows) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const key = `${r.label}\0${r.value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function collectGenericJsonRows(data, maxLeaves = 120) {
  const rows = [];
  function walk(node, path) {
    if (rows.length >= maxLeaves) return;
    if (node === null || node === undefined) return;
    const t = typeof node;
    if (t === "string" || t === "number" || t === "boolean") {
      const s = String(node).trim();
      if (s.length > 0 && s.length <= 200) {
        rows.push({ label: path || "value", value: s });
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((item, i) => {
        if (rows.length >= maxLeaves) return;
        walk(item, path ? `${path}[${i}]` : `[${i}]`);
      });
      return;
    }
    if (t === "object") {
      for (const k of Object.keys(node)) {
        if (rows.length >= maxLeaves) return;
        walk(node[k], path ? `${path}.${k}` : k);
      }
    }
  }
  walk(data, "");
  return dedupeRows(rows);
}

function extractBarcodeRowsFromJson(data) {
  const nsap = unwrapNsapPayload(data);
  if (nsap) return collectNsapBarcodeRows(nsap);
  return collectGenericJsonRows(data);
}

function showJsonError(msg) {
  jsonError.hidden = false;
  jsonError.textContent = msg;
}

function clearJsonError() {
  jsonError.hidden = true;
  jsonError.textContent = "";
}

function renderJsonBarcodeGrid(entries) {
  jsonBarcodeMount.innerHTML = "";
  const format = codeTypeSelect.value;
  for (const { label, value } of entries) {
    const row = document.createElement("div");
    row.className = "json-barcode-row";
    const lab = document.createElement("div");
    lab.className = "json-barcode-label";
    lab.textContent = label;
    const out = document.createElement("div");
    out.className = "json-barcode-output";
    drawBarcode(out, value, format);
    row.append(lab, out);
    jsonBarcodeMount.appendChild(row);
  }
}

function runJsonGenerate() {
  clearJsonError();
  jsonBarcodeMount.innerHTML = "";
  lastJsonEntries = null;

  let text = jsonPaste.value.trim();
  if (!text && jsonFile.files && jsonFile.files[0]) {
    const file = jsonFile.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const fileText = String(reader.result || "");
        jsonPaste.value = fileText;
        const data = JSON.parse(fileText);
        lastJsonEntries = extractBarcodeRowsFromJson(data);
        if (!lastJsonEntries.length) {
          showJsonError("No string values found to encode.");
          return;
        }
        renderJsonBarcodeGrid(lastJsonEntries);
      } catch {
        showJsonError("Invalid JSON in file.");
      }
    };
    reader.onerror = () => showJsonError("Could not read file.");
    reader.readAsText(file, "UTF-8");
    return;
  }

  if (!text) {
    showJsonError("Paste JSON or choose a file.");
    return;
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    showJsonError("Invalid JSON.");
    return;
  }

  lastJsonEntries = extractBarcodeRowsFromJson(data);
  if (!lastJsonEntries.length) {
    showJsonError("No string values found to encode.");
    return;
  }
  renderJsonBarcodeGrid(lastJsonEntries);
}

function addInputCard() {
  const node = inputTemplate.content.cloneNode(true);
  const card = node.querySelector(".input-card");
  const input = node.querySelector(".code-input");
  const output = node.querySelector(".output");
  const modeButtons = [...node.querySelectorAll(".mode-btn")];

  let mode = "BC";

  function renderOutput() {
    const value = input.value.trim();
    output.innerHTML = "";
    if (!value) return;
    const format =
      mode === "QR" || codeTypeSelect.value === "QR" ? "QR" : codeTypeSelect.value;
    drawBarcode(output, value, format);
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      mode = btn.dataset.mode;
      renderOutput();
    });
  });

  input.addEventListener("input", renderOutput);

  inputContainer.appendChild(card);
}

addCardBtn.addEventListener("click", addInputCard);

jsonGenerateBtn.addEventListener("click", runJsonGenerate);

jsonClearBtn.addEventListener("click", () => {
  clearJsonError();
  jsonBarcodeMount.innerHTML = "";
  lastJsonEntries = null;
});

jsonSaveBtn.addEventListener("click", () => {
  showSaveStatus("");
  const text = jsonPaste.value.trim();
  if (!text) {
    showSaveStatus("Paste or load JSON before saving.", true);
    return;
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    showSaveStatus("Invalid JSON — fix syntax before saving.", true);
    return;
  }
  let key = getShipmentNumberFromParsed(data);
  const override = saveShipmentOverride.value.trim();
  if (!key && override) key = override;
  if (!key) {
    showSaveStatus(
      "No ShipmentNumber in JSON. Add ShipmentDetail.ShipmentNumber or use the override field.",
      true
    );
    return;
  }
  let normalized;
  try {
    normalized = JSON.stringify(data);
  } catch {
    showSaveStatus("Could not serialize JSON.", true);
    return;
  }
  const catalog = readSavedJsonCatalog();
  catalog[key] = { text: normalized, savedAt: new Date().toISOString() };
  try {
    writeSavedJsonCatalog(catalog);
  } catch {
    showSaveStatus("Could not save (storage may be full).", true);
    return;
  }
  refreshSavedJsonSelect();
  savedJsonSelect.value = key;
  showSaveStatus(`Saved under shipment number “${key}”.`);
});

jsonLoadSavedBtn.addEventListener("click", () => {
  showSaveStatus("");
  const key = savedJsonSelect.value;
  if (!key) {
    showSaveStatus("Choose a saved shipment from the list.", true);
    return;
  }
  const entry = readSavedJsonCatalog()[key];
  if (!entry?.text) {
    showSaveStatus("That entry is missing — try refreshing the page.", true);
    refreshSavedJsonSelect();
    return;
  }
  jsonPaste.value = entry.text;
  runJsonGenerate();
  showSaveStatus(`Loaded “${key}” and regenerated barcodes.`);
});

jsonDeleteSavedBtn.addEventListener("click", () => {
  showSaveStatus("");
  const key = savedJsonSelect.value;
  if (!key) {
    showSaveStatus("Choose a saved shipment to delete.", true);
    return;
  }
  if (!window.confirm(`Remove saved JSON for “${key}”?`)) return;
  const catalog = readSavedJsonCatalog();
  delete catalog[key];
  writeSavedJsonCatalog(catalog);
  refreshSavedJsonSelect();
  showSaveStatus(`Deleted “${key}”.`);
});

codeTypeSelect.addEventListener("change", () => {
  document.querySelectorAll(".input-card .code-input").forEach((inp) => {
    inp.dispatchEvent(new Event("input"));
  });
  if (lastJsonEntries && lastJsonEntries.length) {
    renderJsonBarcodeGrid(lastJsonEntries);
  }
});

refreshSavedJsonSelect();

for (let i = 0; i < 6; i += 1) addInputCard();
