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
const shipmentDetailsMount = document.getElementById("shipmentDetailsMount");
const detailsModal = document.getElementById("detailsModal");
const detailsModalTitle = document.getElementById("detailsModalTitle");
const detailsModalBody = document.getElementById("detailsModalBody");
const savedJsonSelect = document.getElementById("savedJsonSelect");
const jsonLoadSavedBtn = document.getElementById("jsonLoadSavedBtn");
const jsonSaveBtn = document.getElementById("jsonSaveBtn");
const jsonDeleteSavedBtn = document.getElementById("jsonDeleteSavedBtn");
const saveShipmentOverride = document.getElementById("saveShipmentOverride");
const jsonSaveStatus = document.getElementById("jsonSaveStatus");
const apiEnv = document.getElementById("apiEnv");
const apiShipmentNumber = document.getElementById("apiShipmentNumber");
const apiBearerToken = document.getElementById("apiBearerToken");
const apiFetchBtn = document.getElementById("apiFetchBtn");
const apiClearTokenBtn = document.getElementById("apiClearTokenBtn");
const toggleTokenBtn = document.getElementById("toggleTokenBtn");
const apiUrlPreview = document.getElementById("apiUrlPreview");
const apiStatus = document.getElementById("apiStatus");
const tokenExpiryBadge = document.getElementById("tokenExpiryBadge");
const tokenExpiryHint = document.getElementById("tokenExpiryHint");
const resultsSummary = document.getElementById("resultsSummary");
const resultsShipmentTitle = document.getElementById("resultsShipmentTitle");
const resultsStats = document.getElementById("resultsStats");
const resultsLegend = document.getElementById("resultsLegend");

const SAVED_JSON_STORAGE_KEY = "ecolabSavedJsonByShipment";
const TOKEN_SESSION_KEY = "ecolabApiBearerToken";
const ENV_SESSION_KEY = "ecolabApiEnv";
const SHIPMENT_SESSION_KEY = "ecolabApiShipmentNumber";
const DEFAULT_TOKEN_HINT =
  "Token stays in this browser session only. Never commit tokens.";

/** @type {ReturnType<typeof setInterval> | null} */
let tokenExpiryTimer = null;

/** Hostnames follow the QA pattern: digitalbulkcommonapi-qa.azurewebsites.net */
const API_ENV_HOSTS = {
  dev: "https://digitalbulkcommonapi-dev.azurewebsites.net",
  qa: "https://digitalbulkcommonapi-qa.azurewebsites.net",
  qa2: "https://digitalbulkcommonapi-qa2.azurewebsites.net",
  uat: "https://digitalbulkcommonapi-uat.azurewebsites.net",
  stg: "https://digitalbulkcommonapi-stg.azurewebsites.net",
  stage: "https://digitalbulkcommonapi-stg.azurewebsites.net",
  prod: "https://digitalbulkcommonapi.azurewebsites.net"
};

const FIELD_FRIENDLY_NAMES = {
  ShipmentNumber: "Shipment number",
  DeliveryNumber: "Delivery number",
  BOL: "BOL",
  BolNumber: "BOL",
  BOLNumber: "BOL",
  BillOfLading: "BOL",
  BillOfLadingNumber: "BOL",
  CompartmentNumber: "Compartment #",
  CompartmentBottomSeal: "Bottom seal",
  CompartmentEVDSeal: "EVD seal",
  CompartmentBatch: "Compartment batch",
  CompartmentHU: "Compartment HU",
  TransporterBatchNumber: "Transporter batch",
  TransporterSerialNumber: "Transporter serial",
  ShipmentDeliveryItemSerialNumbers: "Item serial numbers",
  StorageUnitNumber: "Storage unit",
  GTIN: "GTIN",
  EANNumber: "EAN",
  YSLDPackageCode: "YSLD package",
  ProductNumber: "Product number",
  MaterialNumber: "Material number",
  "EquipmentNumber/ProductNumber": "Equipment / Product",
  "EquipmentNumber/MaterialNumber": "Equipment / Material",
  "EquipmentNumber/EANNumber": "Equipment / EAN",
  "EquipmentNumber/GTIN": "Equipment / GTIN",
  "EquipmentNumber/FormulaCode": "Equipment / Formula",
  "EquipmentNumber/YSLDPackageCode": "Equipment / YSLD"
};

const BOL_FIELD_KEYS = ["BOL", "Bol", "BolNumber", "BOLNumber", "BillOfLading", "BillOfLadingNumber", "BoL"];

const MOBILE_DETAIL_FIELDS = [
  "DeliveryStatus",
  "DeliveryType",
  "DeliveryQuantity",
  "DeliveryQuantityUOM",
  "EquipmentNumber",
  "SerialNumber",
  "TankCapacity",
  "TankCapacityUnitOfMeasure",
  "LockCombination",
  "IsBluetoothLock",
  "IsPrimaryCodeUpdated",
  "ATEXRequirement",
  "IsManifoldTank",
  "MobileDeviceDeliveryAllowed",
  "EquipmentLatitude",
  "EquipmentLongitude",
  "TankCapacityUOM",
  "IsPODSignatureRequired",
  "IsDropOff",
  "IsDropOffAtDelivery",
  "IsMarkedDropOff",
  "IsLabelInstalled",
  "IsReviewed",
  "IsIMSiteItem",
  "LastSyncDateTime"
];

const SHIPMENT_DETAIL_FIELDS = ["ShipmentStatus"];

const DETAIL_FIELD_LABELS = {
  DeliveryStatus: "Delivery Status",
  ShipmentStatus: "Shipment Status",
  DeliveryType: "Delivery Type",
  DeliveryQuantity: "Delivery Quantity",
  DeliveryQuantityUOM: "Delivery Quantity UOM",
  EquipmentNumber: "Equipment Number",
  SerialNumber: "Serial Number",
  TankCapacity: "Tank Capacity",
  TankCapacityUnitOfMeasure: "Tank Capacity UOM",
  TankCapacityUOM: "Tank Capacity UOM",
  LockCombination: "Lock Combination",
  IsBluetoothLock: "Bluetooth Lock",
  IsPrimaryCodeUpdated: "Primary Code Updated",
  ATEXRequirement: "ATEX Requirement",
  IsManifoldTank: "Manifold Tank",
  MobileDeviceDeliveryAllowed: "Mobile Device Delivery Allowed",
  EquipmentLatitude: "Equipment Latitude",
  EquipmentLongitude: "Equipment Longitude",
  IsPODSignatureRequired: "POD Signature Required",
  IsDropOff: "Drop Off",
  IsDropOffAtDelivery: "Drop Off",
  IsLabelInstalled: "Label Installed",
  IsReviewed: "Reviewed",
  IsMarkedDropOff: "Marked Drop Off",
  IsIMSiteItem: "IM Site Item",
  LastSyncDateTime: "Last Sync"
};

const HIGHLIGHT_DETAIL_FIELDS = new Set(["DeliveryStatus", "ShipmentStatus"]);
const DROP_OFF_DETAIL_FIELDS = new Set(["IsDropOff", "IsDropOffAtDelivery", "IsMarkedDropOff"]);

const CUSTOMER_DETAIL_FIELDS = [
  "CustomerName",
  "CustomerNumber",
  "CustomerCode",
  "SoldToName",
  "SoldToNumber",
  "ShipToName",
  "ShipToNumber",
  "Address",
  "Address1",
  "Address2",
  "Street",
  "City",
  "State",
  "PostalCode",
  "ZipCode",
  "Country",
  "Phone",
  "Email"
];

/** @type {{ label: string, value: string }[] | null} */
let lastJsonEntries = null;
/** @type {{ title: string, rows: any[], matchKey?: string }[]} */
let lastDetailPanels = [];
/** @type {{ shipmentNumber: string, expectedDeliveries: number|null, expectedItems: number|null, deliveryCount: number, itemCount: number } | null} */
let lastShipmentMeta = null;

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

function barcodeValueParts(val) {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) {
    return val.flatMap((v) => barcodeValueParts(v)).filter(Boolean);
  }
  if (typeof val === "object") return [];
  const s = String(val).trim();
  if (!s || s === "{}" || s === "[]") return [];
  return [s];
}

function pushField(rows, label, val) {
  const parts = barcodeValueParts(val);
  if (!parts.length) return;
  if (parts.length === 1) {
    rows.push({ label, value: parts[0] });
    return;
  }
  // Keep multi-values as separate barcodes — never join into one
  parts.forEach((part, i) => {
    rows.push({ label: `${label} · ${i + 1}`, value: part });
  });
}

function pickBolValue(obj) {
  if (!obj || typeof obj !== "object") return undefined;
  return firstDefined(obj, BOL_FIELD_KEYS);
}

function pushBolBarcode(rows, prefix, obj) {
  const bol = pickBolValue(obj);
  if (bol == null) return;
  const label = prefix ? `${prefix} — BOL` : "BOL";
  pushField(rows, label, bol);
}

/**
 * One slash barcode per left/right pair. Never joins multiple materials/equipment into a single value.
 */
function pushSlashComposite(rows, label, left, right) {
  const lefts = barcodeValueParts(left);
  const rights = barcodeValueParts(right);
  if (!lefts.length || !rights.length) return;

  if (lefts.length === 1) {
    rights.forEach((b, i) => {
      rows.push({
        label: rights.length === 1 ? label : `${label} · ${i + 1}`,
        value: `${lefts[0]}/${b}`
      });
    });
    return;
  }
  if (rights.length === 1) {
    lefts.forEach((a, i) => {
      rows.push({
        label: lefts.length === 1 ? label : `${label} · ${i + 1}`,
        value: `${a}/${rights[0]}`
      });
    });
    return;
  }
  const n = Math.max(lefts.length, rights.length);
  for (let i = 0; i < n; i += 1) {
    rows.push({
      label: `${label} · ${i + 1}`,
      value: `${lefts[Math.min(i, lefts.length - 1)]}/${rights[Math.min(i, rights.length - 1)]}`
    });
  }
}

function pushSerialField(rows, label, val) {
  if (val === null || val === undefined) return;
  if (Array.isArray(val)) {
    const joined = val
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .join(", ");
    pushField(rows, label, joined);
    return;
  }
  if (typeof val === "object") {
    try {
      const s = JSON.stringify(val);
      if (s && s !== "{}" && s !== "[]") pushField(rows, label, s);
    } catch {
      /* ignore */
    }
    return;
  }
  pushField(rows, label, val);
}

function formatDetailValue(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (Array.isArray(val)) return val.map((v) => formatDetailValue(v)).filter(Boolean).join(", ");
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return "";
    }
  }
  return String(val).trim();
}

function pickFirstValue(obj, keys) {
  if (!obj || typeof obj !== "object") return "";
  for (const key of keys) {
    if (obj[key] === null || obj[key] === undefined) continue;
    const s = formatDetailValue(obj[key]);
    if (s !== "") return s;
  }
  return "";
}

function findCustomerObject(source) {
  if (!source || typeof source !== "object") return null;
  const candidates = [
    source.Customer,
    source.CustomerDetail,
    source.CustomerDetails,
    source.SoldTo,
    source.ShipTo,
    source.ShipToCustomer,
    source.CustomerAddress,
    source.DeliveryCustomer
  ];
  for (const c of candidates) {
    if (c && typeof c === "object" && !Array.isArray(c)) return c;
  }
  // Flat customer fields on the delivery/item itself
  if (
    source.CustomerName != null ||
    source.CustomerNumber != null ||
    source.Latitude != null ||
    source.Longitude != null ||
    source.Lat != null ||
    source.Long != null
  ) {
    return source;
  }
  return null;
}

function buildMapUrl(lat, lng) {
  const a = String(lat ?? "").trim();
  const b = String(lng ?? "").trim();
  if (!a || !b) return "";
  if (!/^-?\d+(\.\d+)?$/.test(a) || !/^-?\d+(\.\d+)?$/.test(b)) return "";
  return `https://www.google.com/maps?q=${encodeURIComponent(a)},${encodeURIComponent(b)}`;
}

function isDetailYes(value) {
  const s = String(value ?? "")
    .trim()
    .toLowerCase();
  return s === "yes" || s === "true" || s === "1";
}

