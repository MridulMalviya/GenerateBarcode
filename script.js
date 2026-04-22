const codeTypeSelect = document.getElementById("codeType");
const jsonPaste = document.getElementById("jsonPaste");
const jsonFile = document.getElementById("jsonFile");
const jsonFileRemarks = document.getElementById("jsonFileRemarks");
const jsonFileMetaName = document.getElementById("jsonFileMetaName");
const jsonFileMetaSize = document.getElementById("jsonFileMetaSize");
const jsonGenerateBtn = document.getElementById("jsonGenerateBtn");
const jsonClearBtn = document.getElementById("jsonClearBtn");
const jsonExportSelect = document.getElementById("jsonExportSelect");
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
      fontOptions: "bold",
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
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/YSLDPackageCode`,
      it.EquipmentNumber,
      it.YSLDPackageCode
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

function collectPlainTextRows(text) {
  const lines = String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  return dedupeRows(
    lines.map((value, index) => ({
      label: lines.length === 1 ? "Input value" : `Input value ${index + 1}`,
      value
    }))
  );
}

function showJsonError(msg) {
  jsonError.hidden = false;
  jsonError.textContent = msg;
}

function clearJsonError() {
  jsonError.hidden = true;
  jsonError.textContent = "";
}

/** Field kind for color grouping: text after last " — ", else last path segment, else whole label. */
function jsonBarcodeGroupKey(label) {
  const s = String(label || "").trim();
  if (!s) return "unknown";
  const sep = " — ";
  const idx = s.lastIndexOf(sep);
  if (idx >= 0) {
    const tail = s.slice(idx + sep.length).trim();
    return tail || s;
  }
  const dot = s.lastIndexOf(".");
  if (dot >= 0) {
    const leaf = s.slice(dot + 1).trim();
    if (leaf) return leaf;
  }
  return s;
}

/** Fixed hues for NSAP / known field kinds so each type stays visually distinct (no accidental hash collisions). */
const BARCODE_GROUP_HUES = {
  ShipmentNumber: 205,
  DeliveryNumber: 230,
  CompartmentBottomSeal: 278,
  CompartmentEVDSeal: 302,
  CompartmentBatch: 325,
  StorageUnitNumber: 38,
  GTIN: 152,
  EANNumber: 172,
  YSLDPackageCode: 192,
  ProductNumber: 58,
  "EquipmentNumber/ProductNumber": 14,
  "EquipmentNumber/EANNumber": 108,
  "EquipmentNumber/GTIN": 128,
  "EquipmentNumber/FormulaCode": 2,
  "EquipmentNumber/YSLDPackageCode": 340
};

/**
 * Block key for row spacing: shipment, delivery header rows, or one line per ShipmentDeliveryItemId / LineNumber.
 */
function jsonBarcodeBlockKey(label) {
  const s = String(label || "").trim();
  if (!s) return "|empty";
  if (!s.includes(" — ")) return "^shipment";
  const parts = s.split(" — ");
  const d = parts[0].trim();
  if (parts.length === 2) return `${d}|D`;
  const mid = parts[1].trim();
  const im = mid.match(/^ShipmentDeliveryItemId\s+(\S+)/);
  if (im) return `${d}|I|${im[1]}`;
  const lm = mid.match(/^LineNumber\s+(\S+)/);
  if (lm) return `${d}|L|${lm[1]}`;
  if (mid.startsWith("ShipmentDeliveryItemId (unspecified)")) return `${d}|I|?`;
  return `${d}|M|${mid.slice(0, 48)}`;
}

/** Gap between rows only when leaving one item (or delivery/stop) block for another; not between D → first item. */
function shouldInsertBarcodeItemGap(prevBlock, currBlock) {
  if (prevBlock === null || prevBlock === currBlock) return false;
  if (prevBlock === "^shipment") return false;
  if (prevBlock.endsWith("|D")) {
    const prefix = prevBlock.slice(0, -2);
    if (currBlock.startsWith(`${prefix}|I|`) || currBlock.startsWith(`${prefix}|L|`)) return false;
  }
  return true;
}

function hueForBarcodeGroup(key) {
  if (Object.prototype.hasOwnProperty.call(BARCODE_GROUP_HUES, key)) {
    return BARCODE_GROUP_HUES[key];
  }
  let h = 5381;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 33) ^ key.charCodeAt(i);
  }
  return Math.abs(h) % 360;
}

function updateJsonExportSelect() {
  const hasBarcodes = Boolean(lastJsonEntries && lastJsonEntries.length > 0);
  const hasJsonText = Boolean(jsonPaste.value.trim());
  jsonExportSelect.disabled = !hasBarcodes && !hasJsonText;
}

/** Off-screen host for PDF rasterization (same symbology as on-screen). */
let pdfBarcodeRenderSink = null;
function getPdfBarcodeRenderSink() {
  if (!pdfBarcodeRenderSink) {
    pdfBarcodeRenderSink = document.createElement("div");
    pdfBarcodeRenderSink.setAttribute("aria-hidden", "true");
    pdfBarcodeRenderSink.style.cssText =
      "position:fixed;left:-20000px;top:0;width:400px;visibility:hidden;pointer-events:none;";
    document.body.appendChild(pdfBarcodeRenderSink);
  }
  return pdfBarcodeRenderSink;
}

async function svgElementToPngDataUrl(svgEl) {
  const vb = svgEl.viewBox && svgEl.viewBox.baseVal;
  let w = parseFloat(svgEl.getAttribute("width")) || (vb ? vb.width : 0);
  let h = parseFloat(svgEl.getAttribute("height")) || (vb ? vb.height : 0);
  if (!w || !h) {
    w = 320;
    h = 100;
  }
  const scale = 2;
  const cw = Math.ceil(w * scale);
  const ch = Math.ceil(h * scale);
  const svgClone = /** @type {SVGElement} */ (svgEl.cloneNode(true));
  svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgClone.setAttribute("width", String(cw));
  svgClone.setAttribute("height", String(ch));
  const svgString = new XMLSerializer().serializeToString(svgClone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG rasterize failed"));
    };
    img.src = url;
  });
}

function upscaleCanvasToDataUrl(source, maxSidePx = 360) {
  const s = Math.max(source.width, source.height);
  const scale = Math.min(4, Math.max(1, maxSidePx / s));
  const w = Math.ceil(source.width * scale);
  const h = Math.ceil(source.height * scale);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(source, 0, 0, w, h);
  return c.toDataURL("image/png");
}

async function rasterizeBarcodeOutput(outputEl) {
  const svg = outputEl.querySelector("svg");
  if (svg) return svgElementToPngDataUrl(svg);
  const canvas = outputEl.querySelector("canvas");
  if (canvas) return upscaleCanvasToDataUrl(canvas);
  const img = outputEl.querySelector("img");
  if (img && img.complete && (img.naturalWidth || img.width)) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0);
    return c.toDataURL("image/png");
  }
  return null;
}

function drawPdfCoverHeader(doc, pageW, margin, shipmentNumber, symbologyLabel, barcodeCount) {
  let y = margin;
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageW, 4.5, "F");
  y = 14;
  doc.setTextColor(45, 55, 72);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Shipment barcode report", margin, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Shipment number", margin, y);
  y += 5.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(String(shipmentNumber || "—"), margin, y);
  y += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Symbology: ${symbologyLabel}`, margin, y);
  y += 4.5;
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 4.5;
  doc.text(`Barcodes in this export: ${barcodeCount}`, margin, y);
  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.line(margin, y, pageW - margin, y);
  y += 9;
  return y;
}

