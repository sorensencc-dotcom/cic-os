#!/usr/bin/env python3
"""
Mercury API keep-alive — makes a lightweight GET /api/v1/accounts call
so the API token stays active (Mercury deactivates tokens after 45 days
of inactivity).

Usage:
    MERCURY_API_TOKEN=<token> python3 scripts/mercury-keepalive.py
    python3 scripts/mercury-keepalive.py --token-file /path/to/token.txt
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

MERCURY_BASE = "https://api.mercury.com/api/v1"


def ping(token: str) -> dict:
    req = Request(
        f"{MERCURY_BASE}/accounts",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    try:
        with urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Mercury API error {e.code}: {body}") from e
    except URLError as e:
        raise SystemExit(f"Network error: {e.reason}") from e


def main() -> None:
    parser = argparse.ArgumentParser(description="Mercury API token keep-alive ping.")
    parser.add_argument("--token-file", help="Path to file containing the API token.")
    args = parser.parse_args()

    token = os.environ.get("MERCURY_API_TOKEN", "").strip()

    if not token and args.token_file:
        with open(args.token_file, "r", encoding="utf-8") as fh:
            token = fh.read().strip()

    if not token:
        raise SystemExit(
            "No token found. Set MERCURY_API_TOKEN env var or pass --token-file."
        )

    data = ping(token)
    accounts = data.get("accounts", [])
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] OK — {len(accounts)} account(s) returned. Token is active.")


if __name__ == "__main__":
    main()