function collectDetailRowsFromObject(obj, fieldNames) {
  const rows = [];
  if (!obj || typeof obj !== "object") return rows;
  const used = new Set();
  for (const key of fieldNames) {
    let fieldKey = key;
    let label = DETAIL_FIELD_LABELS[key] || key;
    let value = "";
    if (key === "IsDropOff" || key === "IsDropOffAtDelivery" || key === "IsDropOffatDelivery") {
      // Prefer explicit IsDropOff; keep a single Drop Off row
      if (used.has("Drop Off")) continue;
      const raw = firstDefined(obj, ["IsDropOff", "IsDropOffAtDelivery", "IsDropOffatDelivery"]);
      // firstDefined skips false? — use dedicated boolean read
      const boolRaw = readDetailBool(obj, ["IsDropOff", "IsDropOffAtDelivery", "IsDropOffatDelivery"]);
      if (boolRaw === undefined && (raw === undefined || raw === null || raw === "")) continue;
      value = formatDetailValue(boolRaw !== undefined ? boolRaw : raw);
      label = "Drop Off";
      fieldKey = "IsDropOff";
    } else if (key === "IsMarkedDropOff") {
      const boolRaw = readDetailBool(obj, ["IsMarkedDropOff"]);
      if (boolRaw === undefined) continue;
      value = formatDetailValue(boolRaw);
      label = "Marked Drop Off";
      fieldKey = "IsMarkedDropOff";
    } else if (key === "TankCapacityUnitOfMeasure" || key === "TankCapacityUOM") {
      // Prefer TankCapacityUnitOfMeasure; avoid duplicate UOM rows
      if (used.has("Tank Capacity UOM")) continue;
      value = formatDetailValue(
        firstDefined(obj, ["TankCapacityUnitOfMeasure", "TankCapacityUOM"])
      );
      label = "Tank Capacity UOM";
      fieldKey = "TankCapacityUnitOfMeasure";
    } else if (key === "EquipmentLatitude") {
      value = formatDetailValue(
        firstDefined(obj, ["EquipmentLatitude", "EquipmentLat"])
      );
    } else if (key === "EquipmentLongitude") {
      value = formatDetailValue(
        firstDefined(obj, ["EquipmentLongitude", "EquipmentLong", "EquipmentLng"])
      );
    } else {
      value = formatDetailValue(firstDefined(obj, [key]));
    }
    if (value === "") continue;
    used.add(label);
    const highlight =
      HIGHLIGHT_DETAIL_FIELDS.has(fieldKey) ||
      (DROP_OFF_DETAIL_FIELDS.has(fieldKey) && isDetailYes(value));
    rows.push({
      label,
      value,
      fieldKey,
      highlight
    });
  }

  appendEquipmentMapRow(obj, rows);
  return rows;
}

/** Read boolean-ish fields including explicit false. */
function readDetailBool(obj, keys) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== null && obj[key] !== undefined) {
      const v = obj[key];
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v !== 0;
      const s = String(v).trim().toLowerCase();
      if (s === "true" || s === "yes" || s === "1") return true;
      if (s === "false" || s === "no" || s === "0") return false;
    }
    const found = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase());
    if (found && obj[found] !== null && obj[found] !== undefined) {
      const v = obj[found];
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v !== 0;
      const s = String(v).trim().toLowerCase();
      if (s === "true" || s === "yes" || s === "1") return true;
      if (s === "false" || s === "no" || s === "0") return false;
    }
  }
  return undefined;
}

function panelsHaveDropOff(panels) {
  if (!panels?.length) return false;
  for (const panel of panels) {
    for (const row of panel.rows || []) {
      if (DROP_OFF_DETAIL_FIELDS.has(row.fieldKey) && isDetailYes(row.value)) return true;
    }
  }
  return false;
}

function appendEquipmentMapRow(obj, rows) {
  if (!obj || !rows) return;
  if (rows.some((r) => r.fieldKey === "EquipmentMap" || r.label === "Equipment map")) return;
  const lat =
    rows.find((r) => r.fieldKey === "EquipmentLatitude")?.value ||
    formatDetailValue(firstDefined(obj, ["EquipmentLatitude", "EquipmentLat"]));
  const lng =
    rows.find((r) => r.fieldKey === "EquipmentLongitude")?.value ||
    formatDetailValue(firstDefined(obj, ["EquipmentLongitude", "EquipmentLong", "EquipmentLng"]));
  const mapUrl = buildMapUrl(lat, lng);
  if (!mapUrl) return;
  rows.push({
    label: "Equipment map",
    value: `${lat}, ${lng}`,
    href: mapUrl,
    isLink: true,
    fieldKey: "EquipmentMap"
  });
}

function findStatusValue(panels, fieldKey) {
  if (!panels?.length) return "";
  for (const panel of panels) {
    for (const row of panel.rows || []) {
      if (row.fieldKey === fieldKey) return row.value;
      if (row.label === DETAIL_FIELD_LABELS[fieldKey] || row.label === fieldKey) return row.value;
    }
  }
  return "";
}

function statusTone(value) {
  const s = String(value || "").trim().toLowerCase();
  if (!s) return "neutral";
  if (/(complete|delivered|closed|done|success|approved|active)/.test(s)) return "ok";
  if (/(cancel|fail|error|reject|hold|block)/.test(s)) return "bad";
  if (/(pending|open|in.?progress|draft|partial|ready|scheduled)/.test(s)) return "warn";
  return "accent";
}

function createStatusBadge(label, value) {
  const badge = document.createElement("span");
  badge.className = `status-badge status-badge-${statusTone(value)}`;
  badge.title = `${label}: ${value}`;
  const lab = document.createElement("span");
  lab.className = "status-badge-label";
  lab.textContent = label;
  const val = document.createElement("span");
  val.className = "status-badge-value";
  val.textContent = value;
  badge.append(lab, val);
  return badge;
}

function collectCustomerDetailRows(customer) {
  const rows = collectDetailRowsFromObject(customer, CUSTOMER_DETAIL_FIELDS);
  const lat = pickFirstValue(customer, ["Latitude", "Lat", "latitude", "lat", "CustomerLatitude"]);
  const lng = pickFirstValue(customer, [
    "Longitude",
    "Long",
    "Lng",
    "longitude",
    "long",
    "lng",
    "CustomerLongitude"
  ]);
  if (lat) rows.push({ label: "Latitude", value: lat });
  if (lng) rows.push({ label: "Longitude", value: lng });
  const mapUrl = buildMapUrl(lat, lng);
  if (mapUrl) {
    rows.push({
      label: "Map location",
      value: `${lat}, ${lng}`,
      href: mapUrl,
      isLink: true
    });
  }
  return rows;
}

/**
 * Info-only panels (no barcodes): delivery flags/status + customer with map link.
 * @returns {{ title: string, rows: {label:string,value:string,href?:string,isLink?:boolean}[] }[]}
 */
function collectShipmentDetailPanels(payload) {
  const root =
    normalizeSyncShipmentPayload(payload) ||
    unwrapNsapPayload(payload) ||
    (payload?.ShipmentDetail ? payload : null) ||
    payload;
  if (!root || typeof root !== "object") return [];

  const panels = [];

  // Shipment-level status (highlighted)
  const shipmentHost = root.ShipmentDetail && typeof root.ShipmentDetail === "object" ? root.ShipmentDetail : root;
  let shipmentRows = collectDetailRowsFromObject(shipmentHost, SHIPMENT_DETAIL_FIELDS);
  if (!shipmentRows.length) {
    const ss = deepFindFirstValue(root, ["ShipmentStatus"]);
    if (ss != null && String(ss).trim() !== "") {
      shipmentRows = [
        {
          label: "Shipment Status",
          value: formatDetailValue(ss),
          fieldKey: "ShipmentStatus",
          highlight: true
        }
      ];
    }
  }
  if (shipmentRows.length) {
    panels.push({ title: "Shipment details", rows: shipmentRows, matchKey: "^shipment" });
  }

  let deliveries = findArrayByNameHints(root, [
    "ShipmentDeliveryDetails",
    "ShipmentDeliveries",
    "DeliveryDetails",
    "Deliveries"
  ]);
  let items = findArrayByNameHints(root, [
    "ShipmentDeliveryItemsDetails",
    "ShipmentDeliveryItems",
    "DeliveryItems",
    "ItemsDetails",
    "LineItems"
  ]);

  // Nested items under deliveries
  if (deliveries.length) {
    for (const del of deliveries) {
      const nested = findArrayByNameHints(del, [
        "ShipmentDeliveryItemsDetails",
        "ShipmentDeliveryItems",
        "DeliveryItems",
        "Items",
        "LineItems"
      ]);
      for (const it of nested) {
        const copy = { ...it };
        if (firstDefined(copy, ["ShipmentDeliveryId"]) == null && firstDefined(del, ["ShipmentDeliveryId"]) != null) {
          copy.ShipmentDeliveryId = firstDefined(del, ["ShipmentDeliveryId"]);
        }
        items.push(copy);
      }
    }
  }

  // Objects that carry delivery detail flags even if not in a named delivery array
  if (!deliveries.length) {
    deliveries = deepCollectObjectsWithHints(root, MOBILE_DETAIL_FIELDS).filter((obj) => {
      // Prefer delivery-like rows, skip pure customer-only objects
      return (
        firstDefined(obj, MOBILE_DETAIL_FIELDS) != null ||
        firstDefined(obj, ["DeliveryNumber", "DeliveryStatus", "DeliveryType"]) != null
      );
    });
  }

  function deliveryMatchKey(del, index) {
    if (deliveries.length) return nsapDeliveryPrefix(deliveries, del, index);
    const dn = firstDefined(del, ["DeliveryNumber"]);
    return dn != null ? String(dn).trim() : `delivery-${index + 1}`;
  }

  function deliveryTitle(del, index) {
    const key = deliveryMatchKey(del, index);
    return `Delivery details · ${key}`;
  }

  function customerTitle(del, index, itemLabel) {
    const base = deliveryMatchKey(del, index);
    return itemLabel ? `Customer details · ${base} · ${itemLabel}` : `Customer details · ${base}`;
  }

  if (deliveries.length) {
    deliveries.forEach((del, index) => {
      const matchKey = deliveryMatchKey(del, index);
      const deliveryRows = collectDetailRowsFromObject(del, MOBILE_DETAIL_FIELDS);
      // Also pull detail fields from matching items if delivery object is sparse
      if (!deliveryRows.length && items.length) {
        const delId = firstDefined(del, ["ShipmentDeliveryId"]);
        const dn = firstDefined(del, ["DeliveryNumber"]);
        for (const it of items) {
          const sameId =
            delId != null &&
            firstDefined(it, ["ShipmentDeliveryId"]) != null &&
            String(firstDefined(it, ["ShipmentDeliveryId"])) === String(delId);
          const sameDn =
            dn != null &&
            firstDefined(it, ["DeliveryNumber"]) != null &&
            String(firstDefined(it, ["DeliveryNumber"])) === String(dn);
          if (sameId || sameDn) {
            const extra = collectDetailRowsFromObject(it, MOBILE_DETAIL_FIELDS);
            for (const row of extra) {
              if (!deliveryRows.some((r) => r.label === row.label)) deliveryRows.push(row);
            }
          }
        }
      }
      if (deliveryRows.length) {
        panels.push({ title: deliveryTitle(del, index), rows: deliveryRows, matchKey });
      }

      const customer = findCustomerObject(del) || findCustomerObjectDeep(del);
      const customerRows = customer ? collectCustomerDetailRows(customer) : [];
      if (customerRows.length) {
        panels.push({ title: customerTitle(del, index), rows: customerRows, matchKey });
      }

      const delId = firstDefined(del, ["ShipmentDeliveryId"]);
      const lineItems = items.filter((it) => {
        const sid = firstDefined(it, ["ShipmentDeliveryId"]);
        return delId != null && sid != null && String(sid) === String(delId);
      });
      lineItems.forEach((it) => {
        const itemCustomer = findCustomerObject(it) || findCustomerObjectDeep(it);
        if (!itemCustomer || itemCustomer === customer) return;
        const itemCustomerRows = collectCustomerDetailRows(itemCustomer);
        if (!itemCustomerRows.length) return;
        const itemId = firstDefined(it, ["ShipmentDeliveryItemId"]);
        panels.push({
          title: customerTitle(del, index, itemId != null ? `Item ${itemId}` : "Item"),
          rows: itemCustomerRows,
          matchKey
        });
      });
    });
  } else {
    // Flat / unknown shape: gather detail fields from anywhere
    const detailHosts = deepCollectObjectsWithHints(root, MOBILE_DETAIL_FIELDS);
    detailHosts.forEach((obj, index) => {
      const matchKey = deliveryMatchKey(obj, index);
      const rows = collectDetailRowsFromObject(obj, MOBILE_DETAIL_FIELDS);
      if (rows.length) {
        panels.push({ title: deliveryTitle(obj, index), rows, matchKey });
      }
      const customer = findCustomerObject(obj) || findCustomerObjectDeep(obj);
      const customerRows = customer ? collectCustomerDetailRows(customer) : [];
      if (customerRows.length) {
        panels.push({ title: customerTitle(obj, index), rows: customerRows, matchKey });
      }
    });
  }

  // Root / shipment-level customer fallback
  if (!panels.some((p) => p.title.startsWith("Customer details"))) {
    const rootCustomer =
      findCustomerObject(root) ||
      findCustomerObject(root.ShipmentDetail) ||
      findCustomerObjectDeep(root) ||
      findCustomerObject(payload);
    const rows = rootCustomer ? collectCustomerDetailRows(rootCustomer) : [];
    if (rows.length) panels.push({ title: "Customer details", rows, matchKey: "^shipment" });
  }

  // Lat/long-only fallback if customer panel exists without map link
  if (!panels.some((p) => p.rows.some((r) => r.isLink))) {
    const lat = deepFindFirstValue(root, ["Latitude", "Lat", "CustomerLatitude"]);
    const lng = deepFindFirstValue(root, ["Longitude", "Long", "Lng", "CustomerLongitude"]);
    const mapUrl = buildMapUrl(lat, lng);
    if (mapUrl) {
      let customerPanel = panels.find((p) => p.title.startsWith("Customer details"));
      if (!customerPanel) {
        customerPanel = { title: "Customer details", rows: [], matchKey: "^shipment" };
        panels.push(customerPanel);
      }
      if (lat) customerPanel.rows.push({ label: "Latitude", value: String(lat) });
      if (lng) customerPanel.rows.push({ label: "Longitude", value: String(lng) });
      customerPanel.rows.push({
        label: "Map location",
        value: `${lat}, ${lng}`,
        href: mapUrl,
        isLink: true
      });
    }
  }

  return panels;
}

