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

print(
    f"validated {INDEX}: {len(text_assets)} text assets, "
    f"{len(offers)} services, {len(project_items)} projects, "
    f"{len(faq['mainEntity'])} FAQ items"
)
