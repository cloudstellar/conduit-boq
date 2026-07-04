import hashlib
import html
import io
import json
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as reportlab_canvas
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path("/Users/cloud/Cloudstellar/conduit-boq")
OUT_DIR = ROOT / "output/master-catalog/p11-preview"
DATA_PATH = OUT_DIR / "p11_preview_source_data.json"
PDF_PATH = OUT_DIR / "DRAFT-PREVIEW-NT-Master-Catalog-v2568.1.0-p11-preview.pdf"
PORTRAIT_PATH = OUT_DIR / "DRAFT-PREVIEW-NT-Master-Catalog-v2568.1.0-p11-preview-portrait.pdf"
LOGO_PATH = ROOT / "CI/NT_4_v3.png"
FONT_REGULAR = ROOT / "CI/NT Regular.ttf"
FONT_BOLD = ROOT / "CI/NT Bold.ttf"

YELLOW = colors.HexColor("#FFD100")
DARK_GRAY = colors.HexColor("#545859")
BLACK = colors.HexColor("#101820")
LIGHT_GRAY = colors.HexColor("#F6F6F6")
LIGHT_YELLOW = colors.HexColor("#FFF4BF")
BORDER = colors.HexColor("#111111")
DRAFT_RED = colors.Color(1, 0.22, 0.18, alpha=0.42)

pdfmetrics.registerFont(TTFont("NT", str(FONT_REGULAR)))
pdfmetrics.registerFont(TTFont("NT-Bold", str(FONT_BOLD)))

canonical_keys = [
    "identity_id",
    "item_code",
    "item_name",
    "unit",
    "material_cost",
    "labor_cost",
    "unit_cost",
    "category_code",
    "category_name",
    "work_context_code",
    "work_context_name_th",
    "item_type_code",
    "item_type_name_th",
    "is_active",
    "display_order",
]

source = json.loads(DATA_PATH.read_text(encoding="utf-8"))
rows = source["rows"]
WATERMARK_LINES = [
    "รายการบัญชีราคานี้ไม่ใช่ราคาก่อสร้างที่แท้จริงหรือถูกต้องตรงกับราคาก่อสร้าง",
    "แต่เป็นเพียงราคาโดยประมาณซึ่งใกล้เคียงกับราคาก่อสร้างจริงเท่านั้น",
    "(สำหรับกิจการ บมจ.โทรคมนาคมแห่งชาติ เท่านั้น มิให้เผยแพร่ก่อนได้รับอนุญาต)",
]


def canonical_json(row):
    canonical = {key: row.get(key) for key in canonical_keys}
    return json.dumps(canonical, ensure_ascii=False, separators=(",", ":"))


canonical_array_text = "[" + ",".join(canonical_json(row) for row in rows) + "]\n"
dataset_hash = "sha256:" + hashlib.sha256(canonical_array_text.encode("utf-8")).hexdigest()
short_hash = "sha256:" + dataset_hash.split(":", 1)[1][:12] + "..."

styles = getSampleStyleSheet()
styles.add(ParagraphStyle("NTBody", fontName="NT", fontSize=8.8, leading=10.6, textColor=BLACK))
styles.add(ParagraphStyle("NTSmall", fontName="NT", fontSize=7.4, leading=8.8, textColor=BLACK))
styles.add(ParagraphStyle("NTTiny", fontName="NT", fontSize=6.4, leading=7.7, textColor=BLACK))
styles.add(ParagraphStyle("NTH1", fontName="NT-Bold", fontSize=15.2, leading=18, alignment=TA_CENTER, textColor=BLACK))
styles.add(ParagraphStyle("NTH2", fontName="NT-Bold", fontSize=10.5, leading=12.5, textColor=BLACK, spaceBefore=4, spaceAfter=4))
styles.add(ParagraphStyle("NTCenter", fontName="NT", fontSize=7.1, leading=8.5, alignment=TA_CENTER, textColor=BLACK))
styles.add(ParagraphStyle("NTRight", fontName="NT", fontSize=7.1, leading=8.5, alignment=TA_RIGHT, textColor=BLACK))
styles.add(ParagraphStyle("NTWarn", fontName="NT-Bold", fontSize=9.5, leading=11.2, alignment=TA_CENTER, textColor=colors.HexColor("#B91C1C")))
styles.add(ParagraphStyle("NTMetaKey", fontName="NT-Bold", fontSize=7.3, leading=8.8, textColor=BLACK))
styles.add(ParagraphStyle("NTMetaVal", fontName="NT", fontSize=7.3, leading=8.8, textColor=BLACK))
styles.add(ParagraphStyle("NTLeftBold", fontName="NT-Bold", fontSize=7.5, leading=9, textColor=BLACK))


