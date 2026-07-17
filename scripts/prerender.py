# -*- coding: utf-8 -*-
"""Пререндер главной для SEO: Яндекс рендерит JS ненадёжно (бета) и сам
рекомендует пререндер (https://yandex.ru/support/webmaster/ru/yandex-indexing/rendering).
Скрипт поднимает статический сервер над собранной папкой, открывает главную
в headless-браузере, ждёт прогрузки приложения, вписывает отрендеренный DOM
обратно в index.html и инлайнит локальные Vite CSS/JS. React при загрузке
перерисовывает #root — для пользователя ничего не меняется, а робот получает
весь контент без JS. Критический первый экран приходит одним HTML-ответом и
не зависит от параллельных CDN-запросов.

Использование: python scripts/prerender.py <папка сборки>
(dist или .vercel/output/static). Требует playwright (python).
"""
import http.server
import io
import os
import re
import socketserver
import sys
import threading

from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else "dist"
PORT = 4517

if not os.path.exists(os.path.join(OUT, "index.html")):
    sys.exit(f"нет {OUT}/index.html — сначала сборка")


def inline_vite_assets(html):
    """Инлайнит только локальные /assets CSS и module JS из Vite build."""
    asset_root = os.path.realpath(".")
    counts = {"css": 0, "js": 0, "bytes": 0}

    def read_asset(url):
        clean_url = url.split("?", 1)[0]
        relative = os.path.normpath(clean_url.lstrip("/").replace("/", os.sep))
        path = os.path.realpath(relative)
        if (
            os.path.commonpath([asset_root, path]) != asset_root
            or not relative.startswith(f"assets{os.sep}")
        ):
            raise ValueError(f"небезопасный или внешний asset: {url}")
        with io.open(path, "r", encoding="utf-8") as asset_file:
            content = asset_file.read()
        counts["bytes"] += len(content.encode("utf-8"))
        return content

    link_pattern = re.compile(
        r'<link\b(?=[^>]*\brel="stylesheet")'
        r'(?=[^>]*\bhref="([^"]+)")[^>]*>',
        re.IGNORECASE,
    )
    script_pattern = re.compile(
        r'<script\b(?=[^>]*\btype="module")'
        r'(?=[^>]*\bsrc="([^"]+)")[^>]*>\s*</script>',
        re.IGNORECASE,
    )

    def inline_css(match):
        url = match.group(1)
        if not url.startswith("/assets/"):
            return match.group(0)
        counts["css"] += 1
        css = read_asset(url).replace("</style", "<\\/style")
        return (
            f'<style data-vite-inline="{os.path.basename(url)}">\n'
            f"{css}\n</style>"
        )

    def inline_js(match):
        url = match.group(1)
        if not url.startswith("/assets/"):
            return match.group(0)
        counts["js"] += 1
        js = read_asset(url).replace("</script", "<\\/script")
        return (
            f'<script type="module" data-vite-inline="{os.path.basename(url)}">\n'
            f"{js}\n</script>"
        )

    html = link_pattern.sub(inline_css, html)
    html = script_pattern.sub(inline_js, html)
    if counts["css"] < 1 or counts["js"] < 1:
        raise RuntimeError(
            f"Vite assets не заинлайнены: css={counts['css']}, js={counts['js']}"
        )
    return html, counts


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

html, inline_counts = inline_vite_assets(html)
out_path = os.path.join(".", "index.html")
with io.open(out_path, "w", encoding="utf-8", newline="\n") as output_file:
    output_file.write("<!doctype html>\n" + html)

size = os.path.getsize(out_path)
has_h1 = "Террикон Тех" in html
print(
    f"prerendered: {out_path} ({size} bytes), h1 в статике: {has_h1}, "
    f"inline css/js: {inline_counts['css']}/{inline_counts['js']} "
    f"({inline_counts['bytes']} bytes)"
)
if not has_h1:
    sys.exit("контент не отрендерился — снапшот без заголовка")
