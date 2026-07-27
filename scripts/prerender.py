# -*- coding: utf-8 -*-
"""Пререндерит главную и SEO-страницы в самостоятельные статические HTML.

Использование: python scripts/prerender.py <каталог сборки>
(обычно dist или .vercel/output/static). Требуется playwright (python).
"""
from __future__ import annotations

import http.server
import io
import os
import shutil
import socketserver
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "dist").resolve()
PORT = 4517
ROUTES = [
    "/",
    "/sozdanie-saitov-donetsk/",
    "/razrabotka-saitov-dnr/",
    "/razrabotka-veb-servisov/",
    "/telegram-mini-apps/",
    "/avtomatizatsiya-biznesa/",
    "/regiony-raboty/",
]

root_index = OUT / "index.html"
if not root_index.is_file():
    sys.exit(f"Нет {root_index} — сначала выполните сборку")

# Чистые URL должны существовать до запуска локального HTTP-сервера.
# React увидит pathname и отрисует соответствующую страницу, после чего
# результат заменит временную копию шаблона.
template = root_index.read_text(encoding="utf-8")
for route in ROUTES[1:]:
    target = OUT / route.strip("/") / "index.html"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(template, encoding="utf-8", newline="\n")

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *args: object) -> None:
        return

os.chdir(OUT)
httpd = socketserver.TCPServer(
    ("127.0.0.1", PORT),
    lambda *args, **kwargs: QuietHandler(*args, directory=".", **kwargs),
)
thread = threading.Thread(target=httpd.serve_forever, daemon=True)
thread.start()

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        for route in ROUTES:
            page = browser.new_page(viewport={"width": 1440, "height": 900})
            page.goto(
                f"http://127.0.0.1:{PORT}{route}",
                wait_until="domcontentloaded",
            )
            page.wait_for_selector("h1")
            page.wait_for_timeout(500)

            if route == "/":
                # Убираем подсказку scrub из статического снимка.
                page.mouse.move(10, 10)
                page.mouse.move(12, 10)
                page.wait_for_timeout(200)

            html = page.evaluate("document.documentElement.outerHTML")
            page.close()

            target = root_index if route == "/" else OUT / route.strip("/") / "index.html"
            with io.open(target, "w", encoding="utf-8", newline="\n") as output_file:
                output_file.write("<!doctype html>\n" + html)

            size = target.stat().st_size
            print(f"prerendered: {route} -> {target} ({size} bytes)")
        browser.close()
finally:
    httpd.shutdown()
    httpd.server_close()
    thread.join(timeout=5)

if "Террикон Тех" not in root_index.read_text(encoding="utf-8"):
    sys.exit("Контент главной не попал в статический HTML")
