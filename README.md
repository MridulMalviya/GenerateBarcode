# GenerateBarcode

Static web app for **EVD Barcode Generator** — linear barcodes and QR codes.

## Tabs

### 1. JSON paste / upload (original)

- Paste JSON, choose a file, or load **Saved JSON**
- Click **Generate barcodes**
- Download CSV / PDF / JSON

### 2. Fetch from API (new)

1. Choose environment: **DEV / QA / QA2 / UAT / STG / PROD**
2. Enter **Shipment id** (example: `146587051`)
3. Paste **Bearer token** (expiry badge shows if JWT is expired)
4. Click **Fetch & generate barcodes**

Endpoint pattern (DEV example):

`https://digitalbulkcommonapi-dev.azurewebsites.net/api/syncShipmentDetail/{id}?getFullDetail=True`

Both tabs share the same barcode results area below.

## Run locally

Use the included proxy server (required for API fetch — Azure CORS blocks browser calls from localhost):

```bash
cd GenerateBarcode
python3 serve.py
```

Open **http://localhost:8080**.

The page uses **GET**  
`/api/syncShipmentDetail/{id}?getFullDetail=True`  
through a local proxy at `/api-proxy/{env}/...`.

## Repository

`https://github.com/MridulMalviya/GenerateBarcode.git`