function findCustomerObjectDeep(source) {
  if (!source || typeof source !== "object") return null;
  const direct = findCustomerObject(source);
  if (direct) return direct;
  const nested = deepCollectObjectsWithHints(source, [
    ...CUSTOMER_DETAIL_FIELDS,
    "Latitude",
    "Longitude",
    "Lat",
    "Long"
  ]);
  for (const obj of nested) {
    const c = findCustomerObject(obj);
    if (c) return c;
  }
  // Object itself has lat/long
  if (
    firstDefined(source, ["Latitude", "Lat", "CustomerLatitude"]) != null &&
    firstDefined(source, ["Longitude", "Long", "Lng", "CustomerLongitude"]) != null
  ) {
    return source;
  }
  return null;
}

function clearShipmentDetails() {
  lastDetailPanels = [];
  lastShipmentMeta = null;
  if (shipmentDetailsMount) shipmentDetailsMount.innerHTML = "";
  closeDetailsModal();
}

function panelsForMatchKey(panels, matchKey) {
  if (!panels?.length) return [];
  if (!matchKey) return panels;
  const exact = panels.filter((p) => p.matchKey === matchKey);
  if (exact.length) return exact;
  // Fuzzy: delivery band key "1 (#149661984)" vs panel key / delivery number
  return panels.filter((p) => {
    if (!p.matchKey) return false;
    if (matchKey.includes(p.matchKey) || p.matchKey.includes(matchKey)) return true;
    const dn = String(matchKey).match(/#([^)]+)\)/);
    if (dn && String(p.matchKey).includes(dn[1])) return true;
    return false;
  });
}

function buildDetailsPanelHtml(panel) {
  const section = document.createElement("section");
  section.className = "detail-panel";
  const head = document.createElement("div");
  head.className = "detail-panel-head";
  head.textContent = panel.title;
  const grid = document.createElement("div");
  grid.className = "detail-panel-grid";
  // Highlighted status rows first
  const ordered = [...panel.rows].sort((a, b) => Number(Boolean(b.highlight)) - Number(Boolean(a.highlight)));
  for (const row of ordered) {
    const item = document.createElement("div");
    item.className = row.highlight ? "detail-item detail-item-highlight" : "detail-item";
    if (row.fieldKey) item.dataset.field = row.fieldKey;
    const lab = document.createElement("div");
    lab.className = "detail-label";
    lab.textContent = row.label;
    const val = document.createElement("div");
    val.className = "detail-value";
    if (row.isLink && row.href) {
      const a = document.createElement("a");
      a.href = row.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "detail-map-link";
      a.textContent = `Open in Maps (${row.value})`;
      val.appendChild(a);
    } else if (row.highlight) {
      const badge = createStatusBadge(row.label, row.value);
      if (DROP_OFF_DETAIL_FIELDS.has(row.fieldKey)) {
        badge.classList.remove("status-badge-ok", "status-badge-warn", "status-badge-bad", "status-badge-accent", "status-badge-neutral");
        badge.classList.add("status-badge-dropoff");
      }
      val.appendChild(badge);
    } else {
      val.textContent = row.value;
    }
    item.append(lab, val);
    grid.appendChild(item);
  }
  section.append(head, grid);
  return section;
}

function openDetailsModal(title, panels) {
  if (!detailsModal || !detailsModalBody || !detailsModalTitle) return;
  if (!panels?.length) return;
  detailsModalTitle.textContent = title || "Delivery info";
  detailsModalBody.innerHTML = "";
  for (const panel of panels) {
    detailsModalBody.appendChild(buildDetailsPanelHtml(panel));
  }
  detailsModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeDetailsModal() {
  if (!detailsModal) return;
  detailsModal.hidden = true;
  if (detailsModalBody) detailsModalBody.innerHTML = "";
  document.body.classList.remove("modal-open");
}

function createInfoIconButton(label, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "info-icon-btn";
  btn.setAttribute("aria-label", label);
  btn.title = label;
  btn.innerHTML = `<span class="info-icon-glyph" aria-hidden="true">i</span>`;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });
  return btn;
}

/**
 * Store detail panels for info-icon popups (not shown as always-visible cards).
 */
function renderShipmentDetails(panels) {
  lastDetailPanels = Array.isArray(panels) ? panels : [];
  if (shipmentDetailsMount) shipmentDetailsMount.innerHTML = "";
}

