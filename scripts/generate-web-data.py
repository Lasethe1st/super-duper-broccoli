#!/usr/bin/env python3
"""Convert a World English Bible USFX file into book-level reader assets."""

from __future__ import annotations

import argparse
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path


BOOK_IDS = [
    "GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA",
    "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO",
    "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO",
    "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL", "MAT",
    "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP",
    "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE",
    "2PE", "1JN", "2JN", "3JN", "JUD", "REV",
]

APP_IDS = [
    "gen", "exo", "lev", "num", "deu", "jos", "jdg", "rut", "1sa", "2sa",
    "1ki", "2ki", "1ch", "2ch", "ezr", "neh", "est", "job", "psa", "pro",
    "ecc", "sng", "isa", "jer", "lam", "eze", "dan", "hos", "joe", "amo",
    "oba", "jon", "mic", "nah", "hab", "zep", "hag", "zec", "mal", "mat",
    "mrk", "luk", "jhn", "act", "rom", "1co", "2co", "gal", "eph", "php",
    "col", "1th", "2th", "1ti", "2ti", "tit", "phm", "heb", "jas", "1pe",
    "2pe", "1jn", "2jn", "3jn", "jud", "rev",
]

NOTE_TAGS = {"f", "fe", "x"}
BODY_TAGS = {"p", "q", "d"}


def clean_text(element: ET.Element) -> str:
    parts: list[str] = []

    def visit(node: ET.Element) -> None:
        if node.text:
            parts.append(node.text)
        for child in node:
            if child.tag not in NOTE_TAGS:
                visit(child)
            if child.tail:
                parts.append(child.tail)

    visit(element)
    return re.sub(r"\s+", " ", "".join(parts)).strip()


def parse_book(book: ET.Element) -> list[dict[str, object]]:
    chapters: list[dict[str, object]] = []
    paragraphs: list[str] | None = None
    previous_tag = ""

    for element in book:
        if element.tag == "c":
            paragraphs = []
            chapters.append({"number": int(element.attrib["id"]), "paragraphs": paragraphs})
            previous_tag = ""
            continue

        if paragraphs is None or element.tag not in BODY_TAGS:
            continue

        text = clean_text(element)
        if not text:
            continue

        # Poetry lines are separate USFX elements. Joining adjacent lines keeps
        # the reader prose-like while retaining every word of the source text.
        if element.tag == "q" and previous_tag == "q":
            paragraphs[-1] = f"{paragraphs[-1]} {text}"
        else:
            paragraphs.append(text)
        previous_tag = element.tag

    return chapters


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path, help="Path to eng-web.usfx.xml")
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("public/data/web"),
        help="Directory for generated book JSON files",
    )
    args = parser.parse_args()

    root = ET.parse(args.source).getroot()
    source_books = {book.attrib["id"]: book for book in root.findall("book")}
    args.output.mkdir(parents=True, exist_ok=True)

    for source_id, app_id in zip(BOOK_IDS, APP_IDS, strict=True):
        chapters = parse_book(source_books[source_id])
        payload = {"book": app_id, "translation": "WEB", "chapters": chapters}
        destination = args.output / f"{app_id}.json"
        destination.write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
