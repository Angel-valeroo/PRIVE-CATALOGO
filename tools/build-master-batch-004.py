#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import unicodedata
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "perfumes.json"
CORE_DIR = ROOT / "data" / "core"
BATCH_START = 250
BATCH_SIZE = 100
TODAY = "2026-07-30"


def profile(family, top, heart, base, style, age, *, year=None,
            concentration="Eau de Toilette", intensity="Moderada", use="versatile",
            confidence="medium", note=""):
    return {
        "family": family, "top": top, "heart": heart, "base": base,
        "style": style, "age": age, "year": year, "concentration": concentration,
        "intensity": intensity, "use": use, "confidence": confidence, "note": note,
    }


P = {}
def add(code, *args, **kwargs):
    P[code] = profile(*args, **kwargs)


# 251-253 · PERRY ELLIS
add("CP00720", "Aromática fougère", ["Bergamota", "Piña", "Orégano", "Anís", "Helecho"], ["Lavanda", "Geranio", "Vetiver", "Neroli", "Albahaca"], ["Sándalo", "Cuero", "Almizcle", "Cedro", "Ámbar"], "aromático, clásico y fresco", (24, 58), year=1996, use="versatile")
add("CP02514", "Amaderada aromática", ["Anís estrellado", "Cardamomo", "Pera", "Bergamota", "Sal"], ["Lavanda", "Geranio", "Musgo", "Hoja de higuera"], ["Vainilla bourbon", "Pachulí", "Vetiver bourbon"], "nocturno, especiado y avainillado", (22, 48), year=2024, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02108", "Aromática fougère", ["Lavanda", "Bergamota", "Enebro", "Toronja", "Geranio"], ["Rosa negra", "Estragón", "Clavel", "Salvia", "Alcaravea"], ["Maderas exóticas", "Sándalo", "Ámbar", "Almizcle", "Musgo de roble"], "limpio, herbal y elegante", (24, 58), year=1998, use="versatile")

# 254-257 · PRADA
add("CP02245", "Ámbar amaderada", ["Bergamota"], ["Angélica", "Pachulí"], ["Cumarina", "Ámbar", "Almizcle"], "oscuro, atalcado y sensual", (24, 52), year=2018, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02209", "Aromática fougère", ["Bergamota", "Pimienta"], ["Lavanda", "Notas metálicas", "Notas acuáticas", "Carbón", "Tintura de tierra"], ["Ambroxan", "Pachulí"], "mineral, limpio y moderno", (20, 48), year=2017, use="versatile")
add("CP02421", "Aromática fougère", ["Bergamota", "Pimienta rosa", "Artemisia"], ["Lavanda", "Iris", "Salvia", "Ante", "Azafrán"], ["Almizcle", "Caramelo", "Vetiver de Haití", "Pachulí"], "acuático, limpio y refinado", (20, 48), year=2021, use="versatile")
add("CP02517", "Ámbar fougère", ["Bergamota de Calabria", "Almizcle"], ["Geranio bourbon", "Geranio rosa"], ["Benjuí", "Bálsamo del Perú", "Madera de guayaco"], "ambarado, limpio y sofisticado", (22, 50), year=2025, concentration="Eau de Parfum", intensity="Intensa", use="versatile")

# 258-267 · RALPH LAUREN
add("CP02467", "Amaderada aromática", ["Piña", "Bergamota", "Limón"], ["Salvia", "Enebro", "Escaramujo"], ["Vetiver", "Pachulí", "Vara de oro"], "cítrico, deportivo y luminoso", (18, 42), year=2024, use="fresh")
add("CP00920", "Amaderada aromática", ["Mango", "Mandarina", "Limón"], ["Artemisia", "Salvia"], ["Pachulí", "Sándalo", "Haba tonka"], "tropical, verde y urbano", (20, 46), year=2005, use="versatile")
add("CP00921", "Aromática fougère", ["Pepino", "Melón", "Mandarina"], ["Albahaca", "Salvia", "Geranio"], ["Ante", "Notas amaderadas", "Almizcle"], "acuático, limpio y casual", (18, 48), year=2003, use="fresh")
add("CP02389", "Amaderada aromática", ["Mandarina", "Pimienta rosa", "Cardamomo"], ["Lavanda", "Salvia esclarea", "Vetiver", "Jazmín"], ["Roble", "Olíbano", "Pachulí"], "amaderado, elegante y profundo", (24, 52), year=2022, concentration="Parfum", intensity="Intensa", use="versatile")
add("CP01088", "Aromática fougère", ["Menta", "Manzana verde", "Mandarina", "Cedro"], ["Notas verdes", "Salvia", "Jengibre"], ["Helecho", "Almizcle", "Sándalo", "Musgo de roble", "Pachulí", "Ámbar"], "verde, deportivo y energético", (18, 42), year=2012, use="fresh")
add("CP00919", "Chipre amaderada", ["Enebro", "Albahaca", "Artemisia", "Alcaravea", "Cilantro", "Bergamota"], ["Pino", "Cuero", "Manzanilla", "Pimienta", "Clavel", "Geranio"], ["Tabaco", "Musgo de roble", "Pachulí", "Cedro", "Vetiver", "Almizcle", "Ámbar"], "clásico, verde y masculino", (30, 65), year=1978, use="classic", intensity="Intensa")
add("CP01091", "Amaderada especiada", ["Toronja", "Limón", "Arándano"], ["Azafrán", "Salvia"], ["Ámbar", "Café", "Notas amaderadas"], "frutal, especiado y dinámico", (18, 45), year=2013, use="versatile", intensity="Intensa")
add("CP01042", "Aromática", ["Pepino", "Manzana roja", "Lavanda"], ["Salvia", "Azafrán"], ["Notas amaderadas", "Almizcle"], "limpio, deportivo y casual", (18, 45), year=2009, use="fresh")
add("CP00923", "Aromática verde", ["Menta", "Aldehídos", "Lavanda", "Bergamota", "Limón", "Mandarina", "Artemisia", "Neroli"], ["Hierba marina", "Jengibre", "Jazmín", "Geranio", "Ciclamen", "Rosa", "Palisandro"], ["Almizcle", "Sándalo", "Cedro", "Guayaco", "Ámbar"], "fresco, verde y atlético", (18, 50), year=1994, use="fresh")
add("CP00934", "Amaderada aromática", ["Lavanda", "Bergamota", "Cilantro", "Notas verdes", "Aldehídos", "Limón", "Estragón", "Neroli"], ["Clavel", "Canela", "Jazmín", "Rosa"], ["Cuero", "Sándalo", "Musgo de roble", "Pachulí", "Cedro", "Almizcle", "Ámbar"], "aventurero, clásico y elegante", (28, 62), year=1992, use="classic", intensity="Intensa")

# 268-281 · MALUMA / FERRAGAMO / LAPIDUS / TOM FORD / TOMMY / TOUS
add("CP02448", "Aromática fougère", ["Lavanda", "Pimienta rosa"], ["Jengibre", "Geranio", "Elemí"], ["Vetiver", "Olíbano", "Pachulí"], "aromático, resinoso y moderno", (20, 45), year=2022, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02462", "Ámbar amaderada", ["Cardamomo", "Pera", "Bergamota"], ["Canela", "Ciruela", "Hoja de clavo"], ["Vainilla", "Iris", "Cedro"], "dulce, especiado y sensual", (20, 46), year=2022, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02348", "Aromática fougère", ["Salvia", "Bergamota", "Limón"], ["Hoja de violeta", "Cedro", "Cuero"], ["Musgo de roble", "Almizcle", "Vetiver"], "elegante, verde y contemporáneo", (24, 52), year=2020, use="versatile")
add("CP00952", "Ámbar", ["Piña", "Lavanda", "Artemisia", "Bayas de enebro", "Albahaca", "Bergamota", "Limón"], ["Miel", "Incienso", "Pino", "Rosa", "Jazmín"], ["Tabaco", "Pachulí", "Sándalo", "Almizcle", "Ámbar", "Cedro"], "potente, dulce y clásico", (30, 65), year=1987, use="classic", intensity="Muy intensa")
add("CP02298", "Aromática fougère", ["Lavanda", "Romero", "Menta", "Albahaca"], ["Geranio"], ["Musgo de roble", "Pachulí", "Ámbar"], "barbería, limpio y sofisticado", (28, 60), year=2020, concentration="Eau de Parfum", use="classic", intensity="Intensa")
add("CP02299", "Amaderada especiada", ["Toronja", "Flor de azahar", "Salvia"], ["Nuez moscada", "Raíz de lirio", "Pimiento"], ["Vetiver", "Notas amaderadas", "Musgo de roble", "Ámbar"], "cítrico, terroso y ejecutivo", (28, 60), year=2009, use="classic")
add("CP02391", "Ámbar amaderada", ["Cardamomo", "Nuez moscada", "Azafrán", "Mandarina", "Neroli"], ["Kulfi", "Rosa", "Jazmín", "Flor de azahar", "Lentisco"], ["Vainilla", "Ámbar", "Notas amaderadas", "Sándalo"], "gourmand, cálido y lujoso", (24, 55), year=2015, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP02297", "Amaderada floral almizclada", ["Jengibre", "Mandarina", "Bergamota", "Hoja de limonero"], ["Hoja de tabaco", "Pimienta", "Flor de azahar", "Albahaca"], ["Cedro", "Pachulí", "Ámbar", "Cuero", "Vetiver"], "cítrico, tabacoso y elegante", (26, 56), year=2007, use="versatile")
add("CP02311", "Amaderada aromática", ["Naranja amarga", "Pimienta rosa", "Manzana roja"], ["Ciprés", "Salvia", "Lavanda"], ["Akigalawood", "Ámbar", "Cedro"], "limpio, amaderado y moderno", (20, 46), year=2020, use="versatile")
add("CP00957", "Cítrica aromática", ["Menta", "Bergamota", "Toronja", "Lavanda"], ["Manzana verde", "Arándano", "Rosa"], ["Flor de algodón", "Cactus", "Ámbar"], "verde, juvenil y americano", (18, 45), year=1995, use="fresh")
add("CP02474", "Amaderada aromática", ["Limón", "Jengibre"], ["Lavanda", "Salvia"], ["Akigalawood", "Cedro"], "fresco, limpio y moderno", (18, 45), year=2024, use="versatile", confidence="low", note="Lanzamiento reciente; identidad confirmada por nombre e imagen y conserva estado review.")
add("CP02395", "Amaderada aromática", ["Manzana", "Limón", "Naranja amarga", "Pimienta rosa"], ["Hoja de palma", "Enebro", "Ravenala"], ["Haba tonka", "Almizcle", "Akigalawood"], "veraniego, frutal y limpio", (18, 42), year=2022, use="fresh")
add("CP01033", "Ámbar fougère", ["Jengibre", "Pimienta de Sichuan", "Naranja", "Toronja"], ["Piña", "Manzana", "Camelia"], ["Sándalo", "Ámbar", "Almizcle", "Haba tonka"], "dulce, especiado y casual", (20, 48), year=2004, use="versatile")
add("CP01046", "Amaderada aromática", ["Limón de Amalfi", "Aldehídos"], ["Jengibre", "Manzana roja"], ["Cedro de Virginia", "Cachemira", "Almizcle", "Musgo"], "deportivo, cítrico y energético", (18, 42), year=2010, use="fresh")

# 282-305 · VALENTINO / VERSACE / VIKTOR&ROLF / YSL
add("CP02506", "Ámbar amaderada", ["Mandarina italiana"], ["Notas solares", "Coco"], ["Madera de cedro"], "solar, cálido y luminoso", (20, 46), year=2024, concentration="Eau de Parfum", intensity="Intensa", use="versatile", confidence="low", note="Edición The Gold; notas contrastadas con la identidad visual del frasco.")
add("CP02513", "Amaderada aromática", ["Notas minerales", "Hoja de violeta", "Sal"], ["Jengibre", "Salvia"], ["Vetiver", "Notas amaderadas"], "mineral, limpio y urbano", (18, 45), year=2019, use="versatile")
add("CP02422", "Ámbar fougère", ["Bergamota de Calabria"], ["Café", "Vetiver"], ["Notas amaderadas"], "verde, café y moderno", (18, 42), year=2024, use="versatile")
add("CP02515", "Ámbar vainilla", ["Vainilla"], ["Lavanda"], ["Vetiver"], "dulce, oscuro y seductor", (20, 46), year=2023, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP00747", "Aromática fougère", ["Cítricos", "Bergamota", "Enebro", "Anís", "Palisandro"], ["Lavanda", "Violeta", "Jazmín", "Salvia", "Geranio", "Heliotropo"], ["Vainilla", "Haba tonka", "Sándalo", "Cedro", "Vetiver", "Almizcle", "Ámbar"], "dulce, retro y casual", (20, 52), year=1994, use="versatile")
add("CP01086", "Aromática fougère", ["Menta", "Manzana verde", "Limón"], ["Haba tonka", "Ambroxan", "Geranio"], ["Vainilla de Madagascar", "Cedro", "Vetiver", "Musgo de roble"], "dulce, fresco y magnético", (18, 42), year=2012, use="night", intensity="Intensa")
add("CP02483", "Cítrica aromática", ["Limón", "Naranja sanguina", "Lima", "Mandarina", "Toronja", "Bergamota"], ["Pimienta rosa", "Ámbar blanco", "Grosella negra"], ["Almizcle", "Musgo de roble", "Pachulí"], "cítrico, energético y brillante", (18, 42), year=2024, concentration="Eau de Parfum", use="fresh")
add("CP02372", "Amaderada especiada", ["Mandarina", "Pimienta negra", "Chinotto", "Limón", "Romero"], ["Pimienta", "Geranio", "Rosa"], ["Vainilla", "Haba tonka", "Sándalo", "Cedro", "Pachulí", "Musgo de roble"], "cálido, especiado y apasionado", (20, 48), year=2018, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02373", "Amaderada acuática", ["Limón", "Bergamota", "Carambola", "Cardamomo", "Palisandro"], ["Cedro", "Estragón", "Salvia", "Pimienta"], ["Almizcle", "Notas amaderadas", "Azafrán", "Ámbar", "Sicomoro"], "acuático, cítrico y elegante", (18, 50), year=2006, use="fresh")
add("CP01405", "Aromática fougère", ["Limón", "Bergamota", "Neroli", "Rosa de Mai"], ["Jacinto", "Cedro", "Salvia", "Geranio"], ["Haba tonka", "Almizcle", "Ámbar"], "cítrico, limpio y sofisticado", (20, 52), year=2008, use="versatile")
add("CP02187", "Aromática fougère", ["Bergamota de Calabria", "Toronja", "Notas acuáticas", "Hoja de higuera"], ["Ambroxan", "Pimienta negra", "Pachulí", "Hoja de violeta", "Papiro"], ["Incienso", "Almizcle", "Haba tonka", "Azafrán"], "azul, oscuro y versátil", (18, 48), year=2016, use="versatile", intensity="Intensa")
add("CP00950", "Aromática verde", ["Menta", "Notas verdes", "Lavanda", "Yuzu", "Bergamota"], ["Romero", "Geranio", "Edelweiss", "Violeta"], ["Almizcle", "Cedro", "Abeto"], "alpino, limpio y cotidiano", (20, 52), year=1997, use="fresh")
add("CP02134", "Ámbar especiada", ["Pimienta negra", "Alcaravea", "Lavanda", "Toronja", "Salvia"], ["Canela", "Azafrán", "Cuero"], ["Tabaco", "Vainilla", "Bourbon", "Ámbar"], "dulce, tabacoso y explosivo", (22, 48), year=2015, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP02437", "Ámbar especiada", ["Frutos rojos", "Pimienta rosa", "Azafrán"], ["Canela", "Pimiento rojo"], ["Tabaco", "Benjuí"], "picante, dulce y nocturno", (20, 44), year=2021, use="night", intensity="Intensa")
add("CP02472", "Cuero", ["Pimienta negra", "Nuez moscada"], ["Canela", "Incienso"], ["Cuero", "Tabaco"], "oscuro, cuero y especiado", (24, 52), year=2024, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP02460", "Ámbar fougère", ["Manzana verde", "Cardamomo", "Toronja"], ["Salvia esclarea", "Geranio", "Lavanda"], ["Haba tonka", "Pachulí", "Notas amaderadas"], "verde, dulce y moderno", (20, 45), year=2020, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP00856", "Aromática fougère", ["Cilantro", "Artemisia", "Bergamota", "Cardamomo", "Lavanda", "Albahaca", "Canela", "Anís"], ["Geranio", "Jazmín", "Clavel", "Iris"], ["Cuero", "Musgo de roble", "Tabaco", "Sándalo", "Almizcle", "Ámbar", "Cedro", "Haba tonka"], "clásico, especiado y artístico", (28, 62), year=1988, use="classic", intensity="Intensa")
add("CP02338", "Amaderada aromática", ["Cardamomo", "Jengibre", "Bergamota"], ["Lavanda", "Geranio"], ["Cedro", "Vetiver"], "eléctrico, fresco y nocturno", (20, 46), year=2021, use="night", intensity="Intensa")
add("CP01066", "Amaderada especiada", ["Hoja de violeta", "Albahaca", "Anís estrellado", "Bergamota"], ["Nuez moscada", "Pimienta rosa"], ["Vetiver", "Pachulí"], "verde, especiado y elegante", (22, 50), year=2011, use="versatile")
add("CP02454", "Aromática", ["Bergamota de Calabria"], ["Flor de azahar de Túnez"], ["Ambrofix", "Pachulí"], "limpio, floral y contemporáneo", (18, 46), year=2023, concentration="Eau de Parfum", use="versatile")
add("CP02473", "Ámbar amaderada", ["Pimienta negra"], ["Flor de azahar"], ["Vainilla bourbon", "Ámbar", "Pachulí", "Notas amaderadas"], "cálido, floral y sensual", (22, 50), year=2024, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP02435", "Amaderada aromática", ["Jengibre", "Bayas de enebro", "Bergamota"], ["Salvia", "Lavanda", "Geranio"], ["Vetiver", "Pachulí", "Cedro"], "fresco, seco y ejecutivo", (22, 50), year=2023, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP02383", "Amaderada aromática", ["Limón", "Jengibre", "Pimienta"], ["Enebro", "Lavanda", "Menta", "Geranio"], ["Cedro", "Olíbano"], "helado, cítrico y energético", (18, 42), year=2020, use="fresh")
add("CP02227", "Amaderada aromática", ["Aldehídos", "Bergamota", "Jengibre", "Menta", "Limón"], ["Manzana", "Hoja de violeta", "Piña", "Salvia", "Geranio"], ["Ámbar gris", "Almizcle", "Cedro", "Bálsamo de abeto", "Vetiver", "Incienso"], "fresco, afrutado y versátil", (18, 46), year=2017, use="versatile")

# 306-321 · AFNAN / AQUOLINA / ARIANA GRANDE / ARMAF
add("DP02889", "Ámbar vainilla", ["Pimienta rosa", "Mandarina", "Cardamomo"], ["Lavanda", "Manzana verde", "Flor de azahar"], ["Vainilla", "Almizcle", "Cedro", "Musgo"], "dulce, rosado y luminoso", (18, 38), year=2022, concentration="Eau de Parfum", use="versatile", confidence="low")
add("DP02558", "Floral frutal gourmand", ["Frambuesa", "Naranja", "Bergamota", "Hoja de higuera"], ["Algodón de azúcar", "Regaliz", "Frutos rojos", "Fresa", "Muguete"], ["Caramelo", "Vainilla", "Almizcle", "Haba tonka", "Sándalo"], "azucarado, juvenil y divertido", (15, 32), year=2004, use="night", intensity="Intensa")
add("DP02331", "Floral frutal", ["Pera", "Toronja", "Frambuesa"], ["Muguete", "Rosa", "Orquídea de vainilla"], ["Almizcle", "Notas amaderadas", "Malvavisco"], "frutal, suave y juvenil", (15, 34), year=2015, use="versatile")
add("DP02522", "Floral frutal gourmand", ["Lavanda", "Pera", "Bergamota"], ["Crema de coco", "Praliné", "Orquídea de vainilla"], ["Almizcle", "Notas amaderadas"], "cremoso, dulce y etéreo", (16, 38), year=2018, concentration="Eau de Parfum", use="versatile", intensity="Intensa")
add("DP02782", "Ámbar vainilla", ["Pitahaya", "Bayas silvestres", "Piña"], ["Agua de coco", "Orquídea de vainilla", "Ambreta"], ["Praliné", "Almizcle", "Ámbar", "Notas amaderadas"], "tropical, rosado y cremoso", (16, 34), year=2023, concentration="Eau de Parfum", use="versatile", intensity="Intensa")
add("DP02628", "Floral frutal", ["Pera", "Ambreta"], ["Raíz de lirio", "Rosa turca"], ["Vainilla de Madagascar", "Sándalo"], "limpio, afrutado y delicado", (18, 38), year=2021, concentration="Eau de Parfum", use="versatile")
add("DP02738", "Floral frutal", ["Maracuyá", "Frambuesa", "Bergamota"], ["Rosa", "Pera"], ["Almizcle", "Ambroxan", "Sándalo", "Madera de ensueño"], "frutal, rosado y coqueto", (16, 34), year=2022, concentration="Eau de Parfum", use="versatile")
add("DP02711", "Ámbar vainilla", ["Ciruela", "Almizcle", "Fresia rosa"], ["Praliné", "Raíz de lirio"], ["Vainilla", "Manteca de cacao"], "avainillado, cremoso y suave", (16, 36), year=2022, concentration="Eau de Parfum", use="night", intensity="Intensa")
add("DP02460", "Floral frutal", ["Ciruela", "Grosella negra"], ["Malvavisco", "Peonía"], ["Vainilla", "Sándalo", "Ámbar"], "afrutado, nocturno y dulce", (16, 34), year=2017, concentration="Eau de Parfum", use="night", intensity="Intensa")
add("DP02874", "Amaderada floral almizclada", ["Bergamota", "Manzana", "Ciruela"], ["Jazmín", "Peonía", "Madera de cachemira"], ["Sándalo", "Almizcle", "Vainilla"], "rosado, amaderado y moderno", (18, 38), year=2025, concentration="Eau de Parfum", use="versatile", confidence="low", note="Lanzamiento reciente Pink Woods; conservar en review para confirmar pirámide completa.")
add("DP02566", "Ámbar vainilla", ["Zefir", "Caramelo", "Sal", "Higo", "Membrillo"], ["Lavanda", "Flor de pera"], ["Haba tonka", "Almizcle", "Sándalo"], "salado, dulce y soñador", (16, 36), year=2020, concentration="Eau de Parfum", use="versatile")
add("DP02885", "Floral frutal gourmand", ["Cereza negra", "Ciruela", "Pimienta rosa"], ["Lavanda", "Peonía", "Chocolate"], ["Vainilla", "Sándalo", "Almizcle"], "cereza, dulce y nocturno", (16, 34), year=2025, concentration="Eau de Parfum", use="night", intensity="Intensa", confidence="low", note="R.E.M. Cherry Eclipse: lanzamiento reciente, identidad confirmada por imagen; pirámide en review.")
add("DP02632", "Floral frutal gourmand", ["Mora", "Pera", "Bergamota"], ["Crema batida", "Malvavisco", "Grosella negra", "Frangipani", "Jazmín", "Madreselva"], ["Vainilla", "Madera de cachemira"], "dulce, juvenil y coqueto", (15, 32), year=2016, concentration="Eau de Parfum", use="versatile", intensity="Intensa")
add("DP02524", "Floral frutal gourmand", ["Frambuesa", "Pera"], ["Coco", "Rosa rosada"], ["Macarons", "Almizcle"], "coco, rosado y divertido", (15, 34), year=2019, concentration="Eau de Parfum", use="versatile")
add("DP02894", "Floral frutal gourmand", ["Fresa", "Caramelo", "Bergamota"], ["Leche", "Jazmín", "Rosa"], ["Vainilla", "Almizcle", "Sándalo"], "cremoso, goloso y juvenil", (15, 32), year=2024, concentration="Eau de Parfum", use="versatile", confidence="low", note="Odyssey Candee; pirámide operativa conservada en review.")
add("DP02893", "Floral frutal gourmand", ["Cereza", "Frutos rojos", "Naranja"], ["Vainilla", "Rosa", "Jazmín"], ["Almizcle", "Ámbar", "Sándalo"], "frutal, cremoso y juguetón", (15, 32), year=2024, concentration="Eau de Parfum", use="versatile", confidence="low", note="Yum Yum; versión confirmada por la imagen con forma de copa.")

# 322-336 · ARMANI / EILISH / BOND / BRITNEY / BURBERRY / BVLGARI / CK
add("DP02206", "Floral acuática", ["Limón de Amalfi", "Menta"], ["Jazmín de agua"], ["Cedro de Virginia", "Azúcar morena", "Ládano"], "acuático, verde y luminoso", (20, 48), year=2010, concentration="Eau de Parfum", use="fresh")
add("DP02572", "Floral", ["Flor de azahar", "Bergamota"], ["Tuberosa", "Jazmín de la India"], ["Vainilla de Madagascar", "Almizcle blanco", "Cedro de Virginia"], "floral blanco, elegante y moderno", (20, 48), year=2020, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("DP02760", "Floral amaderada almizclada", ["Flor de azahar", "Naranja amarga", "Bergamota"], ["Iris pallida", "Tuberosa", "Ambreta"], ["Almizcle blanco", "Cedro", "Vainilla bourbon"], "empolvado, floral y sofisticado", (24, 52), year=2023, concentration="Parfum", intensity="Muy intensa", use="versatile")
add("DP02269", "Chipre frutal", ["Casis"], ["Rosa de mayo", "Fresia"], ["Vainilla", "Pachulí", "Ambroxan", "Notas amaderadas"], "elegante, frutal y ejecutivo", (24, 55), year=2013, concentration="Eau de Parfum", intensity="Intensa", use="classic")
add("DP02693", "Ámbar vainilla", ["Azúcar", "Bayas rojas", "Mandarina"], ["Vainilla", "Cacao", "Notas especiadas", "Rosa"], ["Haba tonka", "Ámbar", "Almizcle", "Notas amaderadas"], "cacao, vainilla y envolvente", (18, 42), year=2021, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("DP02534", "Floral frutal", ["Mandarina", "Fresia", "Mandarina verde"], ["Lirio", "Jazmín sambac", "Rosa"], ["Almizcle", "Sándalo", "Vainilla", "Ámbar"], "cítrico, floral y cosmopolita", (22, 48), year=2003, concentration="Eau de Parfum", use="versatile")
add("DP02333", "Floral frutal gourmand", ["Kiwi", "Lichi rojo", "Membrillo"], ["Chocolate blanco", "Cupcake", "Orquídea", "Jazmín"], ["Almizcle", "Raíz de lirio", "Notas amaderadas"], "gourmand, frutal y icónico", (15, 34), year=2005, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("DP02785", "Floral frutal gourmand", ["Sandía", "Flor de yuzu", "Hoja de violeta"], ["Nenúfar", "Gardenia", "Cupcake"], ["Haba tonka", "Madera de ensueño"], "tropical, dulce y alegre", (15, 34), year=2023, use="versatile")
add("DP02495", "Floral frutal gourmand", ["Fresa", "Frambuesa", "Pera", "Cereza", "Grosella negra", "Mandarina", "Limón"], ["Violeta", "Jazmín"], ["Almizcle", "Vainilla", "Cachemira", "Notas amaderadas", "Ámbar", "Musgo", "Pachulí"], "frutal, dulce y juvenil", (16, 38), year=2018, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("DP02719", "Floral frutal gourmand", ["Fresa", "Mora"], ["Jazmín"], ["Vainilla", "Ámbar", "Sándalo"], "cremoso, intenso y frutal", (16, 40), year=2022, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("DP02789", "Aromática vainilla", ["Vainilla", "Lavanda"], ["Caviar de vainilla"], ["Absoluto de vainilla"], "vainilla, limpia y elegante", (18, 48), year=2023, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("DP02859", "Floral frutal", ["Neroli", "Bergamota", "Mandarina"], ["Flor de tiaré", "Jazmín", "Peonía"], ["Almizcle", "Sándalo", "Ámbar"], "solar, floral y fresco", (18, 42), year=2024, concentration="Eau de Parfum", use="fresh", confidence="low", note="Chill & Sole: lanzamiento reciente; identidad confirmada por imagen, pirámide en review.")
add("DP02414", "Floral frutal", ["Bergamota", "Bayas de goji"], ["Granada", "Hibisco", "Nenúfar"], ["Almizcle", "Cedro de Virginia"], "frutal, acuático y luminoso", (16, 42), year=2012, use="fresh")
add("DP02371", "Floral acuática", ["Bambú", "Pera"], ["Loto", "Té", "Casis"], ["Almizcle", "Madera de guayaco", "Musgo de roble"], "cristalino, acuático y limpio", (18, 48), year=2005, use="fresh")
add("DP01116", "Floral", ["Notas verdes", "Fresia", "Salvia", "Cítricos", "Mandarina"], ["Clavel", "Lirio", "Muguete", "Narciso", "Caléndula", "Violeta", "Rosa", "Jazmín"], ["Heliotropo", "Almizcle", "Sándalo", "Ámbar", "Pachulí"], "floral, clásico y romántico", (24, 60), year=1988, use="classic", intensity="Intensa")

# 337-350 · CAROLINA HERRERA
add("DP00987", "Floral", ["Flor de azahar", "Mandarina", "Flor de cactus", "Bergamota"], ["Lirio", "Fresia", "Gardenia", "Jazmín", "Camelia", "Rosa", "Peonía"], ["Almizcle", "Sándalo"], "floral, limpio y urbano", (20, 48), year=1997, use="versatile")
add("DP02644", "Floral frutal", ["Frambuesa", "Mandarina"], ["Jazmín", "Flor de azahar"], ["Cedro", "Sándalo"], "frutal, moderno y juvenil", (16, 36), year=2022, use="versatile", confidence="low", note="Collector Edition; conserva el perfil de 212 Heroes For Her.")
add("DP00991", "Ámbar floral", ["Pimienta rosa", "Mandarina", "Bergamota"], ["Gardenia", "Pelargonio", "Algodón de azúcar", "Flores", "Rosa"], ["Almizcle", "Vainilla", "Sándalo", "Caramelo", "Pachulí", "Violeta"], "dulce, sensual y nocturno", (20, 45), year=2004, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("DP02200", "Ámbar vainilla", ["Ron", "Maracuyá"], ["Gardenia", "Almizcle"], ["Vainilla", "Haba tonka"], "fiestero, dulce y tropical", (18, 38), year=2010, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("DP02283", "Floral frutal", ["Champaña rosada", "Pimienta rosa"], ["Flor de durazno", "Rosa"], ["Almizcle blanco", "Notas amaderadas", "Ámbar"], "espumoso, rosado y festivo", (18, 40), year=2014, concentration="Eau de Parfum", use="versatile")
add("DP02140", "Ámbar floral", ["Toronja", "Bergamota", "Limón"], ["Flor de azahar", "Rosa", "Jazmín"], ["Cuero", "Praliné", "Pachulí", "Sándalo", "Cedro", "Almizcle"], "chic, dulce y elegante", (22, 48), year=2015, use="versatile", intensity="Intensa")
add("DP02404", "Ámbar floral", ["Almendra", "Café", "Bergamota", "Limón"], ["Tuberosa", "Jazmín sambac", "Flor de azahar", "Rosa", "Raíz de lirio"], ["Haba tonka", "Cacao", "Vainilla", "Praliné", "Sándalo", "Almizcle", "Ámbar", "Cachemira", "Canela", "Pachulí", "Cedro"], "gourmand, floral y seductor", (20, 48), year=2016, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("DP02754", "Chipre floral", ["Bergamota", "Almendra amarga"], ["Peonía", "Ylang-ylang"], ["Vainilla", "Cumarina"], "rosado, suave y elegante", (18, 44), year=2023, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("DP02852", "Chipre floral", ["Bergamota", "Mandarina"], ["Rosa", "Ylang-ylang"], ["Vainilla", "Pachulí"], "floral, oscuro y sofisticado", (20, 48), year=2024, concentration="Eau de Parfum Elixir", intensity="Muy intensa", use="night")
add("DP02787", "Ámbar floral", ["Almendra", "Café", "Bergamota", "Limón"], ["Tuberosa", "Jazmín sambac", "Flor de azahar", "Rosa", "Iris"], ["Haba tonka", "Cacao", "Vainilla", "Praliné", "Sándalo", "Almizcle", "Ámbar", "Cachemira", "Canela", "Pachulí", "Cedro"], "gourmand, floral y glamuroso", (20, 48), year=2023, concentration="Eau de Parfum", intensity="Muy intensa", use="night", confidence="low", note="Dazzling Garden es edición de colección; conserva el jugo de Good Girl original.")
add("DP02732", "Ámbar floral", ["Ylang-ylang", "Mandarina", "Bergamota", "Limón"], ["Tuberosa", "Jazmín", "Flor de azahar", "Rosa"], ["Dulce de leche", "Praliné", "Haba tonka", "Canela", "Sándalo", "Cachemira", "Pachulí", "Ámbar", "Almizcle", "Maderas"], "cremoso, floral y suave", (20, 46), year=2018, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("DP02716", "Ámbar floral", ["Almendra", "Pimienta rosa"], ["Tuberosa", "Flor de azahar"], ["Haba tonka", "Vainilla", "Pachulí"], "oscuro, intenso y exclusivo", (22, 48), year=2022, concentration="Eau de Parfum", intensity="Muy intensa", use="night", confidence="low")
add("DP02623", "Ámbar floral", ["Almendra", "Café", "Bergamota", "Limón"], ["Tuberosa", "Jazmín sambac", "Flor de azahar", "Rosa", "Iris"], ["Haba tonka", "Cacao", "Vainilla", "Praliné", "Sándalo", "Almizcle", "Ámbar", "Cachemira", "Canela", "Pachulí", "Cedro"], "gourmand, floral y brillante", (20, 48), year=2021, concentration="Eau de Parfum", intensity="Muy intensa", use="night", confidence="low", note="Superstars Collector Edition 2021 conserva la fórmula de Good Girl original.")
add("DP02592", "Ámbar floral", ["Frutos del bosque", "Jazmín egipcio"], ["Haba tonka", "Tuberosa"], ["Vetiver"], "frutal, intenso y seductor", (20, 46), year=2020, concentration="Eau de Parfum", intensity="Muy intensa", use="night")

USE_PRESETS = {
    "fresh": {
        "occasions": ["Día", "Diario", "Oficina", "Viaje", "Playa"],
        "contexts": ["Casual", "Profesional", "Vacaciones"],
        "climates": ["Calor", "Templado"], "seasons": ["Primavera", "Verano"],
        "dayParts": ["Mañana", "Tarde"],
    },
    "night": {
        "occasions": ["Noche", "Cita", "Fiesta", "Evento"],
        "contexts": ["Romántico", "Social", "Especial"],
        "climates": ["Frío", "Templado"], "seasons": ["Otoño", "Invierno"],
        "dayParts": ["Tarde", "Noche"],
    },
    "classic": {
        "occasions": ["Día", "Noche", "Oficina", "Evento"],
        "contexts": ["Profesional", "Formal", "Especial"],
        "climates": ["Templado", "Frío"], "seasons": ["Otoño", "Invierno", "Primavera"],
        "dayParts": ["Mañana", "Tarde", "Noche"],
    },
    "versatile": {
        "occasions": ["Día", "Noche", "Diario", "Oficina", "Cita"],
        "contexts": ["Casual", "Profesional", "Social"],
        "climates": ["Templado", "Calor", "Frío"], "seasons": ["Primavera", "Otoño", "Verano"],
        "dayParts": ["Mañana", "Tarde", "Noche"],
    },
}

NOTE_TRAITS = {
    "freshness": ["bergamota", "limón", "lima", "mandarina", "toronja", "menta", "mar", "acuát", "ozón", "verde", "romero", "lavanda"],
    "sweetness": ["vainilla", "caramelo", "azúcar", "haba tonka", "miel", "cacao", "chocolate", "frut", "manzana", "pera", "piña", "ciruela", "praliné"],
    "warmth": ["ámbar", "canela", "tabaco", "whisky", "ron", "benjuí", "incienso", "vainilla", "cuero", "oud", "cacao", "mirra"],
    "woodiness": ["cedro", "sándalo", "vetiver", "pachulí", "guayaco", "palisandro", "abedul", "madera", "oud", "ciprés"],
    "spiciness": ["pimienta", "cardamomo", "canela", "nuez moscada", "azafrán", "cilantro", "anís", "jengibre", "clavo", "especia"],
    "floral": ["rosa", "jazmín", "iris", "geranio", "lavanda", "flor de azahar", "gardenia", "violeta", "muguete", "belladona"],
    "citrus": ["bergamota", "limón", "mandarina", "toronja", "naranja", "lima", "cítrico", "petitgrain", "neroli", "cidra"],
    "fruitiness": ["manzana", "piña", "melón", "pera", "grosella", "frambuesa", "mango", "ciruela", "frut", "maracuyá", "durazno", "membrillo"],
    "aquatic": ["mar", "acuát", "calone", "sal", "ozón", "agua"],
    "powdery": ["iris", "heliotropo", "violeta", "almizcle", "haba tonka", "atalcado", "ambreta"],
    "smoky": ["incienso", "tabaco", "abedul", "humo", "mirra", "lábdano", "ládano", "styrax", "cade"],
    "leathery": ["cuero", "ante", "castóreo"],
}


def sensory(notes):
    haystack = " ".join(notes).lower()
    out = {}
    for trait, words in NOTE_TRAITS.items():
        hits = sum(1 for word in words if word in haystack)
        out[trait] = min(5, hits * 2 if hits < 3 else 5)
    return out


def accords_for(p):
    text = " ".join([p["family"]] + p["top"] + p["heart"] + p["base"]).lower()
    rules = [
        ("Aromático", ["aromát", "lavanda", "salvia", "romero", "menta", "geranio"]),
        ("Amaderado", ["amader", "cedro", "sándalo", "vetiver", "pachulí", "oud", "guayaco"]),
        ("Cítrico", ["cítric", "bergamota", "limón", "lima", "mandarina", "toronja", "naranja", "cidra"]),
        ("Fresco especiado", ["jengibre", "cardamomo", "pimienta", "menta", "enebro"]),
        ("Cálido especiado", ["canela", "clavo", "nuez moscada", "azafrán", "tabaco"]),
        ("Dulce", ["vainilla", "tonka", "miel", "caramelo", "praliné", "cacao", "chocolate"]),
        ("Afrutado", ["manzana", "pera", "piña", "ciruela", "mango", "melón", "frut", "membrillo"]),
        ("Acuático", ["acuát", "mar", "agua", "calone", "sal"]),
        ("Ámbar", ["ámbar", "ambroxan", "lábdano", "ládano", "benjuí"]),
        ("Cuero", ["cuero", "ante"]),
        ("Almizclado", ["almizcle", "ambreta"]),
        ("Floral", ["rosa", "jazmín", "iris", "violeta", "geranio", "flor de azahar", "muguete", "belladona"]),
        ("Ahumado", ["incienso", "humo", "tabaco", "mirra", "styrax", "cade"]),
        ("Verde", ["verde", "hojas", "albahaca", "salvia", "menta"]),
        ("Avainillado", ["vainilla"]),
        ("Atalcado", ["iris", "violeta", "almizcle", "ambreta", "haba tonka"]),
    ]
    scored = []
    for label, tokens in rules:
        score = sum(text.count(token) for token in tokens)
        if score:
            scored.append((score, label))
    scored.sort(key=lambda x: (-x[0], x[1]))
    out = [label for _, label in scored[:6]]
    return out or [p["family"]]


def description_for(p):
    accords = accords_for(p)
    lead = ", ".join(accords[:3]).lower()
    opening = ", ".join(p["top"][:3]).lower()
    drydown = ", ".join(p["base"][:3]).lower()
    return (f"Una fragancia de perfil {lead}, con una salida de {opening} que evoluciona hacia "
            f"un fondo de {drydown}. Su carácter {p['style']} ayuda al Asesor PRIVÉ a ubicarla "
            "por gusto, ocasión y clima sin convertir la edad en una regla.")


def age_guidance(p):
    low, high = p["age"]
    return (f"Tendencia orientativa: suele conectar especialmente con personas de {low} a {high} años "
            f"por su estilo {p['style']}. No es una regla ni limita su uso: si te atraen sus notas y "
            "la imagen que proyecta, puede funcionar muy bien a cualquier edad. Si buscas una impresión "
            "más juvenil o más clásica, el Asesor PRIVÉ puede sugerirte alternativas cercanas.")


def fragrantica_url(item):
    return f"https://www.fragrantica.com/search/?query={quote_plus(item['designer'] + ' ' + item['name'])}"


def perfumoteca_url(item):
    return f"https://perfumoteca.com/catalogo?search={quote_plus(item['code'])}"


def provider_url(item):
    return f"https://glass-essence.com/?s={quote_plus(item['code'])}&post_type=product"


def make_core(item, p):
    use = USE_PRESETS[p["use"]]
    all_notes = p["top"] + p["heart"] + p["base"]
    confidence = p["confidence"]
    accords = accords_for(p)
    note = p["note"] or "Nombre e imagen conservados desde el catálogo operativo; la clave se utiliza para la consulta exacta del proveedor."
    return {
        "schemaVersion": "1.0.0",
        "id": item["id"],
        "status": "review",
        "identity": {
            "brand": item["designer"], "name": item["name"], "line": None, "flanker": None,
            "priveCode": item["code"], "sku": None, "audience": item["category"],
            "concentration": p["concentration"], "launchYear": p["year"],
            "perfumers": [], "countryOfOrigin": None,
        },
        "classification": {
            "family": p["family"], "subfamily": None, "accords": accords,
            "styleTags": [tag.strip().capitalize() for tag in p["style"].split(",")],
        },
        "olfactory": {
            "topNotes": p["top"], "heartNotes": p["heart"], "baseNotes": p["base"],
            "notePyramidConfidence": confidence,
        },
        "performance": {
            "intensity": p["intensity"], "longevity": "Desconocida", "projection": "Desconocida",
            "trail": "Desconocida", "longevityHours": {"min": None, "max": None},
        },
        "sensoryProfile": sensory(all_notes + accords),
        "recommendation": {
            "occasions": use["occasions"], "contexts": use["contexts"], "climates": use["climates"],
            "seasons": use["seasons"], "dayParts": use["dayParts"],
            "formality": 4 if "Formal" in use["contexts"] else 3 if "Profesional" in use["contexts"] else 2,
            "versatility": 5 if p["use"] == "versatile" else 4 if p["use"] == "fresh" else 3,
            "distinctiveness": 4 if any(x in " ".join(accords + all_notes) for x in ["Oud", "Incienso", "Cuero", "Tabaco", "Whisky", "Café", "Cacao", "Rosa"]) else 3,
            "recommendedAge": {
                "min": p["age"][0], "max": p["age"][1], "confidence": "low",
                "framing": "tendency", "isRestrictive": False, "guidance": age_guidance(p),
            },
        },
        "content": {
            "shortDescription": description_for(p),
            "advisorSummary": (f"Perfil {p['style']}. Afinidad orientativa: {p['age'][0]} a {p['age'][1]} años; "
                               "sus notas pueden funcionar a cualquier edad según tus gustos y la imagen que deseas proyectar."),
            "wearingTips": [
                f"Suele rendir mejor en clima {' y '.join(x.lower() for x in use['climates'])}.",
                "La edad es solo una tendencia de afinidad; prioriza el aroma, la ocasión y la imagen que quieres proyectar.",
            ],
            "image": {"path": f"IMAGES/{item['category']}/{item['code']}.avif", "alt": f"{item['designer']} {item['name']}"},
        },
        "provenance": {
            "lastReviewedAt": TODAY, "reviewedBy": "PRIVÉ — Base Maestra Lote 004",
            "confidence": confidence,
            "sources": [
                {"type": "internal", "title": "Catálogo operativo PRIVÉ — nombre, imagen, categoría y clave", "url": None, "accessedAt": TODAY, "supports": ["identity"]},
                {"type": "community", "title": "Fragrantica — nombre, versión, imagen y contraste olfativo", "url": fragrantica_url(item), "accessedAt": TODAY, "supports": ["identity", "classification", "olfactory"]},
                {"type": "editorial", "title": f"Perfumoteca — búsqueda exacta por clave {item['code']}", "url": perfumoteca_url(item), "accessedAt": TODAY, "supports": ["identity", "olfactory"]},
                {"type": "supplier", "title": f"Glass Essence — respaldo técnico por clave {item['code']}", "url": provider_url(item), "accessedAt": TODAY, "supports": ["classification", "olfactory"]},
            ],
            "notes": ("Lote maestro 003. Fragrantica y Perfumoteca se mantienen como fuentes principales complementarias: "
                      "Fragrantica conserva nombre/versión/imagen; Perfumoteca y la búsqueda técnica por clave representan "
                      "la referencia olfativa usada por proveedor y pedidos PRIVÉ. " + note + " La ficha permanece en review; "
                      "no se inventan datos ante diferencias. La edad es orientativa y nunca restrictiva."),
        },
    }


def main():
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    batch = catalog[BATCH_START:BATCH_START + BATCH_SIZE]
    expected_codes = {item["code"] for item in batch}
    missing = [item["code"] for item in batch if item["code"] not in P]
    extra = sorted(set(P) - expected_codes)
    if missing or extra:
        raise SystemExit(f"Perfiles incompletos. Faltan={missing}; sobran={extra}")

    new_filenames = []
    review_rows = []
    for position, item in enumerate(batch, BATCH_START + 1):
        p = P[item["code"]]
        core = make_core(item, p)
        filename = f"{item['id']}.json"
        (CORE_DIR / filename).write_text(json.dumps(core, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        new_filenames.append(filename)
        review_rows.append({
            "position": position, "code": item["code"], "designer": item["designer"], "name": item["name"],
            "fragrantica_reference": fragrantica_url(item), "perfumoteca_lookup_key": item["code"],
            "provider_lookup": provider_url(item), "status": "review", "confidence": p["confidence"],
            "review_notes": p["note"],
        })

    manifest_path = CORE_DIR / "catalog.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    previous_files = list(manifest["perfumes"])
    previous_batches = list(manifest["batches"])
    manifest.update({
        "schemaVersion": "1.0.0", "batchSize": 50, "activeBatchSize": BATCH_SIZE, "activeBatch": 4,
        "reviewPolicy": "Regla general: lotes de 50 fragancias. Los lotes 002, 003 y 004 son ampliaciones autorizadas de 100; cada lote se valida antes de activar el siguiente.",
        "sourcePolicy": "Fragrantica y Perfumoteca son fuentes principales complementarias. Nombre/versión/imagen desde Fragrantica; clave y referencia olfativa del proveedor desde Perfumoteca, con respaldo técnico por clave en Glass Essence.",
        "agePolicy": "La edad es una tendencia orientativa y secundaria; nunca una restricción.",
        "batches": previous_batches + [{"id": "batch-004", "status": "review", "createdAt": TODAY, "count": len(new_filenames), "codes": [item["code"] for item in batch]}],
        "perfumes": previous_files + new_filenames,
    })
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    review_path = CORE_DIR / "review-batch-004.csv"
    with review_path.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(review_rows[0]))
        writer.writeheader(); writer.writerows(review_rows)

    print(f"Generadas {len(new_filenames)} fichas Core en lote 004; total activo={len(manifest['perfumes'])}")


if __name__ == "__main__":
    main()
