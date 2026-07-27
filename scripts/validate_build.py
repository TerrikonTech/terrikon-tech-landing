# -*- coding: utf-8 -*-
"""Проверяет готовую production-папку после пререндера."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

STATIC_DIR = Path(sys.argv[1] if len(sys.argv) > 1 else "dist")
INDEX = STATIC_DIR / "index.html"

if not INDEX.is_file():
    sys.exit(f"нет {INDEX}")

html = INDEX.read_text(encoding="utf-8")
assert "Террикон Тех" in html, "static H1 is missing"
assert 'rel="canonical" href="https://www.terrikontech.ru/"' in html, (
    "canonical is missing"
)
assert 'src="/assets/' in html, "external Vite JS is missing"
assert 'href="/assets/' in html, "external Vite CSS is missing"
assert "data-vite-inline=" not in html, "Vite assets must stay external"
assert "terrikontech.vercel.app" not in html, "old domain is present"
assert 'id="projects"' in html, "React project content was not prerendered"
assert 'id="faq"' in html, "React FAQ content was not prerendered"

text_assets = [
    path
    for path in STATIC_DIR.rglob("*")
    if path.is_file() and path.suffix.lower() in {".html", ".js", ".css"}
]
production_text = "\n".join(
    path.read_text(encoding="utf-8", errors="ignore") for path in text_assets
)
assert "motionsites.ai" not in production_text, "external project media is present"

project_names = [
    "Space Voyage",
    "CodeNest",
    "Vex Ventures",
    "Stellar AI",
    "ASME",
]
for index, project_name in enumerate(project_names, start=1):
    media_path = STATIC_DIR / "marquee" / f"{index:02d}.webp"
    assert project_name in html, f"project is missing from prerender: {project_name}"
    assert media_path.is_file(), f"project media is missing: {media_path}"
assert not (STATIC_DIR / "projects").exists(), "replaced project media was copied"

hero_assets = [
    STATIC_DIR / "subject-light-frames.webp",
    STATIC_DIR / "subject-dark-frames.webp",
    STATIC_DIR / "subject-light-poster.webp",
    STATIC_DIR / "subject-dark-poster.webp",
]
for media_path in hero_assets:
    assert media_path.is_file(), f"baked hero asset is missing: {media_path}"
assert ".mp4" not in production_text, "runtime video scrub is still referenced"
assert not list(STATIC_DIR.glob("portrait-scrub*.mp4")), "source hero video was copied"
assert not list(STATIC_DIR.glob("subject-mask-*.png")), "runtime key masks were copied"

json_ld_blocks = re.findall(
    r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
    html,
    flags=re.DOTALL | re.IGNORECASE,
)
assert json_ld_blocks, "JSON-LD is missing"
documents = [json.loads(block) for block in json_ld_blocks]

graph = next(
    (
        document.get("@graph", [])
        for document in documents
        if isinstance(document, dict) and "@graph" in document
    ),
    [],
)
organization = next(
    (
        item
        for item in graph
        if isinstance(item, dict)
        and "Organization"
        in (
            item.get("@type")
            if isinstance(item.get("@type"), list)
            else [item.get("@type")]
        )
    ),
    None,
)
assert organization, "Organization JSON-LD is missing"
offers = organization["hasOfferCatalog"]["itemListElement"]
assert len(offers) == 5, f"expected 5 services in OfferCatalog, got {len(offers)}"

projects = next(
    (
        item
        for item in graph
        if isinstance(item, dict)
        and item.get("@type") == "ItemList"
        and item.get("@id") == "https://www.terrikontech.ru/#projects"
    ),
    None,
)
assert projects, "project ItemList JSON-LD is missing"
project_items = projects["itemListElement"]
assert len(project_items) == 5, "expected 5 projects"
assert [entry["item"]["name"] for entry in project_items] == project_names, (
    "project ItemList does not match visible cards"
)

faq = next(
    (
        item
        for item in graph
        if isinstance(item, dict) and item.get("@type") == "FAQPage"
    ),
    None,
)
assert faq, "FAQPage JSON-LD is missing"
assert len(faq["mainEntity"]) == 6, "expected 6 FAQ questions"

seo_pages = [
    ("sozdanie-saitov-donetsk", "Создание сайтов в Донецке под ключ"),
    ("razrabotka-saitov-dnr", "Разработка сайтов в ДНР"),
    ("razrabotka-veb-servisov", "Разработка веб-сервисов"),
    ("telegram-mini-apps", "Разработка Telegram Mini Apps"),
    ("avtomatizatsiya-biznesa", "Автоматизация бизнеса"),
    ("regiony-raboty", "ДНР, новые регионы и вся Россия"),
]
seo_titles: set[str] = set()
seo_descriptions: set[str] = set()
for slug, heading in seo_pages:
    page_path = STATIC_DIR / slug / "index.html"
    assert page_path.is_file(), f"SEO page is missing: {slug}"
    page_html = page_path.read_text(encoding="utf-8")
    canonical = f'https://www.terrikontech.ru/{slug}/'
    assert f'rel="canonical" href="{canonical}"' in page_html, (
        f"canonical is wrong: {slug}"
    )
    assert heading in page_html, f"visible H1 is missing: {slug}"
    assert 'id="page-jsonld"' in page_html, f"page JSON-LD is missing: {slug}"
    assert 'id="site-jsonld"' not in page_html, f"root JSON-LD leaked: {slug}"

    title_match = re.search(r"<title>(.*?)</title>", page_html, re.DOTALL)
    description_match = re.search(
        r'<meta[^>]+name="description"[^>]+content="([^"]+)"',
        page_html,
        re.IGNORECASE,
    )
    assert title_match and description_match, f"metadata is missing: {slug}"
    title = title_match.group(1).strip()
    description = description_match.group(1).strip()
    assert title not in seo_titles, f"duplicate SEO title: {title}"
    assert description not in seo_descriptions, f"duplicate SEO description: {slug}"
    seo_titles.add(title)
    seo_descriptions.add(description)

    page_json_ld = re.findall(
        r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
        page_html,
        flags=re.DOTALL | re.IGNORECASE,
    )
    page_documents = [json.loads(block) for block in page_json_ld]
    page_graph = next(
        (document.get("@graph", []) for document in page_documents if "@graph" in document),
        [],
    )
    page_types = {
        item.get("@type")
        for item in page_graph
        if isinstance(item, dict) and isinstance(item.get("@type"), str)
    }
    assert {"WebPage", "Service", "BreadcrumbList", "FAQPage"} <= page_types, (
        f"structured data is incomplete: {slug}"
    )

    text_only = re.sub(r"<script.*?</script>|<style.*?</style>", " ", page_html, flags=re.DOTALL)
    text_only = re.sub(r"<[^>]+>", " ", text_only)
    word_count = len(re.findall(r"[A-Za-zА-Яа-яЁё]{3,}", text_only))
    assert word_count >= 250, f"SEO page is too thin ({word_count} words): {slug}"

print(
    f"validated {INDEX}: {len(text_assets)} text assets, "
    f"{len(offers)} services, {len(project_items)} projects, "
    f"{len(faq['mainEntity'])} FAQ items, {len(seo_pages)} SEO pages"
)