function drawPdfContinuationHeader(doc, margin, pageW, shipmentNumber) {
  let y = margin + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Shipment number: ${String(shipmentNumber || "—")}`, margin, y);
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.line(margin, y, pageW - margin, y);
  y += 7;
  return y;
}

const ROW_CODE_TYPE_VALUES = new Set([
  "",
  "CODE128",
  "CODE39",
  "EAN13",
  "EAN8",
  "UPC",
  "ITF14",
  "QR"
]);

function normalizeEntryRowCodeType(entry) {
  if (ROW_CODE_TYPE_VALUES.has(entry?.rowCodeType)) return;
  const m = entry?.mode;
  if (m === "QR") entry.rowCodeType = "QR";
  else if (m === "EAN13") entry.rowCodeType = "EAN13";
  else if (m === "UPC") entry.rowCodeType = "UPC";
  else entry.rowCodeType = "";
}

function entryRenderFormat(entry) {
  normalizeEntryRowCodeType(entry);
  const override = entry.rowCodeType;
  if (override && override !== "") return override;
  return codeTypeSelect.value;
}

function symbologyLabelForFormat(format) {
  const opt = [...codeTypeSelect.options].find((o) => o.value === format);
  return opt?.text?.trim() || format;
}

async function downloadLastJsonBarcodesPdf() {
  if (!lastJsonEntries?.length) {
    showJsonError("Generate barcodes first, then export PDF.");
    return;
  }
  const mod = window.jspdf;
  if (!mod?.jsPDF) {
    showJsonError("PDF library not loaded. Refresh the page.");
    return;
  }
  const { jsPDF } = mod;
  const symLabel =
    codeTypeSelect.options[codeTypeSelect.selectedIndex]?.text?.trim() || codeTypeSelect.value;
  const rowFormats = lastJsonEntries.map((e) => entryRenderFormat(e));
  const hasMixedRowFormats = new Set(rowFormats).size > 1;

  let shipmentNumber = "—";
  const paste = jsonPaste.value.trim();
  if (paste) {
    try {
      const sn = getShipmentNumberFromParsed(JSON.parse(paste));
      if (sn) shipmentNumber = sn;
    } catch {
      /* ignore */
    }
  }

  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - 2 * margin;
  const exportSymbologyLabel = hasMixedRowFormats
    ? `${symLabel} — mixed per barcode`
    : symLabel;
  let y = drawPdfCoverHeader(
    doc,
    pageW,
    margin,
    shipmentNumber,
    exportSymbologyLabel,
    lastJsonEntries.length
  );

  const sink = getPdfBarcodeRenderSink();
  jsonExportSelect.disabled = true;

  try {
    for (let i = 0; i < lastJsonEntries.length; i += 1) {
      const { label, value } = lastJsonEntries[i];
      const rowFormat = entryRenderFormat(lastJsonEntries[i]);
      sink.innerHTML = "";
      const out = document.createElement("div");
      out.style.cssText =
        "display:flex;align-items:center;justify-content:center;min-height:88px;padding:12px;background:#fff;width:380px;box-sizing:border-box;";
      sink.appendChild(out);
      drawBarcode(out, value, rowFormat);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const dataUrl = await rasterizeBarcodeOutput(out);
      if (!dataUrl) continue;

      const props = doc.getImageProperties(dataUrl);
      const maxImgW = contentW;
      let imgW = Math.min(maxImgW, 100);
      let imgH = (props.height * imgW) / props.width;
      const titleLines = doc.splitTextToSize(label, contentW - 24);
      const lineMm = 4.1;
      const titleH = titleLines.length * lineMm + 4;
      const gapAfter = 9;
      const sectionH = titleH + imgH + gapAfter;

      if (y + sectionH > pageH - margin) {
        doc.addPage();
        y = drawPdfContinuationHeader(doc, margin, pageW, shipmentNumber);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`${i + 1} / ${lastJsonEntries.length}`, pageW - margin, y + 3.2, {
        align: "right"
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text(titleLines, margin, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Type: ${symbologyLabelForFormat(rowFormat)}`, margin, y + 8.3);

      y += titleH;
      doc.addImage(dataUrl, "PNG", margin, y, imgW, imgH);
      y += imgH + gapAfter;
    }

    sink.innerHTML = "";
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const base = suggestedBarcodeExportBasename();
    doc.save(`${base}-${stamp}.pdf`);
  } catch (e) {
    console.error(e);
    showJsonError("Could not build PDF. Try a different code type or refresh the page.");
  } finally {
    sink.innerHTML = "";
    updateJsonExportSelect();
  }
}