def p(text, style="NTBody"):
    return Paragraph(html.escape(str(text)), styles[style])


def rich(text, style="NTBody"):
    return Paragraph(str(text), styles[style])


def money(value):
    return f"{float(value):,.0f}"


def draw_page(canvas, doc):
    return


def doc_header(title="รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน"):
    logo = Image(str(LOGO_PATH), width=56 * mm, height=18 * mm, kind="proportional")
    table = Table([[logo], [p(title, "NTH1")]], colWidths=[170 * mm])
    table.setStyle(
        TableStyle(
            [
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("BOTTOMPADDING", (0, 0), (0, 0), 8),
            ]
        )
    )
    return table


def cover_stamp():
    data = [
        ("สถานะเอกสาร", "DRAFT PREVIEW ONLY - ไม่ใช่เอกสารประกาศใช้ และไม่ใช่ P-11 approval"),
        ("Catalog version", "2568.1.0 candidate draft/rehearsal string"),
        ("Preview item count", str(len(rows))),
        ("Full preview dataset SHA-256", dataset_hash),
        ("Footer display", "มุมขวาล่างแสดง version/status เท่านั้น; การตรวจจริงใช้ full SHA-256 ในหน้านี้ หน้า 3 หรือ Excel ข้อมูลตรวจสอบ"),
        ("Source", source["source"]),
    ]
    table = Table([[p(k, "NTMetaKey"), p(v, "NTMetaVal")] for k, v in data], colWidths=[45 * mm, 127 * mm])
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#444444")),
                ("BACKGROUND", (0, 0), (0, -1), LIGHT_GRAY),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def price_table():
    data = [
        [
            "",
            "",
            "",
            p("(หน่วยเงิน: บาท)", "NTRight"),
            "",
            "",
        ],
        [
            p("ที่", "NTCenter"),
            p("รายการวัสดุ", "NTCenter"),
            p("หน่วยนับ", "NTCenter"),
            p("ค่าวัสดุ", "NTCenter"),
            p("ค่าแรง", "NTCenter"),
            p("รวมค่าวัสดุ+ค่าแรง", "NTCenter"),
        ]
    ]
    spans = []
    section_seen = set()
    subsection_seen = set()
    table_row = 2

    for index, row in enumerate(rows, start=1):
        section = row["display_section"]
        subsection = row["display_subsection"]
        if section not in section_seen:
            data.append([p(section, "NTLeftBold"), "", "", "", "", ""])
            spans.append(("section", table_row))
            section_seen.add(section)
            table_row += 1
        if subsection not in subsection_seen:
            data.append([p(subsection, "NTLeftBold"), "", "", "", "", ""])
            spans.append(("subsection", table_row))
            subsection_seen.add(subsection)
            table_row += 1
        data.append(
            [
                p(str(index), "NTCenter"),
                p(row["item_name"], "NTSmall"),
                p(row["unit"], "NTCenter"),
                p(money(row["material_cost"]), "NTRight"),
                p(money(row["labor_cost"]), "NTRight"),
                p(money(row["unit_cost"]), "NTRight"),
            ]
        )
        table_row += 1

    table = Table(data, colWidths=[9 * mm, 100 * mm, 14 * mm, 20 * mm, 20 * mm, 27 * mm], repeatRows=2)
    commands = [
        ("SPAN", (0, 0), (2, 0)),
        ("SPAN", (3, 0), (-1, 0)),
        ("GRID", (0, 1), (-1, -1), 0.45, BORDER),
        ("LINEABOVE", (0, 1), (-1, 1), 0.8, BORDER),
        ("LINEBELOW", (0, 1), (-1, 1), 0.8, BORDER),
        ("BACKGROUND", (0, 1), (-1, 1), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 2.8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2.8),
        ("TOPPADDING", (0, 0), (-1, 0), 0),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
        ("TOPPADDING", (0, 1), (-1, -1), 3.2),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 3.2),
    ]
    for kind, row_index in spans:
        commands.append(("SPAN", (0, row_index), (-1, row_index)))
        commands.append(("LINEABOVE", (0, row_index), (-1, row_index), 0.75, BORDER))
        commands.append(("LINEBELOW", (0, row_index), (-1, row_index), 0.75, BORDER))
        commands.append(("BACKGROUND", (0, row_index), (-1, row_index), LIGHT_GRAY if kind == "section" else colors.white))
        commands.append(("LEFTPADDING", (0, row_index), (-1, row_index), 5 if kind == "section" else 14))
    table.setStyle(TableStyle(commands))
    return table


