# -*- coding: utf-8 -*-
"""Konversi DOKUMENTASI_TEKNIS.md -> PDF (markdown -> HTML -> xhtml2pdf)."""
import os, re, markdown
from xhtml2pdf import pisa

ROOT = r"D:\Sistem MBG"
SRC = os.path.join(ROOT, "DOKUMENTASI_TEKNIS.md")
OUT = os.path.join(ROOT, "DOKUMENTASI_TEKNIS.pdf")

with open(SRC, "r", encoding="utf-8") as f:
    md = f.read()

# Ganti glyph yang tidak ada di font standar agar tidak jadi kotak hitam.
repl = {
    "⚠️": "[PENTING] ", "⚠": "[PENTING] ",
    "✅": "[OK] ",
    "→": "->", "←": "<-",
    "️": "",
    # Box-drawing (tree direktori) -> ASCII supaya tidak hilang/jadi kotak.
    "├──": "+--", "└──": "`--", "│": "|",
    "├": "+", "└": "`", "─": "-",
}
for k, v in repl.items():
    md = md.replace(k, v)

html_body = markdown.markdown(
    md,
    extensions=["tables", "fenced_code", "sane_lists", "toc"],
)

CSS = """
@page { size: A4; margin: 1.6cm 1.4cm 1.6cm 1.4cm; @frame footer {
    -pdf-frame-content: footerContent; bottom: 0.7cm; margin-left: 1.4cm;
    margin-right: 1.4cm; height: 0.8cm; } }
body { font-family: Helvetica, sans-serif; font-size: 9.5pt; color: #1a1a1a; line-height: 1.4; }
h1 { font-size: 18pt; color: #0b3d2e; border-bottom: 2px solid #0b3d2e; padding-bottom: 4px; margin-top: 6px; }
h2 { font-size: 13.5pt; color: #0b5; color: #14663f; border-bottom: 1px solid #cccccc; padding-bottom: 2px; margin-top: 16px; }
h3 { font-size: 11pt; color: #1f4e79; margin-top: 12px; }
h4 { font-size: 10pt; color: #333333; margin-top: 10px; }
p, li { font-size: 9.5pt; }
a { color: #1f4e79; text-decoration: none; }
blockquote { background: #f3f6f4; border-left: 3px solid #14663f; padding: 4px 8px; color: #333333; font-size: 9pt; }
code { font-family: "Courier", monospace; font-size: 8.5pt; background: #f0f0f0; }
pre { font-family: "Courier", monospace; font-size: 7.3pt; background: #f6f8fa; border: 1px solid #d0d7de;
      padding: 6px 8px; line-height: 1.25; white-space: pre-wrap; word-wrap: break-word; }
pre code { background: transparent; font-size: 7.3pt; }
table { border-collapse: collapse; width: 100%; margin: 6px 0; }
th { background: #14663f; color: #ffffff; font-size: 8pt; padding: 4px 5px; border: 0.5px solid #0b3d2e; text-align: left; }
td { font-size: 8pt; padding: 3px 5px; border: 0.5px solid #c8c8c8; vertical-align: top; }
tr:nth-child(even) td { background: #f4f6f5; }
hr { border: none; border-top: 1px solid #cccccc; margin: 10px 0; }
"""

html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head>
<body>
<div id="footerContent" style="font-size:7pt;color:#888888;text-align:center;">
  Dokumentasi Teknis - Sistem MBG Monitoring &middot; halaman <pdf:pagenumber> / <pdf:pagecount>
</div>
{html_body}
</body></html>"""

def link_callback(uri, rel):
    # Resolusikan path file lokal (font Windows) apa adanya.
    p = uri.replace("file:///", "").replace("file://", "")
    if os.path.isfile(p):
        return p
    return uri

with open(OUT, "wb") as out:
    result = pisa.CreatePDF(html, dest=out, link_callback=link_callback, encoding="utf-8")

print("ERROR" if result.err else "OK", "->", OUT)
print("err count:", result.err)