function csvEscapeCell(s) {
  return `"${String(s ?? "").replace(/"/g, '""')}"`;
}

function suggestedBarcodeExportBasename() {
  const text = jsonPaste.value.trim();
  if (!text) return "barcode-export";
  try {
    const sn = getShipmentNumberFromParsed(JSON.parse(text));
    if (sn) return `barcodes-${String(sn).replace(/[^\w.-]+/g, "_")}`;
  } catch {
    /* ignore */
  }
  return "barcode-export";
}

function downloadCurrentJsonFile() {
  const text = jsonPaste.value.trim();
  if (!text) {
    showJsonError("Paste JSON in the editor first.");
    return;
  }
  let body = text;
  try {
    body = `${JSON.stringify(JSON.parse(text), null, 2)}\n`;
  } catch {
    /* keep raw editor text */
  }
  const blob = new Blob([body], { type: "application/json;charset=utf-8" });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const base = suggestedBarcodeExportBasename();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${base}-${stamp}.json`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

function downloadLastJsonBarcodesCsv() {
  if (!lastJsonEntries || !lastJsonEntries.length) {
    showJsonError("Generate barcodes first, then export CSV.");
    return;
  }
  const rows = [["Label", "Encoded value"], ...lastJsonEntries.map(({ label, value }) => [label, value])];
  const csv = rows.map((cols) => cols.map(csvEscapeCell).join(",")).join("\r\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const base = suggestedBarcodeExportBasename();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${base}-${stamp}.csv`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

function renderJsonBarcodeGrid(entries) {
  jsonBarcodeMount.innerHTML = "";
  let prevBlock = null;
  for (let i = 0; i < entries.length; i += 1) {
    const { label, value } = entries[i];
    normalizeEntryRowCodeType(entries[i]);
    const blockKey = jsonBarcodeBlockKey(label);
    if (prevBlock !== null && shouldInsertBarcodeItemGap(prevBlock, blockKey)) {
      const gapRow = document.createElement("div");
      gapRow.className = "json-barcode-gap-row";
      gapRow.setAttribute("aria-hidden", "true");
      jsonBarcodeMount.appendChild(gapRow);
    }
    prevBlock = blockKey;

    const row = document.createElement("div");
    row.className = "json-barcode-row";
    row.dataset.entryIndex = String(i);
    const lab = document.createElement("div");
    lab.className = "json-barcode-label";
    const groupKey = jsonBarcodeGroupKey(label);
    lab.dataset.bcGroup = groupKey;
    lab.style.setProperty("--label-hue", String(hueForBarcodeGroup(groupKey)));
    lab.textContent = label;
    const valueWrap = document.createElement("div");
    valueWrap.className = "json-barcode-value";
    const typeRow = document.createElement("div");
    typeRow.className = "json-barcode-type-row";
    const typeLbl = document.createElement("label");
    typeLbl.className = "json-barcode-type-label";
    typeLbl.htmlFor = `json-barcode-type-${i}`;
    typeLbl.textContent = "Code type";
    const typeSelect = document.createElement("select");
    typeSelect.id = `json-barcode-type-${i}`;
    typeSelect.className = "json-barcode-type-select";
    typeSelect.setAttribute("aria-label", "Barcode symbology for this row");
    const followOpt = document.createElement("option");
    followOpt.value = "";
    followOpt.textContent = "Select Barcode Type";
    typeSelect.appendChild(followOpt);
    for (let oi = 0; oi < codeTypeSelect.options.length; oi += 1) {
      const src = codeTypeSelect.options[oi];
      const opt = document.createElement("option");
      opt.value = src.value;
      opt.textContent = src.textContent;
      typeSelect.appendChild(opt);
    }
    typeSelect.value = entries[i].rowCodeType || "";
    typeRow.append(typeLbl, typeSelect);
    const valueLbl = document.createElement("label");
    valueLbl.className = "json-barcode-value-label";
    valueLbl.htmlFor = `json-barcode-value-${i}`;
    valueLbl.textContent = "Encoded value (editable)";
    const valueInput = document.createElement("textarea");
    valueInput.id = `json-barcode-value-${i}`;
    valueInput.className = "json-barcode-value-text";
    valueInput.value = String(value ?? "");
    valueInput.rows = Math.min(6, Math.max(2, String(value ?? "").split("\n").length));
    valueInput.spellcheck = false;
    valueInput.setAttribute("aria-label", "Encoded value; edit to update barcode");
    valueWrap.append(typeRow, valueLbl, valueInput);
    const out = document.createElement("div");
    out.className = "json-barcode-output";
    drawBarcode(out, value, entryRenderFormat(entries[i]));

    typeSelect.addEventListener("change", () => {
      const v = typeSelect.value;
      entries[i].rowCodeType = ROW_CODE_TYPE_VALUES.has(v) ? v : "";
      drawBarcode(out, valueInput.value, entryRenderFormat(entries[i]));
    });

    valueInput.addEventListener("input", () => {
      const v = valueInput.value;
      if (lastJsonEntries && lastJsonEntries[i] !== undefined) {
        lastJsonEntries[i].value = v;
      }
      drawBarcode(out, v, entryRenderFormat(entries[i]));
    });
    row.append(lab, valueWrap, out);
    jsonBarcodeMount.appendChild(row);
  }
  updateJsonExportSelect();
}

function runJsonGenerate() {
  clearJsonError();
  jsonBarcodeMount.innerHTML = "";
  lastJsonEntries = null;
  updateJsonExportSelect();

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
          updateJsonExportSelect();
          return;
        }
        renderJsonBarcodeGrid(lastJsonEntries);
      } catch {
        showJsonError("Invalid JSON in file.");
        updateJsonExportSelect();
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
    // Fallback for direct/manual values now that the old generator panel is removed.
    lastJsonEntries = collectPlainTextRows(text);
    if (!lastJsonEntries.length) {
      showJsonError("Paste JSON, choose a file, or enter a plain value.");
      return;
    }
    renderJsonBarcodeGrid(lastJsonEntries);
    return;
  }

  lastJsonEntries = extractBarcodeRowsFromJson(data);
  if (!lastJsonEntries.length) {
    showJsonError("No string values found to encode.");
    updateJsonExportSelect();
    return;
  }
  renderJsonBarcodeGrid(lastJsonEntries);
}

