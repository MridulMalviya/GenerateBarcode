# GenerateBarcode

Ecolab-style barcode and QR generator web app with shipment management and verified delivery workflow.

## Features

- Multi-card barcode/QR generation
- Barcode formats: Code128, Code39, EAN-13, EAN-8, UPC-A, ITF
- Shipment manager (create and track shipments)
- Verified delivery flow with:
  - OTP generation and OTP validation
  - Receiver name capture
  - Geo-tag entry
  - Signature/note entry
  - Verification log with timestamp
- Local browser persistence using `localStorage`

## Project Structure

- `index.html` - App layout and sections
- `styles.css` - Styling and responsive UI
- `script.js` - Barcode/QR logic, shipment and verification workflows

## Run Locally

Open directly in a browser, or start a local server:

```bash
cd ecolab-verified-delivery-site
python3 -m http.server 5500
```

Then visit `http://localhost:5500`.

## Deploy

This is a static site and can be deployed easily on Netlify.