def audit_mapping_table():
    data = [[p("No.", "NTCenter"), p("Legacy code", "NTCenter"), p("Canonical code", "NTCenter"), p("Verification note", "NTCenter")]]
    for index, row in enumerate(rows, start=1):
        data.append([
            p(index, "NTCenter"),
            p(row["legacy_item_code"], "NTSmall"),
            p(row["item_code"], "NTSmall"),
            p("Thai item text is shown in the price page and Excel verification sheet.", "NTSmall"),
        ])
    table = Table(data, colWidths=[10 * mm, 30 * mm, 36 * mm, 96 * mm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT_YELLOW),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3.5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3.5),
                ("TOPPADDING", (0, 0), (-1, -1), 3.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ]
        )
    )
    return table


def verification_table():
    data = [
        ("Full preview dataset SHA-256", dataset_hash),
        ("Canonical row JSON location", "Excel workbook sheet 'ข้อมูลตรวจสอบ' contains _canonical_row_json for hash reconstruction."),
        ("Footer rule", "Footer shows version/status only. It does not show a truncated hash as a verification value."),
        ("Real export requirement", "Server re-query selected DB version, recompute item_count/dataset_hash, and fail closed on mismatch."),
    ]
    table = Table([[p(k, "NTMetaKey"), p(v, "NTTiny")] for k, v in data], colWidths=[43 * mm, 129 * mm])
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
                ("BACKGROUND", (0, 0), (0, -1), LIGHT_GRAY),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 4),
                ("RIGHTPADDING", (0, 0), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def build_pdf(pdf_path):
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=10 * mm,
        rightMargin=10 * mm,
        topMargin=12 * mm,
        bottomMargin=13 * mm,
    )
    story = []
    story.append(Spacer(1, 38 * mm))
    story.append(doc_header())
    story.append(Spacer(1, 5 * mm))
    story.append(p("ประจำปี 2568 | Master Catalog v2568.1.0 Preview", "NTH1"))
    story.append(Spacer(1, 5 * mm))
    story.append(p("DRAFT PREVIEW - ห้ามใช้อ้างอิงเป็นราคาประกาศใช้", "NTWarn"))
    story.append(Spacer(1, 8 * mm))
    story.append(cover_stamp())

    story.append(PageBreak())
    story.append(doc_header("รายการบัญชีราคามาตรฐานงานก่อสร้างท่อร้อยสายสื่อสารใต้ดิน ประจำปี 2568"))
    story.append(Spacer(1, 4 * mm))
    story.append(price_table())

    story.append(PageBreak())
    story.append(doc_header("P-11 Preview Verification"))
    story.append(Spacer(1, 4 * mm))
    story.append(KeepTogether([p("Audit codes - intentionally hidden from the field-facing price page", "NTH2"), audit_mapping_table()]))
    story.append(Spacer(1, 5 * mm))
    story.append(KeepTogether([p("SHA-256 and canonical evidence", "NTH2"), verification_table()]))
    story.append(Spacer(1, 5 * mm))
    story.append(
        p(
            "Decision boundary: preview acceptance means visual/layout direction only. It is not final P-11 approval, not version publication, and not Production price evidence.",
            "NTWarn",
        )
    )
    doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
    overlay_watermark_and_footer(pdf_path)


def make_overlay(page_number, total_pages):
    buffer = io.BytesIO()
    overlay = reportlab_canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    if page_number == 2:
        overlay.saveState()
        overlay.setFont("NT-Bold", 17)
        overlay.setFillColor(colors.Color(1, 0.22, 0.18, alpha=0.24))
        overlay.translate(width / 2, height / 2)
        overlay.rotate(36)
        for offset, line in enumerate(WATERMARK_LINES):
            overlay.drawCentredString(0, -offset * 11 * mm, line)
        overlay.restoreState()

    overlay.saveState()
    overlay.setFont("NT", 6.4)
    overlay.setFillColor(DARK_GRAY)
    overlay.drawString(12 * mm, 7 * mm, "ส่วนวิศวกรรมท่อร้อยสาย (วทฐฐ.)")
    overlay.drawCentredString(width / 2, 7 * mm, f"{page_number}/{total_pages}")
    overlay.drawRightString(width - 12 * mm, 7 * mm, "v2568.1.0 | Draft")
    overlay.restoreState()

    overlay.save()
    buffer.seek(0)
    return PdfReader(buffer).pages[0]


def overlay_watermark_and_footer(pdf_path):
    reader = PdfReader(str(pdf_path))
    writer = PdfWriter()
    total_pages = len(reader.pages)
    for index, page in enumerate(reader.pages, start=1):
        page.merge_page(make_overlay(index, total_pages), over=True)
        writer.add_page(page)
    with open(pdf_path, "wb") as output:
        writer.write(output)


if __name__ == "__main__":
    build_pdf(PDF_PATH)
    build_pdf(PORTRAIT_PATH)
    print(PDF_PATH)
    print(PORTRAIT_PATH)