jsonGenerateBtn.addEventListener("click", runJsonGenerate);

jsonClearBtn.addEventListener("click", () => {
  clearJsonError();
  jsonBarcodeMount.innerHTML = "";
  lastJsonEntries = null;
  updateJsonExportSelect();
});

jsonExportSelect.addEventListener("change", () => {
  const v = jsonExportSelect.value;
  if (!v) return;
  clearJsonError();
  if (v === "csv") downloadLastJsonBarcodesCsv();
  else if (v === "pdf") void downloadLastJsonBarcodesPdf();
  else if (v === "json") downloadCurrentJsonFile();
  jsonExportSelect.value = "";
});

function hideJsonFileRemarks() {
  if (!jsonFileRemarks) return;
  jsonFileRemarks.hidden = true;
}

jsonPaste.addEventListener("input", () => {
  hideJsonFileRemarks();
  updateJsonExportSelect();
});

function formatJsonFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

if (jsonFile) {
  jsonFile.addEventListener("click", () => {
    jsonFile.value = "";
    hideJsonFileRemarks();
  });

  jsonFile.addEventListener("change", () => {
    if (!jsonFileRemarks || !jsonFileMetaName || !jsonFileMetaSize) return;
    const f = jsonFile.files && jsonFile.files[0];
    if (!f) {
      hideJsonFileRemarks();
      return;
    }
    jsonFileMetaName.textContent = f.name;
    const typePart = f.type ? ` · ${f.type}` : "";
    jsonFileMetaSize.textContent = `(${formatJsonFileSize(f.size)}${typePart})`;
    jsonFileRemarks.hidden = false;
  });
}

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
  jsonFile.value = "";
  hideJsonFileRemarks();
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
  if (lastJsonEntries && lastJsonEntries.length) {
    renderJsonBarcodeGrid(lastJsonEntries);
  }
});

refreshSavedJsonSelect();
updateJsonExportSelect();
