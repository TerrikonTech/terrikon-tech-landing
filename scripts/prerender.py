# -*- coding: utf-8 -*-
"""Пререндер главной для SEO: Яндекс рендерит JS ненадёжно (бета) и сам
рекомендует пререндер (https://yandex.ru/support/webmaster/ru/yandex-indexing/rendering).
Скрипт поднимает статический сервер над собранной папкой, открывает главную
в headless-браузере, ждёт прогрузки приложения и вписывает отрендеренный DOM
обратно в index.html. React при загрузке перерисовывает #root — для пользователя
ничего не меняется, а робот получает весь контент без выполнения JS.

Использование: python scripts/prerender.py <папка сборки>
(dist или .vercel/output/static). Требует playwright (python).
"""
import http.server
import io
import os
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else "dist"
PORT = 4517

if not os.path.exists(os.path.join(OUT, "index.html")):
    sys.exit(f"нет {OUT}/index.html — сначала сборка")

os.chdir(OUT)
httpd = socketserver.TCPServer(
    ("127.0.0.1", PORT),
    lambda *a, **kw: http.server.SimpleHTTPRequestHandler(*a, directory=".", **kw),
)
threading.Thread(target=httpd.serve_forever, daemon=True).start()

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(f"http://127.0.0.1:{PORT}/", wait_until="domcontentloaded")
    page.wait_for_selector("h1")
    page.wait_for_timeout(1000)
    # Лёгкое движение мыши гасит скраб-хинт, чтобы он не попал в снапшот.
    page.mouse.move(10, 10)
    page.mouse.move(12, 10)
    page.wait_for_timeout(300)
    # Десктопный пререндер включает metadata для скраббинга. Перед снапшотом
    # возвращаем preload=none, иначе мобильный браузер начнёт MP4 ещё до React.
    page.eval_on_selector_all(
        "video",
        "videos => videos.forEach(video => { video.pause(); video.preload = 'none' })",
    )
    html = page.evaluate("document.documentElement.outerHTML")
    browser.close()
httpd.shutdown()

out_path = os.path.join(".", "index.html")
with io.open(out_path, "w", encoding="utf-8", newline="\n") as output_file:
    output_file.write("<!doctype html>\n" + html)

size = os.path.getsize(out_path)
has_h1 = "Террикон Тех" in html
print(f"prerendered: {out_path} ({size} bytes), h1 в статике: {has_h1}")
if not has_h1:
    sys.exit("контент не отрендерился — снапшот без заголовка")
