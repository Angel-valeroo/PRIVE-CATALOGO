#!/usr/bin/env python3
"""Genera data/perfumes.json desde CATALOGO WEB.xlsx.

Requiere Python 3 estándar; no depende de pandas ni openpyxl.
Solo importa filas donde Diseñador, Perfume y Clave estén completos.
"""
from __future__ import annotations
import json, re, sys, unicodedata, zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {
    "a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
CATEGORIES = {"CABALLERO": "Caballero", "DAMA": "Dama", "UNISEX": "Unisex"}

def clean(value):
    return "" if value is None else str(value).strip()

def slugify(text):
    text = unicodedata.normalize("NFKD", str(text))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower().replace("&", " and ")
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")

def read_xlsx(path):
    with zipfile.ZipFile(path) as z:
        wb = ET.fromstring(z.read("xl/workbook.xml"))
        rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
        relmap = {rel.attrib["Id"]: rel.attrib["Target"] for rel in rels}
        shared = []
        if "xl/sharedStrings.xml" in z.namelist():
            root = ET.fromstring(z.read("xl/sharedStrings.xml"))
            for si in root.findall("a:si", NS):
                shared.append("".join(t.text or "" for t in si.iter(f"{{{NS['a']}}}t")))
        result = {}
        for sheet in wb.find("a:sheets", NS):
            name = sheet.attrib["name"]
            if name not in CATEGORIES:
                continue
            rid = sheet.attrib[f"{{{NS['r']}}}id"]
            target = relmap[rid].lstrip("/")
            if not target.startswith("xl/"):
                target = "xl/" + target
            root = ET.fromstring(z.read(target))
            rows = []
            for row in root.findall(".//a:sheetData/a:row", NS):
                values = {}
                for cell in row.findall("a:c", NS):
                    col = re.match(r"[A-Z]+", cell.attrib["r"]).group()
                    typ = cell.attrib.get("t")
                    value = None
                    if typ == "inlineStr":
                        node = cell.find("a:is", NS)
                        value = "".join(t.text or "" for t in node.iter(f"{{{NS['a']}}}t")) if node is not None else ""
                    else:
                        node = cell.find("a:v", NS)
                        if node is not None:
                            raw = node.text
                            value = shared[int(raw)] if typ == "s" else raw
                    values[col] = value
                rows.append([values.get("A"), values.get("B"), values.get("C")])
            result[name] = rows
        return result

def main():
    source = Path(sys.argv[1] if len(sys.argv) > 1 else "CATALOGO WEB.xlsx")
    destination = Path(sys.argv[2] if len(sys.argv) > 2 else "data/perfumes.json")
    sheets = read_xlsx(source)
    catalog, used_ids = [], set()
    for sheet_name in ("CABALLERO", "DAMA", "UNISEX"):
        for row in sheets.get(sheet_name, [])[1:]:
            designer, name, code = map(clean, row)
            if not (designer and name and code):
                continue
            base = f"{code.lower()}-{slugify(designer)}-{slugify(name)}"
            perfume_id, suffix = base, 2
            while perfume_id in used_ids:
                perfume_id = f"{base}-{suffix}"
                suffix += 1
            used_ids.add(perfume_id)
            catalog.append({
                "id": perfume_id,
                "designer": designer,
                "name": name,
                "code": code.upper(),
                "category": CATEGORIES[sheet_name],
            })
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generados {len(catalog)} perfumes en {destination}")

if __name__ == "__main__":
    main()
