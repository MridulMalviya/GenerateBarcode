# GenerateBarcode

Static web app for **Ecolab-style linear barcodes and QR codes** from manual entry or **JSON** (including NSAP-shaped payloads).

## Features

### Generator panel

- Multiple input cards; add more with **+ Add Card**
- Per card: **BC** (uses global symbology) or **QR**
- Global **Code type**: Code 128, Code 39, EAN-13, EAN-8, UPC-A, ITF, QR

### JSON → Barcodes

- Paste JSON, **Choose JSON file**, or load from **Saved JSON (this browser)**
- After you pick a file, an **acknowledgment** panel shows the filename and size; it clears when you edit the editor or load a saved shipment
- **Generate barcodes** parses JSON and renders a grid of barcodes

**NSAP-style payloads** (with `ShipmentDetail`, `ShipmentDeliveryDetails`, `ShipmentDeliveryItemsDetails`):

- **ShipmentNumber** once, then **DeliveryNumber** per delivery, then line fields keyed by **ShipmentDeliveryItemId** (or **LineNumber** if item id is missing)
- Fields include seals, storage, GTIN, EAN, YSLD package code, product number, and slash composites such as `EquipmentNumber/ProductNumber` (both sides required)
- **CompartmentBatch** is omitted when `ContainerType` is **BULK**
- Rows are grouped with **color** by field type; **spacing** separates line-item blocks

**Other JSON** is walked for string/number leaves (depth/leaf limits apply).

Each barcode row includes an **editable encoded value** textarea: changes update the graphic and are used for **CSV** / **PDF** export.

### Saved JSON

- **Save current JSON** stores the editor content in **localStorage**, keyed by `ShipmentDetail.ShipmentNumber` (optional **Shipment # override** if missing)
- **Load & generate** / **Delete selected** manage saved entries (this browser only)

### Download

Use the **Download** dropdown:

| Option | Description |
|--------|-------------|
| **CSV** | Label and encoded value per row (UTF-8 with BOM for Excel) |
| **PDF** | Multi-page report with shipment header and rasterized barcodes (jsPDF) |
| **JSON** | Pretty-printed editor contents when valid JSON |

Filenames use **ShipmentNumber** when the editor JSON includes it.

## Tech stack

- Plain **HTML / CSS / JavaScript** (no build step)
- **JsBarcode**, **QRCode.js**, **jsPDF** loaded from jsDelivr CDN

## Project structure

| File | Role |
|------|------|
| `index.html` | Layout, templates, script tags |
| `styles.css` | Layout, JSON grid, exports UI |
| `script.js` | Barcode rendering, NSAP extraction, save/load, PDF/CSV/JSON export |

## Run locally

Use a local server (avoids `file://` quirks with some browsers):

```bash
cd ecolab-verified-delivery-site   # or your clone folder name
python3 -m http.server 5500
```

Open **http://localhost:5500**.

## Deploy

Static hosting only: upload the folder or connect the repo to **Netlify**, **GitHub Pages**, **Cloudflare Pages**, or similar. No server-side code required.

## Repository

Default remote for this project: `https://github.com/MridulMalviya/GenerateBarcode.git`