/** When there are no delivery barcode bands, show info icons in the details mount. */
function renderDetailsInfoFallback(entries) {
  if (!shipmentDetailsMount || !lastDetailPanels.length) return;
  const bands = groupEntriesIntoLayoutBands(entries || []);
  if (bands.some((b) => b.type === "delivery")) return;

  const bar = document.createElement("div");
  bar.className = "delivery-info-bar";
  const label = document.createElement("span");
  label.className = "delivery-info-bar-label";
  label.textContent = "Delivery info";
  bar.appendChild(label);
  bar.appendChild(
    createInfoIconButton("View delivery info", () => {
      openDetailsModal("Delivery & customer info", lastDetailPanels);
    })
  );

  const keys = [];
  for (const p of lastDetailPanels) {
    const key = p.matchKey || "^all";
    if (key === "^shipment" || key === "^all") continue;
    if (!keys.includes(key)) keys.push(key);
  }
  for (const key of keys) {
    const related = panelsForMatchKey(lastDetailPanels, key);
    if (!related.length) continue;
    const wrap = document.createElement("span");
    wrap.className = "delivery-info-chip";
    const text = document.createElement("span");
    text.className = "delivery-info-chip-text";
    text.textContent = key;
    wrap.appendChild(text);
    wrap.appendChild(
      createInfoIconButton(`View info for ${key}`, () => {
        openDetailsModal(`Info · ${key}`, related);
      })
    );
    bar.appendChild(wrap);
  }
  shipmentDetailsMount.appendChild(bar);
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
  const expectedDeliveries =
    readCountField(payload, ["NoOfDeliveries", "NumberOfDeliveries"]) ??
    readCountField(detail || {}, ["NoOfDeliveries", "NumberOfDeliveries"]);
  const expectedItems =
    readCountField(payload, ["NoOfDeliveryItems", "NumberOfDeliveryItems", "NoOfItems"]) ??
    readCountField(detail || {}, ["NoOfDeliveryItems", "NumberOfDeliveryItems", "NoOfItems"]);
  const shipmentNumber = String(detail?.ShipmentNumber ?? "").trim();
  lastShipmentMeta = {
    shipmentNumber,
    expectedDeliveries,
    expectedItems,
    deliveryCount: deliveries.length,
    itemCount: items.length
  };

  if (detail) {
    pushField(rows, "ShipmentNumber", detail.ShipmentNumber);
    pushBolBarcode(rows, "", detail);
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

  function pushNsapLineFields(deliveryPrefix, it, del) {
    const prefix = `${deliveryPrefix} — ${nsapItemClassPrefix(it)}`;
    const equipment = it.EquipmentNumber ?? del?.EquipmentNumber;
    const material = it.MaterialNumber ?? it.ProductNumber;
    pushField(rows, `${prefix} — CompartmentBottomSeal`, it.CompartmentBottomSeal);
    pushField(rows, `${prefix} — CompartmentEVDSeal`, it.CompartmentEVDSeal);
    if (showCompartmentBatchForContainerType(it)) {
      pushField(rows, `${prefix} — CompartmentBatch`, it.CompartmentBatch);
    }
    pushField(rows, `${prefix} — StorageUnitNumber`, it.StorageUnitNumber);
    pushField(rows, `${prefix} — TransporterBatchNumber`, it.TransporterBatchNumber);
    pushField(rows, `${prefix} — TransporterSerialNumber`, it.TransporterSerialNumber);
    pushField(rows, `${prefix} — GTIN`, it.GTIN);
    pushField(rows, `${prefix} — EANNumber`, it.EANNumber);
    pushField(rows, `${prefix} — YSLDPackageCode`, it.YSLDPackageCode);
    pushField(rows, `${prefix} — ProductNumber`, it.ProductNumber);
    pushField(rows, `${prefix} — MaterialNumber`, it.MaterialNumber);
    // Per item + equipment: EquipmentNumber/MaterialNumber
    pushSlashComposite(
      rows,
      `${prefix} — Equipment ${equipment != null && String(equipment).trim() ? String(equipment).trim() : "1"} — EquipmentNumber/MaterialNumber`,
      equipment,
      material
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/ProductNumber`,
      equipment,
      it.ProductNumber
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/EANNumber`,
      equipment,
      it.EANNumber
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/GTIN`,
      equipment,
      it.GTIN
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/FormulaCode`,
      equipment,
      it.FormulaCode
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/YSLDPackageCode`,
      equipment,
      it.YSLDPackageCode
    );
  }

  deliveries.forEach((del, index) => {
    const p = nsapDeliveryPrefix(deliveries, del, index);

    pushField(rows, `${p} — DeliveryNumber`, del.DeliveryNumber);
    pushBolBarcode(rows, p, del);
    // Delivery-level storage / transporter barcodes when present on the delivery itself
    pushField(rows, `${p} — StorageUnitNumber`, del.StorageUnitNumber);
    pushField(rows, `${p} — TransporterBatchNumber`, del.TransporterBatchNumber);
    pushField(rows, `${p} — TransporterSerialNumber`, del.TransporterSerialNumber);

    for (const it of lineItemsForDelivery(del)) {
      pushNsapLineFields(p, it, del);
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
    pushNsapLineFields(orphan, it, null);
  }

  return dedupeRows(rows);
}

/**
 * Barcodes for /api/syncShipmentDetail/{id}?getFullDetail=True — only the mobile CT fields.
 */
const SYNC_BARCODE_SIMPLE_FIELDS = [
  "MaterialNumber",
  "GTIN",
  "EANNumber",
  "YSLDPackageCode",
  "StorageUnitNumber",
  "CompartmentNumber",
  "CompartmentBottomSeal",
  "CompartmentEVDSeal",
  "CompartmentBatch",
  "CompartmentHU",
  "TransporterBatchNumber",
  "TransporterSerialNumber"
];

const SYNC_ITEM_HINT_KEYS = [
  "MaterialNumber",
  "CompartmentNumber",
  "CompartmentEVDSeal",
  "CompartmentBatch",
  "CompartmentHU",
  "TransporterBatchNumber",
  "TransporterSerialNumber",
  "ShipmentDeliveryItemSerialNumbers",
  "StorageUnitNumber",
  "YSLDPackageCode",
  "EquipmentNumber"
];

function firstDefined(obj, keys) {
  if (!obj || typeof obj !== "object") return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== "") {
      return obj[key];
    }
    // case-insensitive fallback
    const found = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase());
    if (found && obj[found] !== undefined && obj[found] !== null && String(obj[found]).trim() !== "") {
      return obj[found];
    }
  }
  return undefined;
}

function objectHasAnyHint(obj, hints) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  const keys = Object.keys(obj);
  return hints.some((h) => keys.some((k) => k.toLowerCase() === h.toLowerCase()));
}

function deepFindFirstValue(node, keyNames, depth = 0, seen = new Set()) {
  if (node == null || depth > 10) return undefined;
  if (typeof node !== "object") return undefined;
  if (seen.has(node)) return undefined;
  seen.add(node);
  if (!Array.isArray(node)) {
    const direct = firstDefined(node, keyNames);
    if (direct !== undefined) return direct;
  }
  const values = Array.isArray(node) ? node : Object.values(node);
  for (const v of values) {
    const found = deepFindFirstValue(v, keyNames, depth + 1, seen);
    if (found !== undefined) return found;
  }
  return undefined;
}

function deepCollectObjectsWithHints(node, hints, out = [], depth = 0, seen = new Set()) {
  if (node == null || depth > 12) return out;
  if (typeof node !== "object") return out;
  if (seen.has(node)) return out;
  seen.add(node);
  if (Array.isArray(node)) {
    for (const item of node) deepCollectObjectsWithHints(item, hints, out, depth + 1, seen);
    return out;
  }
  if (objectHasAnyHint(node, hints)) out.push(node);
  for (const v of Object.values(node)) {
    if (v && typeof v === "object") deepCollectObjectsWithHints(v, hints, out, depth + 1, seen);
  }
  return out;
}

function findArrayByNameHints(root, nameHints) {
  const found = [];
  function walk(node, depth = 0, seen = new Set()) {
    if (!node || typeof node !== "object" || depth > 8 || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) return;
    for (const [key, val] of Object.entries(node)) {
      if (Array.isArray(val) && nameHints.some((h) => key.toLowerCase().includes(h.toLowerCase()))) {
        found.push(...val.filter((x) => x && typeof x === "object"));
      } else if (val && typeof val === "object") {
        walk(val, depth + 1, seen);
      }
    }
  }
  walk(root);
  return found;
}

const SYNC_DELIVERY_ARRAY_KEYS = [
  "ShipmentDeliveryDetails",
  "ShipmentDeliveries",
  "DeliveryDetails",
  "Deliveries"
];

const SYNC_ITEM_ARRAY_KEYS = [
  "ShipmentDeliveryItemsDetails",
  "ShipmentDeliveryItems",
  "DeliveryItemsDetails",
  "DeliveryItems",
  "ItemsDetails",
  "LineItems"
];

function readCountField(root, keys) {
  const raw =
    firstDefined(root, keys) ??
    (root?.ShipmentDetail ? firstDefined(root.ShipmentDetail, keys) : undefined) ??
    deepFindFirstValue(root, keys);
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function objectIdentityKey(obj, keySets) {
  if (!obj || typeof obj !== "object") return null;
  for (const keys of keySets) {
    if (keys.length === 1) {
      const v = firstDefined(obj, keys);
      if (v != null && String(v).trim() !== "") return `${keys[0]}:${String(v).trim()}`;
      continue;
    }
    const parts = keys.map((k) => firstDefined(obj, [k]));
    if (parts.every((p) => p != null && String(p).trim() !== "")) {
      return keys.map((k, i) => `${k}:${String(parts[i]).trim()}`).join("|");
    }
  }
  return null;
}

function dedupeObjectsByIdentity(list, keySets) {
  const seen = new Set();
  const out = [];
  let anon = 0;
  for (const obj of list || []) {
    if (!obj || typeof obj !== "object") continue;
    let key = objectIdentityKey(obj, keySets);
    if (!key) {
      anon += 1;
      key = `anon:${anon}`;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(obj);
  }
  return out;
}

/** Prefer exact array key names (not substring) so NoOfDeliveries etc. are ignored. */
function collectArraysByExactKeys(root, keys) {
  const out = [];
  const seenArr = new Set();
  function walk(node, depth = 0, seen = new Set()) {
    if (!node || typeof node !== "object" || depth > 10 || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) return;
    for (const [key, val] of Object.entries(node)) {
      if (
        Array.isArray(val) &&
        keys.some((k) => k.toLowerCase() === String(key).toLowerCase())
      ) {
        if (seenArr.has(val)) continue;
        seenArr.add(val);
        for (const item of val) {
          if (item && typeof item === "object" && !Array.isArray(item)) out.push(item);
        }
      } else if (val && typeof val === "object") {
        walk(val, depth + 1, seen);
      }
    }
  }
  walk(root);
  return out;
}

function looksLikeDeliveryObject(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  if (firstDefined(obj, ["ShipmentDeliveryItemId"]) != null) return false;
  return (
    firstDefined(obj, ["DeliveryNumber", "ShipmentDeliveryId", "DeliveryStatus", "DeliveryType"]) !=
    null
  );
}

function looksLikeItemObject(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  if (firstDefined(obj, ["ShipmentDeliveryItemId"]) != null) return true;
  if (firstDefined(obj, ["MaterialNumber", "LineNumber"]) != null) return true;
  return (
    firstDefined(obj, ["CompartmentNumber", "CompartmentEVDSeal", "EquipmentNumber", "StorageUnitNumber"]) !=
      null && firstDefined(obj, ["DeliveryNumber", "ShipmentDeliveryId"]) != null
  );
}

function collectSyncDeliveriesAndItems(root) {
  const expectedDeliveries = readCountField(root, ["NoOfDeliveries", "NumberOfDeliveries"]);
  const expectedItems = readCountField(root, [
    "NoOfDeliveryItems",
    "NumberOfDeliveryItems",
    "NoOfItems",
    "NumberOfItems"
  ]);

  let deliveries = dedupeObjectsByIdentity(collectArraysByExactKeys(root, SYNC_DELIVERY_ARRAY_KEYS), [
    ["ShipmentDeliveryId"],
    ["DeliveryNumber"]
  ]);

  let items = dedupeObjectsByIdentity(collectArraysByExactKeys(root, SYNC_ITEM_ARRAY_KEYS), [
    ["ShipmentDeliveryItemId"],
    ["LineNumber", "ShipmentDeliveryId"],
    ["LineNumber", "DeliveryNumber"]
  ]);

  // Nested items under each delivery (when root item array is missing/short)
  if (!items.length || (expectedItems != null && items.length < expectedItems)) {
    const nested = [];
    for (const del of deliveries) {
      const found = collectArraysByExactKeys(del, SYNC_ITEM_ARRAY_KEYS);
      for (const it of found) {
        const copy = { ...it };
        if (
          firstDefined(copy, ["ShipmentDeliveryId"]) == null &&
          firstDefined(del, ["ShipmentDeliveryId"]) != null
        ) {
          copy.ShipmentDeliveryId = firstDefined(del, ["ShipmentDeliveryId"]);
        }
        if (
          firstDefined(copy, ["DeliveryNumber"]) == null &&
          firstDefined(del, ["DeliveryNumber"]) != null
        ) {
          copy.DeliveryNumber = firstDefined(del, ["DeliveryNumber"]);
        }
        nested.push(copy);
      }
    }
    items = dedupeObjectsByIdentity([...items, ...nested], [
      ["ShipmentDeliveryItemId"],
      ["LineNumber", "ShipmentDeliveryId"],
      ["LineNumber", "DeliveryNumber"]
    ]);
  }

  if (!deliveries.length || (expectedDeliveries != null && deliveries.length < expectedDeliveries)) {
    const more = deepCollectObjectsWithHints(root, [
      "DeliveryNumber",
      "ShipmentDeliveryId",
      "DeliveryStatus"
    ]).filter(looksLikeDeliveryObject);
    deliveries = dedupeObjectsByIdentity([...deliveries, ...more], [
      ["ShipmentDeliveryId"],
      ["DeliveryNumber"]
    ]);
  }

  if (!items.length || (expectedItems != null && items.length < expectedItems)) {
    const more = deepCollectObjectsWithHints(root, SYNC_ITEM_HINT_KEYS).filter(looksLikeItemObject);
    items = dedupeObjectsByIdentity([...items, ...more], [
      ["ShipmentDeliveryItemId"],
      ["LineNumber", "ShipmentDeliveryId"],
      ["LineNumber", "DeliveryNumber"]
    ]);
  }

  if (!items.length && deliveries.length) {
    items = deliveries.slice();
  }

  return {
    deliveries,
    items,
    expectedDeliveries,
    expectedItems,
    shipmentNumber:
      String(
        deepFindFirstValue(root, ["ShipmentNumber"]) ??
          firstDefined(root.ShipmentDetail || {}, ["ShipmentNumber"]) ??
          ""
      ).trim()
  };
}

function collectSyncShipmentBarcodeRows(payload) {
  const rows = [];
  const root = normalizeSyncShipmentPayload(payload) || payload;
  if (!root || typeof root !== "object") {
    lastShipmentMeta = null;
    return rows;
  }

  const collected = collectSyncDeliveriesAndItems(root);
  const { deliveries, items, expectedDeliveries, expectedItems, shipmentNumber } = collected;
  pushField(rows, "ShipmentNumber", shipmentNumber);
  pushBolBarcode(rows, "", root);
  pushBolBarcode(rows, "", root.ShipmentDetail || {});

  lastShipmentMeta = {
    shipmentNumber,
    expectedDeliveries,
    expectedItems,
    deliveryCount: deliveries.length,
    itemCount: items.length
  };

  function pickItemField(it, keys) {
    if (!it || typeof it !== "object") return undefined;
    const direct = firstDefined(it, keys);
    if (direct !== undefined) return direct;
    for (const nestKey of [
      "Equipment",
      "EquipmentDetail",
      "EquipmentDetails",
      "Material",
      "MaterialDetail",
      "Product",
      "ProductDetail"
    ]) {
      const nest = it[nestKey];
      if (nest && typeof nest === "object" && !Array.isArray(nest)) {
        const nested = firstDefined(nest, keys);
        if (nested !== undefined) return nested;
      }
    }
    return undefined;
  }

  function shipmentDeliveryItemIdOf(it) {
    const id = firstDefined(it, ["ShipmentDeliveryItemId"]);
    if (id == null) return "";
    return String(id).trim();
  }

  /**
   * Collect equipment-level records under a ShipmentDeliveryItem.
   * Each entry can carry its own EquipmentNumber (+ optional MaterialNumber).
   */
  function collectEquipmentRecords(it, del) {
    const out = [];
    const seen = new Set();

    function addEquip(source, fallbackMaterial) {
      if (!source || typeof source !== "object") return;
      const eqParts = barcodeValueParts(
        firstDefined(source, ["EquipmentNumber"]) ?? source.EquipmentNumber
      );
      const matParts = barcodeValueParts(
        firstDefined(source, ["MaterialNumber", "ProductNumber"]) ??
          fallbackMaterial ??
          firstDefined(source, ["MaterialNumber"])
      );
      const eqId = firstDefined(source, ["EquipmentId", "ShipmentEquipmentId", "Id"]);
      for (const eq of eqParts.length ? eqParts : [""]) {
        if (!eq) continue;
        const materials = matParts.length ? matParts : barcodeValueParts(fallbackMaterial);
        if (!materials.length) continue;
        for (const mat of materials) {
          const key = `${eq}\0${mat}\0${eqId ?? ""}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({
            equipmentNumber: eq,
            materialNumber: mat,
            equipmentId: eqId != null ? String(eqId).trim() : ""
          });
        }
      }
    }

    const itemMaterial =
      pickItemField(it, ["MaterialNumber"]) ?? pickItemField(it, ["ProductNumber"]);

    // Nested equipment arrays on the item
    for (const key of [
      "Equipments",
      "EquipmentDetails",
      "EquipmentList",
      "ShipmentEquipments",
      "EquipmentNumbers"
    ]) {
      const arr = it?.[key];
      if (Array.isArray(arr)) {
        for (const eqObj of arr) addEquip(eqObj, itemMaterial);
      }
    }

    // Single nested equipment object
    for (const key of ["Equipment", "EquipmentDetail"]) {
      const obj = it?.[key];
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        addEquip(obj, itemMaterial);
      }
    }

    // Flat EquipmentNumber on the item only when no nested equipment records exist
    if (!out.length) {
      const flatEq = it?.EquipmentNumber ?? firstDefined(it, ["EquipmentNumber"]);
      if (flatEq != null) {
        addEquip({ EquipmentNumber: flatEq, MaterialNumber: itemMaterial }, itemMaterial);
      }
    }

    // Delivery-level equipment only when this item still has none
    if (!out.length && del) {
      const delEq = firstDefined(del, ["EquipmentNumber"]);
      if (delEq != null && itemMaterial != null) {
        addEquip({ EquipmentNumber: delEq, MaterialNumber: itemMaterial }, itemMaterial);
      }
      for (const key of ["Equipments", "EquipmentDetails", "EquipmentList"]) {
        const arr = del?.[key];
        if (Array.isArray(arr)) {
          for (const eqObj of arr) addEquip(eqObj, itemMaterial);
        }
      }
      if (del.Equipment && typeof del.Equipment === "object" && !Array.isArray(del.Equipment)) {
        addEquip(del.Equipment, itemMaterial);
      }
    }

    return out;
  }

  /**
   * EquipmentNumber/MaterialNumber at Equipment level, scoped by ShipmentDeliveryItemId.
   * One barcode per equipment (+ material) under that item.
   */
  function pushEquipmentMaterialForItem(deliveryPrefix, it, del) {
    const itemId = shipmentDeliveryItemIdOf(it);
    if (!itemId) return false;
    const equipments = collectEquipmentRecords(it, del);
    if (!equipments.length) return false;

    const before = rows.length;
    equipments.forEach((eq, index) => {
      const parts = [`${deliveryPrefix} — ShipmentDeliveryItemId ${itemId}`];
      if (eq.equipmentId) {
        parts.push(`EquipmentId ${eq.equipmentId}`);
      } else if (equipments.length > 1) {
        parts.push(`Equipment ${index + 1}`);
      } else {
        parts.push(`Equipment ${eq.equipmentNumber}`);
      }
      const prefix = parts.join(" — ");
      pushSlashComposite(
        rows,
        `${prefix} — EquipmentNumber/MaterialNumber`,
        eq.equipmentNumber,
        eq.materialNumber
      );
    });
    return rows.length > before;
  }

  function itemPrefix(index, it, deliveryPrefix) {
    const base = deliveryPrefix || String(index + 1);
    const itemId = shipmentDeliveryItemIdOf(it);
    if (itemId) return `${base} — ShipmentDeliveryItemId ${itemId}`;
    const line = firstDefined(it, ["LineNumber"]);
    if (line != null) return `${base} — LineNumber ${String(line).trim()}`;
    return `${base} — item ${index + 1}`;
  }

  function deliveryPrefixForItem(it, fallbackIndex) {
    for (let i = 0; i < deliveries.length; i += 1) {
      const del = deliveries[i];
      const dId = firstDefined(del, ["ShipmentDeliveryId"]);
      const iId = firstDefined(it, ["ShipmentDeliveryId"]);
      if (dId != null && iId != null && String(dId) === String(iId)) {
        return nsapDeliveryPrefix(deliveries, del, i);
      }
      const dDn = firstDefined(del, ["DeliveryNumber"]);
      const iDn = firstDefined(it, ["DeliveryNumber"]);
      if (dDn != null && iDn != null && String(dDn) === String(iDn)) {
        return nsapDeliveryPrefix(deliveries, del, i);
      }
    }
    const dn = firstDefined(it, ["DeliveryNumber"]);
    if (dn != null) return `#${String(dn).trim()}`;
    const delId = firstDefined(it, ["ShipmentDeliveryId"]);
    if (delId != null) return `delivery id ${String(delId).trim()}`;
    return String(fallbackIndex + 1);
  }

  function pushSyncLineFields(prefix, it, del) {
    // Other item-level barcodes (seals, material, etc.)
    for (const field of SYNC_BARCODE_SIMPLE_FIELDS) {
      pushField(rows, `${prefix} — ${field}`, it?.[field] ?? firstDefined(it, [field]));
    }
    pushSerialField(
      rows,
      `${prefix} — ShipmentDeliveryItemSerialNumbers`,
      it?.ShipmentDeliveryItemSerialNumbers ??
        firstDefined(it, ["ShipmentDeliveryItemSerialNumbers"])
    );
    // Equipment slash composites except Material (Material is handled by pushEquipmentMaterialForItem)
    const equipment =
      pickItemField(it, ["EquipmentNumber"]) ??
      (del ? firstDefined(del, ["EquipmentNumber"]) : undefined);
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/FormulaCode`,
      equipment,
      it?.FormulaCode ?? firstDefined(it, ["FormulaCode"])
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/GTIN`,
      equipment,
      it?.GTIN ?? it?.Gtin ?? firstDefined(it, ["GTIN", "Gtin"])
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/EANNumber`,
      equipment,
      it?.EANNumber ?? it?.EanNumber ?? firstDefined(it, ["EANNumber", "EanNumber"])
    );
    pushSlashComposite(
      rows,
      `${prefix} — EquipmentNumber/YSLDPackageCode`,
      equipment,
      it?.YSLDPackageCode ?? firstDefined(it, ["YSLDPackageCode"])
    );
  }

  function itemBelongsToDelivery(it, del) {
    const dId = firstDefined(del, ["ShipmentDeliveryId"]);
    const iId = firstDefined(it, ["ShipmentDeliveryId"]);
    if (dId != null && iId != null && String(dId) === String(iId)) return true;
    const dDn = firstDefined(del, ["DeliveryNumber"]);
    const iDn = firstDefined(it, ["DeliveryNumber"]);
    return dDn != null && iDn != null && String(dDn) === String(iDn);
  }

  function enrichItemFromDelivery(it, del) {
    const enriched = { ...it };
    if (!del) return enriched;
    for (const field of [
      "EquipmentNumber",
      "StorageUnitNumber",
      "TransporterBatchNumber",
      "TransporterSerialNumber"
    ]) {
      const itemEmpty =
        enriched[field] == null ||
        (typeof enriched[field] !== "object" && String(enriched[field]).trim() === "");
      const delVal = del[field];
      if (
        itemEmpty &&
        delVal != null &&
        (typeof delVal === "object" || String(delVal).trim() !== "")
      ) {
        enriched[field] = delVal;
      }
    }
    if (
      (enriched.DeliveryNumber == null || String(enriched.DeliveryNumber).trim() === "") &&
      del.DeliveryNumber != null
    ) {
      enriched.DeliveryNumber = del.DeliveryNumber;
    }
    if (
      (enriched.ShipmentDeliveryId == null || String(enriched.ShipmentDeliveryId).trim() === "") &&
      del.ShipmentDeliveryId != null
    ) {
      enriched.ShipmentDeliveryId = del.ShipmentDeliveryId;
    }
    return enriched;
  }

  function sortByShipmentDeliveryItemId(list) {
    return list.slice().sort((a, b) => {
      const ia = Number(shipmentDeliveryItemIdOf(a));
      const ib = Number(shipmentDeliveryItemIdOf(b));
      if (Number.isFinite(ia) && Number.isFinite(ib) && ia !== ib) return ia - ib;
      return shipmentDeliveryItemIdOf(a).localeCompare(shipmentDeliveryItemIdOf(b));
    });
  }

  const usedItemKeys = new Set();
  const eqMaterialItemIds = new Set();

  // Delivery → ShipmentDeliveryItems: EquipmentNumber/MaterialNumber by ShipmentDeliveryItemId
  deliveries.forEach((del, dIndex) => {
    const p = nsapDeliveryPrefix(deliveries, del, dIndex);
    pushField(rows, `${p} — DeliveryNumber`, firstDefined(del, ["DeliveryNumber"]));
    pushBolBarcode(rows, p, del);
    pushField(rows, `${p} — StorageUnitNumber`, firstDefined(del, ["StorageUnitNumber"]));
    pushField(rows, `${p} — TransporterBatchNumber`, firstDefined(del, ["TransporterBatchNumber"]));
    pushField(rows, `${p} — TransporterSerialNumber`, firstDefined(del, ["TransporterSerialNumber"]));

    const lineItems = sortByShipmentDeliveryItemId(
      items.filter((it) => itemBelongsToDelivery(it, del))
    );
    lineItems.forEach((it, itemIndex) => {
      const itemId = shipmentDeliveryItemIdOf(it);
      const idKey =
        (itemId && `ShipmentDeliveryItemId:${itemId}`) ||
        objectIdentityKey(it, [
          ["ShipmentDeliveryItemId"],
          ["LineNumber", "ShipmentDeliveryId"],
          ["LineNumber", "DeliveryNumber"]
        ]) ||
        `anon:${dIndex}:${itemIndex}`;
      usedItemKeys.add(idKey);
      const enriched = enrichItemFromDelivery(it, del);
      pushSyncLineFields(itemPrefix(itemIndex, enriched, p), enriched, del);
      if (pushEquipmentMaterialForItem(p, enriched, del) && itemId) {
        eqMaterialItemIds.add(itemId);
      }
    });
  });

  // Orphan ShipmentDeliveryItems not matched to a delivery
  sortByShipmentDeliveryItemId(items).forEach((it, index) => {
    const itemId = shipmentDeliveryItemIdOf(it);
    const idKey =
      (itemId && `ShipmentDeliveryItemId:${itemId}`) ||
      objectIdentityKey(it, [
        ["ShipmentDeliveryItemId"],
        ["LineNumber", "ShipmentDeliveryId"],
        ["LineNumber", "DeliveryNumber"]
      ]) ||
      `orphan:${index}`;
    if (usedItemKeys.has(idKey)) return;
    const dPrefix = deliveryPrefixForItem(it, index);
    pushField(rows, `${dPrefix} — DeliveryNumber`, firstDefined(it, ["DeliveryNumber"]));
    const enriched = enrichItemFromDelivery(it, null);
    pushSyncLineFields(itemPrefix(index, enriched, dPrefix), enriched, null);
    if (pushEquipmentMaterialForItem(dPrefix, enriched, null) && itemId) {
      eqMaterialItemIds.add(itemId);
    }
  });

  // Final pass: every ShipmentDeliveryItemId must get EquipmentNumber/MaterialNumber when both sides exist
  sortByShipmentDeliveryItemId(items).forEach((it) => {
    const itemId = shipmentDeliveryItemIdOf(it);
    if (!itemId || eqMaterialItemIds.has(itemId)) return;
    const parentDel =
      deliveries.find((del) => itemBelongsToDelivery(it, del)) || null;
    const dPrefix = parentDel
      ? nsapDeliveryPrefix(deliveries, parentDel, deliveries.indexOf(parentDel))
      : deliveryPrefixForItem(it, 0);
    const enriched = enrichItemFromDelivery(it, parentDel);
    if (pushEquipmentMaterialForItem(dPrefix, enriched, parentDel)) {
      eqMaterialItemIds.add(itemId);
    }
  });

  if (!deliveries.length && !items.length) {
    pushField(rows, "DeliveryNumber", firstDefined(root, ["DeliveryNumber"]));
    pushSyncLineFields("1", root, null);
  }

  ensureMissingSyncBarcodeFields(rows, root, ["StorageUnitNumber", "TransporterBatchNumber", "BOL"]);

  const nonShipment = rows.filter((r) => jsonBarcodeGroupKey(r.label) !== "ShipmentNumber");
  if (!nonShipment.length) {
    const deepDelivery = deepFindFirstValue(root, ["DeliveryNumber"]);
    const deepMaterial = deepFindFirstValue(root, ["MaterialNumber"]);
    const deepComp = deepFindFirstValue(root, ["CompartmentNumber"]);
    const deepEvd = deepFindFirstValue(root, ["CompartmentEVDSeal"]);
    const deepBatch = deepFindFirstValue(root, ["CompartmentBatch"]);
    const deepHu = deepFindFirstValue(root, ["CompartmentHU"]);
    pushField(rows, "DeliveryNumber", deepDelivery);
    pushField(rows, "MaterialNumber", deepMaterial);
    pushField(rows, "CompartmentNumber", deepComp);
    pushField(rows, "CompartmentEVDSeal", deepEvd);
    pushField(rows, "CompartmentBatch", deepBatch);
    pushField(rows, "CompartmentHU", deepHu);
    pushField(rows, "GTIN", deepFindFirstValue(root, ["GTIN", "Gtin"]));
    pushField(rows, "EANNumber", deepFindFirstValue(root, ["EANNumber"]));
    pushField(rows, "YSLDPackageCode", deepFindFirstValue(root, ["YSLDPackageCode"]));
    pushField(rows, "StorageUnitNumber", deepFindFirstValue(root, ["StorageUnitNumber"]));
    pushField(rows, "TransporterBatchNumber", deepFindFirstValue(root, ["TransporterBatchNumber"]));
    pushField(rows, "TransporterSerialNumber", deepFindFirstValue(root, ["TransporterSerialNumber"]));
    pushSerialField(
      rows,
      "ShipmentDeliveryItemSerialNumbers",
      deepFindFirstValue(root, ["ShipmentDeliveryItemSerialNumbers"])
    );
    // No shipment-level EQ/Material — only ShipmentDeliveryItemId level
  }

  // Refresh counts from generated delivery/item bands
  const deliveryNumbers = new Set();
  const itemIds = new Set();
  for (const r of rows) {
    const g = jsonBarcodeGroupKey(r.label);
    if (g === "DeliveryNumber" && r.value) deliveryNumbers.add(String(r.value));
    const m = String(r.label).match(/ShipmentDeliveryItemId\s+(\S+)/);
    if (m) itemIds.add(m[1]);
  }
  lastShipmentMeta = {
    shipmentNumber,
    expectedDeliveries,
    expectedItems,
    deliveryCount: Math.max(deliveries.length, deliveryNumbers.size),
    itemCount: Math.max(items.length, itemIds.size)
  };

  return dedupeRows(rows);
}

function ensureMissingSyncBarcodeFields(rows, root, fields) {
  for (const field of fields) {
    const keys = field === "BOL" ? BOL_FIELD_KEYS : [field];
    const already = rows.some((r) => {
      const g = jsonBarcodeGroupKey(r.label);
      return g === field || (field === "BOL" && (g === "BOL" || BOL_FIELD_KEYS.includes(g)));
    });
    if (already) continue;
    const hosts = deepCollectObjectsWithHints(root, keys);
    let added = false;
    hosts.forEach((obj, index) => {
      const val = firstDefined(obj, keys);
      if (val == null) return;
      const dn = firstDefined(obj, ["DeliveryNumber"]);
      const prefix =
        dn != null ? `${index + 1} (#${String(dn).trim()})` : String(index + 1);
      pushField(rows, `${prefix} — ${field === "BOL" ? "BOL" : field}`, val);
      added = true;
    });
    if (!added) {
      pushField(rows, field === "BOL" ? "BOL" : field, deepFindFirstValue(root, keys));
    }
  }
}

