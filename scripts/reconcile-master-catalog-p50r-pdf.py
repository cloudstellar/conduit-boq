"""Deterministic, read-only extractor for the P-50R filed-price PDF.

The JavaScript P-50R runner is the only operator command. This helper accepts
one exact file, validates its digest/page contract, and emits JSON to stdout.
It never creates files, opens a network connection, or mutates its input.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

import pdfplumber


EXPECTED_SHA256 = "5f095c43a34a4541779d9c45a0558ac108048aab6fa96454b7e81e9f25cc619b"
EXPECTED_PAGE_COUNTS = [
    0,
    25,
    26,
    28,
    26,
    28,
    22,
    29,
    27,
    28,
    24,
    23,
    29,
    24,
    26,
    14,
    25,
    30,
    30,
    30,
    26,
    28,
    22,
    17,
    22,
    15,
    28,
    10,
]
EXPECTED_ROW_COUNT = 662
TABLE_SETTINGS = {
    "vertical_strategy": "lines",
    "horizontal_strategy": "lines",
    "snap_tolerance": 3,
    "snap_x_tolerance": 3,
    "snap_y_tolerance": 3,
    "join_tolerance": 3,
    "join_x_tolerance": 3,
    "join_y_tolerance": 3,
    "edge_min_length": 3,
    "edge_min_length_prefilter": 1,
    "min_words_vertical": 3,
    "min_words_horizontal": 1,
    "intersection_tolerance": 3,
    "intersection_x_tolerance": 3,
    "intersection_y_tolerance": 3,
    "text_x_tolerance": 3,
    "text_y_tolerance": 3,
}

# These display rows have a repeated page-header overlay in the description.
# Their numeric cells are unaffected. The runner must expose and manually
# classify them rather than silently trusting raw text equality.
OVERLAY_ROWS = {
    (3, "11"),
    (4, "11"),
    (6, "9"),
    (7, "28"),
    (8, "4"),
    (9, "9"),
    (10, "7"),
    (11, "23"),
    (13, "12"),
    (14, "29"),
    (15, "5"),
    (16, "21"),
    (18, "26"),
    (19, "56"),
    (20, "86"),
    (21, "116"),
    (22, "22"),
    (23, "50"),
    (28, "13"),
}

HEADING_OVERLAY_PAGES = {5, 12, 17, 24, 25, 26, 27}
SPLIT_LABEL_ROWS = {(20, "103"), (20, "108"), (20, "113"), (21, "118")}


def fail(message: str) -> None:
    raise ValueError(message)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalized_text(value: object) -> str:
    text = "" if value is None else str(value)
    text = unicodedata.normalize("NFKC", text)
    return re.sub(r"\s+", " ", text).strip()


def money(value: object) -> int | None:
    raw = normalized_text(value)
    if not raw:
        return None
    compact = re.sub(r"[\s,]", "", raw)
    if compact in {"-", "–", "—"}:
        return 0
    if not re.fullmatch(r"\d+", compact):
        return None
    return int(compact)


def locator(page_number: int, table_number: int, table_row: int, display_row: str) -> str:
    label = display_row if display_row else "blank"
    return f"p{page_number:02d}:t{table_number}:r{table_row}:display-{label}"


def extract(input_path: Path) -> dict[str, object]:
    digest = sha256(input_path)
    if digest != EXPECTED_SHA256:
        fail(f"PDF SHA-256 changed: {digest}")

    rows: list[dict[str, object]] = []
    pages: list[dict[str, object]] = []
    sequence = 0

    with pdfplumber.open(input_path) as document:
        if len(document.pages) != len(EXPECTED_PAGE_COUNTS):
            fail(f"Expected 28 PDF pages, found {len(document.pages)}")

        for page_number, page in enumerate(document.pages, start=1):
            page_rows: list[dict[str, object]] = []
            tables = page.extract_tables(TABLE_SETTINGS) or []
            expected_table_count = 0 if page_number == 1 else 1
            if len(tables) != expected_table_count:
                fail(
                    f"PDF page {page_number} table count changed: "
                    f"expected {expected_table_count}, found {len(tables)}"
                )

            for table_number, table in enumerate(tables, start=1):
                merged_description = ""
                for table_row, cells in enumerate(table or [], start=1):
                    if not cells or len(cells) < 6:
                        continue

                    material = money(cells[-3])
                    labor = money(cells[-2])
                    total = money(cells[-1])
                    if material is None or labor is None or total is None:
                        continue

                    display_row = normalized_text(cells[0])
                    unit = normalized_text(cells[-4])
                    if not unit or unit == "/หน่วย":
                        continue
                    description_cells = [normalized_text(cell) for cell in cells[1:-4]]

                    # Pages 17-23 use merged group labels. Forward-fill only the
                    # group-description cell, then retain the level/subdetail cell.
                    if len(description_cells) > 1:
                        if description_cells[0]:
                            merged_description = description_cells[0]
                        base = description_cells[0] or merged_description
                        raw_name = " | ".join(part for part in [base, *description_cells[1:]] if part)
                    else:
                        raw_name = description_cells[0] if description_cells else ""

                    if material + labor != total:
                        fail(
                            f"PDF arithmetic mismatch at page {page_number}, "
                            f"table {table_number}, row {table_row}: "
                            f"{material}+{labor}!={total}"
                        )

                    sequence += 1
                    row_locator = locator(page_number, table_number, table_row, display_row)
                    ambiguity_codes: list[str] = []
                    if (page_number, display_row) in OVERLAY_ROWS and not page_rows:
                        ambiguity_codes.append("repeated_page_header_description_overlay")
                    if (page_number, display_row) in SPLIT_LABEL_ROWS:
                        ambiguity_codes.append("split_three_digit_display_label")
                    if len(description_cells) > 1 and not description_cells[0]:
                        ambiguity_codes.append("merged_group_description_forward_filled")

                    record = {
                        "pdf_index": sequence,
                        "page": page_number,
                        "table": table_number,
                        "table_row": table_row,
                        "display_row": display_row,
                        "locator": row_locator,
                        "raw_name": raw_name,
                        "normalized_name": normalized_text(raw_name),
                        "raw_unit": normalized_text(cells[-4]),
                        "normalized_unit": unit,
                        "raw_material": normalized_text(cells[-3]),
                        "raw_labor": normalized_text(cells[-2]),
                        "raw_total": normalized_text(cells[-1]),
                        "material": material,
                        "labor": labor,
                        "total": total,
                        "arithmetic_valid": True,
                        "ambiguity_codes": ambiguity_codes,
                    }
                    rows.append(record)
                    page_rows.append(record)

            expected_count = EXPECTED_PAGE_COUNTS[page_number - 1]
            if len(page_rows) != expected_count:
                fail(
                    f"PDF page {page_number} row count changed: "
                    f"expected {expected_count}, found {len(page_rows)}"
                )

            pages.append(
                {
                    "page": page_number,
                    "kind": "cover" if page_number == 1 else "price_table",
                    "table_count": len(tables),
                    "extracted_row_count": len(page_rows),
                    "first_locator": page_rows[0]["locator"] if page_rows else None,
                    "last_locator": page_rows[-1]["locator"] if page_rows else None,
                    "description_overlay_scope": (
                        "heading_only" if page_number in HEADING_OVERLAY_PAGES else None
                    ),
                }
            )

    if len(rows) != EXPECTED_ROW_COUNT:
        fail(f"Expected {EXPECTED_ROW_COUNT} PDF rows, found {len(rows)}")

    canonical_prices = "".join(
        f"{row['page']:02d}|{row['display_row']}|{row['material']}|"
        f"{row['labor']}|{row['total']}\n"
        for row in rows
    ).encode("utf-8")
    canonical_rows = json.dumps(
        rows,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")

    return {
        "schema": "conduit-boq/p50r-pdf-extraction/v1",
        "input_sha256": digest,
        "page_count": len(pages),
        "row_count": len(rows),
        "page_row_counts": [page["extracted_row_count"] for page in pages],
        "canonical_price_sha256": hashlib.sha256(canonical_prices).hexdigest(),
        "canonical_rows_sha256": hashlib.sha256(canonical_rows).hexdigest(),
        "python_version": sys.version.split()[0],
        "pdfplumber_version": getattr(pdfplumber, "__version__", "unknown"),
        "manual_review_notes": {
            "static_content_readable": True,
            "dash_means_zero": True,
            "description_overlay_row_count": len(OVERLAY_ROWS),
            "heading_overlay_pages": sorted(HEADING_OVERLAY_PAGES),
            "split_label_row_count": len(SPLIT_LABEL_ROWS),
            "extraction_method": "pdfplumber-table-page-aware",
        },
        "pages": pages,
        "rows": rows,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--expected-sha256", required=True)
    arguments = parser.parse_args()

    if arguments.expected_sha256 != EXPECTED_SHA256:
        fail("Caller supplied an unexpected PDF authority digest")

    input_path = Path(arguments.input)
    if not input_path.is_file():
        fail("The exact P-50R PDF input is missing or is not a regular file")

    result = extract(input_path)
    sys.stdout.write(json.dumps(result, ensure_ascii=False, sort_keys=True, separators=(",", ":")))
    sys.stdout.write("\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:  # fail closed with one diagnostic on stderr
        sys.stderr.write(f"P-50R PDF HOLD: {error}\n")
        raise SystemExit(1) from error
