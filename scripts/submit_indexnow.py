# -*- coding: utf-8 -*-
"""Отправляет все URL из sitemap.xml в IndexNow (Яндекс и Bing)."""
from __future__ import annotations

import json
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

SITE_HOST = "www.terrikontech.ru"
PUBLIC_DIR = Path(__file__).resolve().parent.parent / "public"
KEY_FILE = PUBLIC_DIR / "efc23eb942662c260db16f63cc87d54a.txt"
SITEMAP = PUBLIC_DIR / "sitemap.xml"
ENDPOINT = "https://api.indexnow.org/indexnow"

key = KEY_FILE.read_text(encoding="utf-8").strip()
root = ET.parse(SITEMAP).getroot()
namespace = {"sitemap": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [
    element.text.strip()
    for element in root.findall("sitemap:url/sitemap:loc", namespace)
    if element.text
]

payload = json.dumps(
    {
        "host": SITE_HOST,
        "key": key,
        "keyLocation": f"https://{SITE_HOST}/{KEY_FILE.name}",
        "urlList": urls,
    }
).encode("utf-8")
request = urllib.request.Request(
    ENDPOINT,
    data=payload,
    headers={"Content-Type": "application/json; charset=utf-8"},
    method="POST",
)
with urllib.request.urlopen(request, timeout=30) as response:
    status = response.status

if status not in {200, 202}:
    raise SystemExit(f"IndexNow returned HTTP {status}")
print(f"IndexNow accepted {len(urls)} URLs (HTTP {status})")