function normalizeSyncShipmentPayload(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (Array.isArray(raw)) {
    if (!raw.length) return null;
    return normalizeSyncShipmentPayload(raw[0]);
  }
  if (
    raw.ShipmentDetail ||
    raw.ShipmentDeliveryDetails ||
    raw.ShipmentDeliveryItemsDetails ||
    raw.ShipmentNumber ||
    raw.MaterialNumber
  ) {
    return raw;
  }
  const wrappers = ["data", "Data", "result", "Result", "payload", "Payload", "content", "Content", "response", "Response"];
  for (const key of wrappers) {
    const inner = raw[key];
    if (inner && typeof inner === "object") {
      const normalized = normalizeSyncShipmentPayload(inner);
      if (normalized) return normalized;
    }
  }
  const keys = Object.keys(raw);
  if (keys.length === 1) {
    const inner = raw[keys[0]];
    if (inner && typeof inner === "object") {
      const normalized = normalizeSyncShipmentPayload(inner);
      if (normalized) return normalized;
    }
  }
  // Keep original object so deep-scan can still walk it
  return raw;
}

function dedupeRows(rows) {
  const seen = new Set();
  const out = [];
  for (const r of rows) {
    const group = jsonBarcodeGroupKey(r.label);
    // Item-level equipment slash codes: keep each label even if values match across items
    const key = group.startsWith("EquipmentNumber/")
      ? `eq:${r.label}\0${r.value}`
      : `${r.label}\0${r.value}`;
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
  // JSON paste/upload tab: classic NSAP rules first.
  const nsap = unwrapNsapPayload(data);
  if (nsap) return collectNsapBarcodeRows(nsap);
  // Mobile/sync-shaped JSON without ShipmentDetail wrapper.
  const syncRows = collectSyncShipmentBarcodeRows(data);
  if (syncRows.length) return syncRows;
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
  BOL: 218,
  BolNumber: 218,
  BOLNumber: 218,
  BillOfLading: 218,
  BillOfLadingNumber: 218,
  CompartmentNumber: 255,
  CompartmentBottomSeal: 278,
  CompartmentEVDSeal: 302,
  CompartmentBatch: 325,
  CompartmentHU: 310,
  TransporterBatchNumber: 48,
  TransporterSerialNumber: 28,
  ShipmentDeliveryItemSerialNumbers: 8,
  StorageUnitNumber: 38,
  GTIN: 152,
  EANNumber: 172,
  YSLDPackageCode: 192,
  ProductNumber: 58,
  MaterialNumber: 72,
  "EquipmentNumber/ProductNumber": 14,
  "EquipmentNumber/MaterialNumber": 22,
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

/** Layout band: shipment row, or one row per delivery prefix (header + line items). */
function jsonBarcodeLayoutBandKey(label) {
  const s = String(label || "").trim();
  if (!s) return "|empty";
  if (!s.includes(" — ")) return "^shipment";
  return s.split(" — ")[0].trim();
}

function groupEntriesIntoLayoutBands(entries) {
  const bands = [];
  const bandIndex = new Map();
  for (let i = 0; i < entries.length; i += 1) {
    const key = jsonBarcodeLayoutBandKey(entries[i].label);
    let idx = bandIndex.get(key);
    if (idx === undefined) {
      idx = bands.length;
      bandIndex.set(key, idx);
      bands.push({
        key,
        type: key === "^shipment" ? "shipment" : "delivery",
        items: []
      });
    }
    bands[idx].items.push(i);
  }
  return bands;
}

function friendlyFieldName(groupKey) {
  return FIELD_FRIENDLY_NAMES[groupKey] || groupKey;
}

function parseLabelContext(label) {
  const s = String(label || "").trim();
  const groupKey = jsonBarcodeGroupKey(s);
  const parts = s.split(" — ").map((p) => p.trim()).filter(Boolean);
  let context = "";
  if (parts.length >= 3) {
    context = parts.slice(0, -1).join(" · ");
  } else if (parts.length === 2 && groupKey !== "DeliveryNumber") {
    context = parts[0];
  } else if (parts.length === 2 && groupKey === "DeliveryNumber") {
    context = parts[0];
  }
  return {
    groupKey,
    title: friendlyFieldName(groupKey),
    context,
    raw: s
  };
}

/** @type {boolean | null} */
let localProxyAvailable = null;

function isLikelyLocalHostname(host) {
  const h = String(host || "").toLowerCase().replace(/^\[|\]$/g, "");
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "0.0.0.0" ||
    h === "::1" ||
    h.endsWith(".local")
  );
}

function shouldUseLocalApiProxy() {
  if (window.location.protocol === "file:") return false;
  if (localProxyAvailable === true) return true;
  if (localProxyAvailable === false) return isLikelyLocalHostname(window.location.hostname);
  return isLikelyLocalHostname(window.location.hostname);
}

async function detectLocalApiProxy() {
  if (window.location.protocol === "file:") {
    localProxyAvailable = false;
    return false;
  }
  try {
    const res = await fetch("/api-proxy/health", { method: "GET", cache: "no-store" });
    if (!res.ok) {
      localProxyAvailable = false;
      return false;
    }
    const data = await res.json().catch(() => null);
    localProxyAvailable = Boolean(data && data.ok);
    return localProxyAvailable;
  } catch {
    localProxyAvailable = false;
    return false;
  }
}

function buildShipmentApiUrl(env, shipmentNumber, { useProxy = shouldUseLocalApiProxy() } = {}) {
  const sn = encodeURIComponent(String(shipmentNumber || "").trim());
  const pathAndQuery = `/api/syncShipmentDetail/${sn}?getFullDetail=True`;
  if (useProxy) {
    const e = encodeURIComponent(String(env || "qa"));
    return `/api-proxy/${e}${pathAndQuery}`;
  }
  const base = API_ENV_HOSTS[env] || API_ENV_HOSTS.qa;
  return `${base}${pathAndQuery}`;
}

function collectApiErrorText(node, depth = 0) {
  if (node == null || depth > 4) return "";
  if (typeof node === "string") return node.trim();
  if (typeof node !== "object") return "";
  if (Array.isArray(node)) {
    return node.map((item) => collectApiErrorText(item, depth + 1)).filter(Boolean).join("; ");
  }
  const keys = [
    "message",
    "Message",
    "errorMessage",
    "ErrorMessage",
    "detail",
    "Detail",
    "title",
    "Title",
    "error",
    "Error",
    "exceptionMessage",
    "ExceptionMessage",
    "reason",
    "Reason"
  ];
  for (const key of keys) {
    const v = node[key];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v && typeof v === "object") {
      const nested = collectApiErrorText(v, depth + 1);
      if (nested) return nested;
    }
  }
  if (node.errors && typeof node.errors === "object") {
    const parts = [];
    for (const [field, val] of Object.entries(node.errors)) {
      const text = collectApiErrorText(val, depth + 1);
      if (text) parts.push(field ? `${field}: ${text}` : text);
    }
    if (parts.length) return parts.join("; ");
  }
  return "";
}

