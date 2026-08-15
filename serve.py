#!/usr/bin/env python3
"""Local static server + CORS-safe API proxy for EVD Barcode Generator."""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse

HOSTS = {
    "dev": "https://digitalbulkcommonapi-dev.azurewebsites.net",
    "qa": "https://digitalbulkcommonapi-qa.azurewebsites.net",
    "qa2": "https://digitalbulkcommonapi-qa2.azurewebsites.net",
    "uat": "https://digitalbulkcommonapi-uat.azurewebsites.net",
    "stg": "https://digitalbulkcommonapi-stg.azurewebsites.net",
    "stage": "https://digitalbulkcommonapi-stg.azurewebsites.net",
    "prod": "https://digitalbulkcommonapi.azurewebsites.net",
}

PORT = 8080


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):
        if self.path.startswith("/api-proxy/"):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header(
                "Access-Control-Allow-Headers",
                "Authorization, Content-Type, Accept",
            )
            self.end_headers()
            return
        self.send_error(404)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ("/api-proxy/health", "/api-proxy/health/"):
            self.send_json(200, {"ok": True, "proxy": True})
            return
        if self.path.startswith("/api-proxy/"):
            self.proxy_get()
            return
        super().do_GET()

    def proxy_get(self):
        # /api-proxy/{env}/api/...
        parsed = urlparse(self.path)
        parts = [unquote(p) for p in parsed.path.split("/") if p]
        if len(parts) < 3 or parts[0] != "api-proxy":
            self.send_json(400, {"message": "Invalid proxy path. Use /api-proxy/{env}/api/..."})
            return

        env = parts[1].lower()
        base = HOSTS.get(env)
        if not base:
            self.send_json(400, {"message": f"Unknown environment: {env}"})
            return

        upstream_path = "/" + "/".join(parts[2:])
        if parsed.query:
            upstream_path = f"{upstream_path}?{parsed.query}"
        target = f"{base}{upstream_path}"

        headers = {
            "Accept": self.headers.get("Accept", "application/json"),
            "User-Agent": "EVD-Barcode-Generator-Proxy/1.0",
        }
        auth = self.headers.get("Authorization")
        if auth:
            headers["Authorization"] = auth

        req = urllib.request.Request(target, headers=headers, method="GET")
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                body = resp.read()
                self.send_response(resp.status)
                ctype = resp.headers.get("Content-Type", "application/json")
                self.send_header("Content-Type", ctype)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("X-Proxy-Target", target)
                self.end_headers()
                self.wfile.write(body)
        except urllib.error.HTTPError as err:
            body = err.read()
            self.send_response(err.code)
            ctype = err.headers.get("Content-Type", "application/json") if err.headers else "application/json"
            self.send_header("Content-Type", ctype)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("X-Proxy-Target", target)
            self.end_headers()
            self.wfile.write(body or json.dumps({"message": str(err.reason)}).encode("utf-8"))
        except Exception as err:  # noqa: BLE001
            self.send_json(
                502,
                {
                    "message": f"Proxy could not reach {env.upper()} API.",
                    "detail": str(err),
                    "target": target,
                },
            )

    def send_json(self, status: int, payload: dict):
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        print(f"[proxy] {self.address_string()} - {fmt % args}")


def main():
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"EVD Barcode Generator running at http://localhost:{PORT}/")
    print("API proxy path: /api-proxy/{env}/api/...")
    print("Open that URL (not a file:// page or GitHub Pages) so DEV/QA fetches skip CORS.")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