function formatHttpStatusLabel(status) {
  const labels = {
    400: "Bad request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    408: "Request timeout",
    409: "Conflict",
    422: "Validation failed",
    429: "Too many requests",
    500: "Server error",
    502: "Bad gateway",
    503: "Service unavailable",
    504: "Gateway timeout"
  };
  return labels[status] || `HTTP ${status}`;
}

function extractApiErrorMessage(status, text) {
  const raw = String(text || "").trim();
  if (!raw) {
    if (status === 401 || status === 403) {
      return `${formatHttpStatusLabel(status)} (${status}): token is expired or invalid. Paste a new bearer token.`;
    }
    if (status === 404) {
      return `${formatHttpStatusLabel(status)} (${status}): shipment was not found for this id.`;
    }
    return `${formatHttpStatusLabel(status)} (${status}): empty response from API.`;
  }

  try {
    const errJson = JSON.parse(raw);
    const detail = collectApiErrorText(errJson);
    if (status === 401 || status === 403) {
      return `${formatHttpStatusLabel(status)} (${status}): ${detail || "token is expired or invalid. Paste a new bearer token."}`;
    }
    if (status === 404) {
      return `${formatHttpStatusLabel(status)} (${status}): ${detail || "shipment was not found for this id."}`;
    }
    if (detail) return `${formatHttpStatusLabel(status)} (${status}): ${detail}`;
  } catch {
    const stripped = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (stripped) {
      return `${formatHttpStatusLabel(status)} (${status}): ${stripped.slice(0, 280)}`;
    }
  }
  return `${formatHttpStatusLabel(status)} (${status}).`;
}

function payloadLooksLikeApiFailure(data) {
  if (!data || typeof data !== "object") return "";
  const failed =
    data.isSuccess === false ||
    data.IsSuccess === false ||
    data.success === false ||
    data.Success === false ||
    data.status === false;
  if (!failed) return "";
  return collectApiErrorText(data) || "API returned a failure response.";
}

function normalizeBearerToken(raw) {
  let t = String(raw ?? "").trim();
  if (/^bearer\s+/i.test(t)) t = t.replace(/^bearer\s+/i, "").trim();
  return t;
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json = atob(b64 + pad);
    const payload = JSON.parse(json);
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

function formatTokenRemaining(ms) {
  if (ms <= 0) return "0m";
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${Math.max(1, totalMin)}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h < 48) return m ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

/**
 * @returns {{ state: "empty" | "unknown" | "valid" | "expiring" | "expired", expMs?: number, remainingMs?: number }}
 */
function getTokenExpiryState(token) {
  const t = normalizeBearerToken(token);
  if (!t) return { state: "empty" };
  const payload = decodeJwtPayload(t);
  if (!payload || typeof payload.exp !== "number") return { state: "unknown" };
  const expMs = payload.exp * 1000;
  const remainingMs = expMs - Date.now();
  if (remainingMs <= 0) return { state: "expired", expMs, remainingMs };
  if (remainingMs <= 5 * 60 * 1000) return { state: "expiring", expMs, remainingMs };
  return { state: "valid", expMs, remainingMs };
}

function setTokenFieldExpired(isExpired) {
  apiBearerToken?.classList.toggle("is-expired", Boolean(isExpired));
  document.querySelector(".token-row")?.classList.toggle("is-expired", Boolean(isExpired));
}

function updateTokenExpiryUi() {
  if (!tokenExpiryBadge) return;
  const info = getTokenExpiryState(apiBearerToken?.value || "");
  tokenExpiryBadge.hidden = info.state === "empty";
  tokenExpiryBadge.className = "token-expiry-badge";
  setTokenFieldExpired(info.state === "expired");

  if (info.state === "empty") {
    if (tokenExpiryHint) tokenExpiryHint.textContent = DEFAULT_TOKEN_HINT;
    return;
  }

  if (info.state === "expired") {
    tokenExpiryBadge.classList.add("is-expired");
    tokenExpiryBadge.innerHTML =
      `<span class="token-icon" aria-hidden="true">⚠</span>` +
      `<span>Expired — use a new token</span>`;
    if (tokenExpiryHint) {
      tokenExpiryHint.textContent =
        "This token has expired. Paste a fresh bearer token, then fetch again.";
    }
    return;
  }

  if (info.state === "expiring") {
    tokenExpiryBadge.classList.add("is-expiring");
    tokenExpiryBadge.innerHTML =
      `<span class="token-icon" aria-hidden="true">⏱</span>` +
      `<span>Expiring soon · ${formatTokenRemaining(info.remainingMs || 0)} left</span>`;
    if (tokenExpiryHint) {
      tokenExpiryHint.textContent =
        "Token will expire soon. Prefer pasting a new one before fetching.";
    }
    return;
  }

  if (info.state === "valid") {
    tokenExpiryBadge.classList.add("is-valid");
    tokenExpiryBadge.innerHTML =
      `<span class="token-icon" aria-hidden="true">✓</span>` +
      `<span>Valid · ${formatTokenRemaining(info.remainingMs || 0)} left</span>`;
    if (tokenExpiryHint) tokenExpiryHint.textContent = DEFAULT_TOKEN_HINT;
    return;
  }

  tokenExpiryBadge.classList.add("is-unknown");
  tokenExpiryBadge.innerHTML =
    `<span class="token-icon" aria-hidden="true">ⓘ</span>` +
    `<span>Token set (expiry unknown)</span>`;
  if (tokenExpiryHint) tokenExpiryHint.textContent = DEFAULT_TOKEN_HINT;
}

function startTokenExpiryWatcher() {
  updateTokenExpiryUi();
  if (tokenExpiryTimer) clearInterval(tokenExpiryTimer);
  tokenExpiryTimer = setInterval(updateTokenExpiryUi, 15000);
}

async function updateApiUrlPreview() {
  if (!apiUrlPreview) return;
  const env = apiEnv?.value || "qa";
  const sn = apiShipmentNumber?.value.trim() || "{shipmentId}";
  const direct = buildShipmentApiUrl(env, sn, { useProxy: false });
  await detectLocalApiProxy();
  if (shouldUseLocalApiProxy()) {
    apiUrlPreview.textContent = `${direct}  ·  via local GET proxy`;
  } else if (window.location.protocol === "file:") {
    apiUrlPreview.textContent = `${direct}  ·  open http://localhost:8080 (file:// cannot proxy)`;
  } else {
    apiUrlPreview.textContent = `${direct}  ·  CORS will block unless you use python3 serve.py`;
  }
}

function showApiStatus(msg, isError) {
  if (!apiStatus) return;
  if (!msg) {
    apiStatus.hidden = true;
    apiStatus.textContent = "";
    apiStatus.classList.remove("is-error", "is-ok");
    return;
  }
  apiStatus.hidden = false;
  apiStatus.textContent = msg;
  apiStatus.classList.toggle("is-error", Boolean(isError));
  apiStatus.classList.toggle("is-ok", !isError);
}

function unwrapApiShipmentPayload(raw) {
  return normalizeSyncShipmentPayload(raw) || raw;
}

async function fetchShipmentAndGenerate() {
  clearJsonError();
  clearShipmentDetails();
  showApiStatus("");
  const env = apiEnv?.value || "qa";
  const shipmentNumber = apiShipmentNumber?.value.trim() || "";
  const token = normalizeBearerToken(apiBearerToken?.value || "");

  if (!shipmentNumber) {
    showApiStatus("Enter a shipment id.", true);
    apiShipmentNumber?.focus();
    return;
  }
  if (!token) {
    showApiStatus("Paste a bearer token.", true);
    apiBearerToken?.focus();
    updateTokenExpiryUi();
    return;
  }

  const expiry = getTokenExpiryState(token);
  if (expiry.state === "expired") {
    showApiStatus("Token expired — paste a new bearer token, then try again.", true);
    updateTokenExpiryUi();
    apiBearerToken?.focus();
    apiBearerToken?.select?.();
    return;
  }

  await detectLocalApiProxy();
  const url = buildShipmentApiUrl(env, shipmentNumber);
  apiFetchBtn.disabled = true;
  apiFetchBtn.textContent = "Fetching…";
  if (window.location.protocol === "file:" || !shouldUseLocalApiProxy()) {
    showApiStatus(
      `Calling ${env.toUpperCase()} directly (CORS likely). Use http://localhost:8080 via python3 serve.py.`,
      true
    );
  } else {
    showApiStatus(`Calling ${env.toUpperCase()} via local proxy…`);
  }

  try {
    sessionStorage.setItem(TOKEN_SESSION_KEY, token);
    sessionStorage.setItem(ENV_SESSION_KEY, env);
    sessionStorage.setItem(SHIPMENT_SESSION_KEY, shipmentNumber);

    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    const text = await res.text();
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) updateTokenExpiryUi();
      throw new Error(extractApiErrorMessage(res.status, text));
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("API returned a non-JSON response. Check the shipment id and environment.");
    }

    const failure = payloadLooksLikeApiFailure(data);
    if (failure) throw new Error(failure);

    const payload = unwrapApiShipmentPayload(data);
    if (!payload || typeof payload !== "object") {
      throw new Error("API returned an empty shipment payload.");
    }
    const pretty = `${JSON.stringify(payload, null, 2)}\n`;
    jsonPaste.value = pretty;
    hideJsonFileRemarks();
    if (jsonFile) jsonFile.value = "";

    // API syncShipmentDetail: barcodes only for the mobile CT field list.
    lastJsonEntries = collectSyncShipmentBarcodeRows(payload);
    const detailPanels = collectShipmentDetailPanels(payload);
    if (!lastJsonEntries.length && !detailPanels.length) {
      clearShipmentDetails();
      jsonBarcodeMount.innerHTML = "";
      hideResultsSummary();
      showJsonError("Shipment loaded, but no barcode values or details were found.");
      updateJsonExportSelect();
      showApiStatus("Loaded JSON, but no encodeable fields found.", true);
      return;
    }
    clearJsonError();
    renderJsonBarcodeGrid(lastJsonEntries, detailPanels);
    const sn =
      getShipmentNumberFromParsed(payload) ||
      pickFirstValue(payload.ShipmentDetail || payload, ["ShipmentNumber"]) ||
      shipmentNumber;
    showApiStatus(
      `Loaded ${sn} from ${env.toUpperCase()} · ${lastJsonEntries.length} barcodes` +
        (lastShipmentMeta
          ? ` · deliveries ${lastShipmentMeta.deliveryCount}` +
            (lastShipmentMeta.expectedDeliveries != null
              ? `/${lastShipmentMeta.expectedDeliveries}`
              : "") +
            ` · items ${lastShipmentMeta.itemCount}` +
            (lastShipmentMeta.expectedItems != null ? `/${lastShipmentMeta.expectedItems}` : "")
          : "") +
        (detailPanels.length ? ` · ${detailPanels.length} detail panels` : ""),
      false
    );
    setActiveTab("api");
  } catch (err) {
    const raw = err?.message || String(err);
    let msg = raw;
    if (/Failed to fetch|NetworkError|Load failed|TypeError/i.test(raw)) {
      if (window.location.protocol === "file:") {
        msg =
          `Cannot fetch ${env.toUpperCase()} from a file:// page (CORS). ` +
          "Run `python3 serve.py` and open http://localhost:8080/";
      } else if (shouldUseLocalApiProxy()) {
        msg =
          `GET request failed on ${env.toUpperCase()}. Restart with \`python3 serve.py\` ` +
          "(not plain http.server) and open http://localhost:8080/ so the local API proxy can bypass CORS.";
      } else {
        msg =
          `GET request blocked by CORS on ${env.toUpperCase()}. ` +
          "Azure does not allow this website origin. Run `python3 serve.py` and open http://localhost:8080/ (hard-refresh).";
      }
    }
    showApiStatus(msg, true);
    showJsonError(msg);
  } finally {
    apiFetchBtn.disabled = false;
    apiFetchBtn.textContent = "Fetch & generate barcodes";
  }
}

function hideResultsSummary() {
  if (resultsSummary) {
    resultsSummary.hidden = true;
    resultsSummary.querySelector(".results-count-note")?.remove();
  }
  if (resultsStats) resultsStats.innerHTML = "";
  if (resultsLegend) resultsLegend.innerHTML = "";
}

function updateResultsSummary(entries, bands) {
  if (!resultsSummary || !resultsShipmentTitle || !resultsStats || !resultsLegend) return;
  if (!entries?.length) {
    hideResultsSummary();
    return;
  }

  const shipmentEntry = entries.find((e) => jsonBarcodeGroupKey(e.label) === "ShipmentNumber");
  const metaSn = lastShipmentMeta?.shipmentNumber || "";
  const shipmentValue = shipmentEntry?.value || metaSn || "Shipment barcodes";
  resultsShipmentTitle.textContent = shipmentValue;

  const deliveryBands = bands.filter((b) => b.type === "delivery").length;
  const deliveryNumbers = new Set();
  const itemIds = new Set();
  for (const e of entries) {
    if (jsonBarcodeGroupKey(e.label) === "DeliveryNumber" && e.value) {
      deliveryNumbers.add(String(e.value).trim());
    }
    const m = String(e.label).match(/ShipmentDeliveryItemId\s+(\S+)/);
    if (m) itemIds.add(m[1]);
  }

  const foundDeliveries = Math.max(
    lastShipmentMeta?.deliveryCount || 0,
    deliveryBands,
    deliveryNumbers.size
  );
  const foundItems = Math.max(lastShipmentMeta?.itemCount || 0, itemIds.size);
  const expectedDeliveries = lastShipmentMeta?.expectedDeliveries;
  const expectedItems = lastShipmentMeta?.expectedItems;

  const deliveryLabel =
    expectedDeliveries != null ? `${foundDeliveries}/${expectedDeliveries}` : String(foundDeliveries);
  const itemLabel = expectedItems != null ? `${foundItems}/${expectedItems}` : String(foundItems);

  resultsStats.innerHTML = "";
  const shipmentStatus = findStatusValue(lastDetailPanels, "ShipmentStatus");
  const stats = [
    ["Barcodes", String(entries.length)],
    ["Deliveries", deliveryLabel],
    ["Items", itemLabel]
  ];
  for (const [k, v] of stats) {
    const el = document.createElement("div");
    el.className = "stat-pill";
    const mismatch =
      (k === "Deliveries" && expectedDeliveries != null && foundDeliveries !== expectedDeliveries) ||
      (k === "Items" && expectedItems != null && foundItems !== expectedItems);
    if (mismatch) el.classList.add("stat-pill-warn");
    el.innerHTML = `<span class="stat-label">${k}</span><span class="stat-value">${v}</span>`;
    resultsStats.appendChild(el);
  }
  if (shipmentStatus) {
    resultsStats.appendChild(createStatusBadge("Shipment Status", shipmentStatus));
  }

  const countNote = document.createElement("div");
  countNote.className = "results-count-note";
  if (
    (expectedDeliveries != null && foundDeliveries !== expectedDeliveries) ||
    (expectedItems != null && foundItems !== expectedItems)
  ) {
    countNote.classList.add("is-warn");
    countNote.textContent =
      `Count mismatch vs payload: expected ${expectedDeliveries ?? "?"} deliveries / ` +
      `${expectedItems ?? "?"} items, generated ${foundDeliveries} deliveries / ${foundItems} items.`;
  } else if (expectedDeliveries != null || expectedItems != null) {
    countNote.classList.add("is-ok");
    countNote.textContent =
      `Matched payload counts` +
      (metaSn ? ` for ${metaSn}` : "") +
      `: ${foundDeliveries} deliveries, ${foundItems} items.`;
  } else {
    countNote.textContent = `${foundDeliveries} deliveries · ${foundItems} items`;
  }
  // Replace any previous note
  resultsSummary.querySelector(".results-count-note")?.remove();
  resultsSummary.appendChild(countNote);

  const seen = new Set();
  resultsLegend.innerHTML = "";
  for (const e of entries) {
    const key = jsonBarcodeGroupKey(e.label);
    if (seen.has(key)) continue;
    seen.add(key);
    const chip = document.createElement("span");
    chip.className = "legend-chip";
    chip.style.setProperty("--label-hue", String(hueForBarcodeGroup(key)));
    chip.textContent = friendlyFieldName(key);
    resultsLegend.appendChild(chip);
  }

  resultsSummary.hidden = false;
}

function appendBandHeader(parent, band, entries) {
  const header = document.createElement("div");
  header.className = "band-header";

  const titleRow = document.createElement("div");
  titleRow.className = "band-title-row";

  const title = document.createElement("div");
  title.className = "band-title";
  const count = document.createElement("span");
  count.className = "band-count";
  count.textContent = `${band.items.length} barcode${band.items.length === 1 ? "" : "s"}`;

  if (band.type === "shipment") {
    title.textContent = "Shipment";
    header.classList.add("band-header-shipment");
  } else {
    const deliveryLabel =
      band.key.startsWith("Unmatched")
        ? band.key
        : `Delivery ${band.key}`;
    title.textContent = deliveryLabel;
    const dnEntry = band.items
      .map((i) => entries[i])
      .find((e) => jsonBarcodeGroupKey(e.label) === "DeliveryNumber");
    if (dnEntry?.value) {
      const sub = document.createElement("span");
      sub.className = "band-sub";
      sub.textContent = dnEntry.value;
      title.appendChild(document.createTextNode(" "));
      title.appendChild(sub);
    }
  }

  titleRow.appendChild(title);

  const related =
    band.type === "delivery"
      ? panelsForMatchKey(lastDetailPanels, band.key)
      : lastDetailPanels.filter((p) => p.matchKey === "^shipment");

  if (band.type === "shipment") {
    const shipmentStatus =
      findStatusValue(related, "ShipmentStatus") ||
      findStatusValue(lastDetailPanels, "ShipmentStatus");
    if (shipmentStatus) {
      titleRow.appendChild(createStatusBadge("Shipment Status", shipmentStatus));
    }
  } else {
    const deliveryStatus = findStatusValue(related, "DeliveryStatus");
    if (deliveryStatus) {
      titleRow.appendChild(createStatusBadge("Delivery Status", deliveryStatus));
    }
    if (panelsHaveDropOff(related)) {
      const dropBadge = createStatusBadge("Drop Off", "Yes");
      dropBadge.classList.add("status-badge-dropoff");
      titleRow.appendChild(dropBadge);
      header.classList.add("band-header-dropoff");
      parent.classList.add("json-barcode-band-dropoff");
    }
  }

  if (related.length) {
    const modalTitle =
      band.type === "delivery" ? `Delivery info · ${band.key}` : "Shipment info";
    titleRow.appendChild(
      createInfoIconButton(modalTitle, () => {
        openDetailsModal(modalTitle, related);
      })
    );
  }

  header.append(titleRow, count);
  parent.appendChild(header);
}

function appendJsonBarcodeGapRow(parent) {
  const gapRow = document.createElement("div");
  gapRow.className = "json-barcode-gap-row";
  gapRow.setAttribute("aria-hidden", "true");
  parent.appendChild(gapRow);
}

function appendJsonBarcodeCard(parent, entries, i) {
  const { label, value } = entries[i];
  normalizeEntryRowCodeType(entries[i]);
  const meta = parseLabelContext(label);

  const row = document.createElement("div");
  row.className = "json-barcode-row";
  row.dataset.entryIndex = String(i);
  row.dataset.bcGroup = meta.groupKey;
  row.style.setProperty("--label-hue", String(hueForBarcodeGroup(meta.groupKey)));

  const lab = document.createElement("div");
  lab.className = "json-barcode-label";
  const titleEl = document.createElement("div");
  titleEl.className = "json-barcode-title";
  titleEl.textContent = meta.title;
  lab.appendChild(titleEl);
  if (meta.context) {
    const ctx = document.createElement("div");
    ctx.className = "json-barcode-context";
    ctx.textContent = meta.context;
    lab.appendChild(ctx);
  }

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
  followOpt.textContent = "Use default";
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
  valueLbl.textContent = "Encoded value";
  const valueInput = document.createElement("textarea");
  valueInput.id = `json-barcode-value-${i}`;
  valueInput.className = "json-barcode-value-text";
  valueInput.value = String(value ?? "");
  valueInput.rows = Math.min(4, Math.max(2, String(value ?? "").split("\n").length));
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
  row.append(lab, out, valueWrap);
  parent.appendChild(row);
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

function renderJsonBarcodeGrid(entries, detailPanels) {
  jsonBarcodeMount.innerHTML = "";
  if (detailPanels !== undefined) {
    renderShipmentDetails(detailPanels);
  }
  const list = entries || [];
  const bands = groupEntriesIntoLayoutBands(list);
  updateResultsSummary(list, bands);
  renderDetailsInfoFallback(list);

  for (const band of bands) {
    const bandEl = document.createElement("section");
    bandEl.className = `json-barcode-band json-barcode-band-${band.type}`;
    bandEl.dataset.bandKey = band.key;
    appendBandHeader(bandEl, band, list);

    const cards = document.createElement("div");
    cards.className = "band-cards";
    let prevBlock = null;

    for (const i of band.items) {
      const blockKey = jsonBarcodeBlockKey(list[i].label);
      if (band.type === "delivery" && prevBlock !== null && shouldInsertBarcodeItemGap(prevBlock, blockKey)) {
        appendJsonBarcodeGapRow(cards);
      }
      prevBlock = blockKey;
      appendJsonBarcodeCard(cards, list, i);
    }

    bandEl.appendChild(cards);
    jsonBarcodeMount.appendChild(bandEl);
  }
  updateJsonExportSelect();
}

function generateFromParsedData(data) {
  const detailPanels = collectShipmentDetailPanels(data);
  lastJsonEntries = extractBarcodeRowsFromJson(data);
  if (!lastJsonEntries.length && !detailPanels.length) {
    clearShipmentDetails();
    jsonBarcodeMount.innerHTML = "";
    hideResultsSummary();
    showJsonError("No barcode values or shipment details found.");
    updateJsonExportSelect();
    return false;
  }
  clearJsonError();
  renderJsonBarcodeGrid(lastJsonEntries, detailPanels);
  return true;
}

function runJsonGenerate() {
  clearJsonError();
  jsonBarcodeMount.innerHTML = "";
  clearShipmentDetails();
  lastJsonEntries = null;
  hideResultsSummary();
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
        if (!generateFromParsedData(data)) updateJsonExportSelect();
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
    clearShipmentDetails();
    lastJsonEntries = collectPlainTextRows(text);
    if (!lastJsonEntries.length) {
      showJsonError("Paste JSON, choose a file, or enter a plain value.");
      return;
    }
    renderJsonBarcodeGrid(lastJsonEntries, []);
    return;
  }

  generateFromParsedData(data);
}

jsonGenerateBtn.addEventListener("click", runJsonGenerate);

jsonClearBtn.addEventListener("click", () => {
  clearJsonError();
  jsonBarcodeMount.innerHTML = "";
  clearShipmentDetails();
  lastJsonEntries = null;
  hideResultsSummary();
  updateJsonExportSelect();
  showApiStatus("");
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

apiFetchBtn?.addEventListener("click", () => {
  void fetchShipmentAndGenerate();
});

apiClearTokenBtn?.addEventListener("click", () => {
  if (apiBearerToken) apiBearerToken.value = "";
  sessionStorage.removeItem(TOKEN_SESSION_KEY);
  updateTokenExpiryUi();
  showApiStatus("Token cleared from this session.");
});

toggleTokenBtn?.addEventListener("click", () => {
  if (!apiBearerToken) return;
  const showing = apiBearerToken.type === "text";
  apiBearerToken.type = showing ? "password" : "text";
  toggleTokenBtn.textContent = showing ? "Show" : "Hide";
});

apiEnv?.addEventListener("change", updateApiUrlPreview);
apiShipmentNumber?.addEventListener("input", updateApiUrlPreview);
apiBearerToken?.addEventListener("input", () => {
  updateTokenExpiryUi();
  const token = normalizeBearerToken(apiBearerToken.value || "");
  if (token) {
    try {
      sessionStorage.setItem(TOKEN_SESSION_KEY, token);
    } catch {
      /* ignore */
    }
  } else {
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
  }
});

apiShipmentNumber?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    void fetchShipmentAndGenerate();
  }
});

try {
  const savedToken = sessionStorage.getItem(TOKEN_SESSION_KEY);
  const savedEnv = sessionStorage.getItem(ENV_SESSION_KEY);
  const savedSn = sessionStorage.getItem(SHIPMENT_SESSION_KEY);
  if (savedToken && apiBearerToken) apiBearerToken.value = savedToken;
  if (savedEnv && apiEnv && API_ENV_HOSTS[savedEnv]) {
    apiEnv.value = savedEnv === "stage" ? "stg" : savedEnv;
  }
  if (savedSn && apiShipmentNumber) apiShipmentNumber.value = savedSn;
} catch {
  /* ignore */
}

updateApiUrlPreview();
startTokenExpiryWatcher();
refreshSavedJsonSelect();
updateJsonExportSelect();
hideResultsSummary();

function setActiveTab(tabName) {
  const tabs = document.querySelectorAll(".app-tab");
  const panels = {
    json: document.getElementById("panelJson"),
    api: document.getElementById("panelApi")
  };
  for (const btn of tabs) {
    const active = btn.dataset.tab === tabName;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  }
  for (const [name, panel] of Object.entries(panels)) {
    if (!panel) continue;
    const active = name === tabName;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  }
  if (tabName === "api") {
    updateTokenExpiryUi();
    void detectLocalApiProxy().then(() => updateApiUrlPreview());
  }
}

document.querySelectorAll(".app-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    setActiveTab(btn.dataset.tab || "json");
  });
});

document.querySelectorAll("[data-close-details-modal]").forEach((el) => {
  el.addEventListener("click", () => closeDetailsModal());
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && detailsModal && !detailsModal.hidden) {
    closeDetailsModal();
  }
});

setActiveTab("json");
