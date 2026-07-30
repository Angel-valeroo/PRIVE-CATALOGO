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
BATCH_START = 150
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

# 151-165 · HUGO BOSS
add("CP02317", "Aromática fougère", ["Hojas de violeta", "Toronja", "Menta"], ["Rosa", "Canela", "Piña"], ["Sándalo", "Almizcle blanco", "Ládano"], "fresco, frutal y deportivo", (18, 42), year=2016, use="fresh", note="Edición Mats Hummels; identidad confirmada por nombre e imagen. La clave del proveedor conserva la referencia olfativa de Boss Bottled Unlimited.")
add("CP01411", "Aromática especiada", ["Lavanda", "Aldehídos", "Limón", "Bergamota", "Abrótano", "Albahaca"], ["Violeta", "Esclarea", "Jazmín", "Alcaravea", "Rosa", "Muguete", "Cilantro"], ["Cuero", "Sándalo", "Almizcle", "Cedro", "Ámbar", "Musgo de roble"], "clásico, aromático y elegante", (30, 62), year=1994, use="classic", intensity="Intensa")
add("CP00752", "Ámbar especiada", ["Naranja", "Bergamota", "Hojas de violeta", "Albahaca"], ["Canela", "Cardamomo", "Nuez moscada", "Pimienta rosa"], ["Almizcle", "Sándalo", "Vetiver", "Notas amaderadas"], "energético, especiado y dinámico", (20, 48), year=2002, use="versatile")
add("CP01050", "Amaderada especiada", ["Manzana roja", "Cilantro"], ["Incienso", "Pimienta de Sichuan"], ["Vainilla", "Notas amaderadas"], "cálido, casual y seductor", (20, 45), year=2011, use="versatile")
add("CP02156", "Aromática especiada", ["Jengibre", "Mandarina", "Bergamota"], ["Maninka", "Lavanda"], ["Cuero", "Notas amaderadas"], "seductor, moderno y elegante", (24, 52), year=2015, use="night", intensity="Intensa")
add("CP02871", "Ámbar floral", ["Pimienta rosa"], ["Belladona"], ["Ámbar gris"], "floral, oscuro y sensual", (24, 55), year=2024, concentration="Eau de Parfum", intensity="Intensa", use="night", confidence="low", note="La imagen corresponde a Boss The Scent Elixir For Her, aunque el catálogo operativo la ubica en Caballero. Conservar en review para corregir audiencia sin romper el catálogo.")
add("CP02367", "Cuero", ["Maninka", "Jengibre"], ["Iris"], ["Cuero", "Notas amaderadas"], "intenso, refinado y nocturno", (26, 55), year=2022, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP02479", "Amaderada aromática", ["Incienso", "Cuero"], ["Mirra", "Pachulí"], ["Cedro", "Davana"], "profundo, ahumado y elegante", (28, 58), year=2024, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP00850", "Aromática verde", ["Manzana verde", "Menta", "Lavanda", "Toronja", "Albahaca"], ["Clavel", "Salvia", "Geranio", "Jazmín"], ["Abeto", "Cedro", "Pachulí"], "verde, juvenil y urbano", (18, 45), year=1995, use="fresh")
add("CP00848", "Ámbar especiada", ["Jengibre", "Toronja", "Naranja", "Lima", "Limón"], ["Ciprés", "Caoba", "Cardamomo", "Salvia", "Geranio"], ["Vainilla", "Cedro", "Benjuí", "Vetiver", "Pachulí"], "oscuro, cítrico y especiado", (22, 50), year=1999, use="night", intensity="Intensa")
add("CP00851", "Amaderada aromática", ["Cardamomo", "Pimienta rosa", "Mandarina", "Limón"], ["Cilantro", "Enebro", "Fresia"], ["Cuero", "Vainilla", "Teca"], "vibrante, especiado y urbano", (20, 45), year=2005, use="versatile")
add("CP02207", "Aromática acuática", ["Menta", "Té"], ["Naranja amarga", "Enebro"], ["Vetiver"], "helado, limpio y minimalista", (18, 44), year=2017, use="fresh")
add("CP02468", "Ámbar fougère", ["Manzana roja", "Canela", "Lima", "Toronja sanguina"], ["Geranio", "Tomillo rojo"], ["Cuero", "Cedro", "Pachulí"], "intenso, cálido y rebelde", (20, 46), year=2023, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02424", "Amaderada aromática", ["Toronja", "Lima"], ["Bayas de enebro", "Menta"], ["Cedro", "Vetiver"], "fresco, casual y moderno", (18, 42), year=2022, use="fresh")
add("CP00849", "Aromática", ["Manzana verde", "Menta"], ["Albahaca", "Fresia", "Cilantro"], ["Cachemira", "Pachulí", "Olíbano", "Ládano"], "verde, creativo y contemporáneo", (18, 45), year=2011, use="versatile")

# 166-177 · ISSEY MIYAKE / JEAN PAUL GAULTIER
add("CP00871", "Amaderada acuática", ["Yuzu", "Limón", "Bergamota", "Verbena", "Mandarina", "Calone", "Ciprés"], ["Loto", "Nuez moscada", "Muguete", "Azafrán", "Geranio", "Canela"], ["Vetiver", "Almizcle", "Sándalo", "Cedro", "Tabaco", "Ámbar"], "acuático, cítrico y atemporal", (22, 60), year=1994, use="fresh")
add("CP02319", "Amaderada aromática", ["Bergamota"], ["Coco"], ["Haba tonka"], "tropical, dulce y seductor", (18, 42), year=2019, use="night", intensity="Intensa")
add("CP02500", "Aromática frutal", ["Kumquat", "Limón"], ["Hojas de violeta", "Geranio"], ["Cachemira", "Haba tonka", "Pachulí"], "luminoso, herbal y veraniego", (18, 42), year=2025, use="fresh")
add("CP02509", "Aromática verde", ["Notas verdes", "Menta", "Jengibre"], ["Coco", "Higo", "Sal"], ["Haba tonka", "Sándalo"], "tropical, verde y sofisticado", (20, 45), year=2024, concentration="Eau de Parfum", use="versatile", intensity="Intensa")
add("CP00879", "Ámbar fougère", ["Lavanda", "Menta", "Cardamomo", "Bergamota", "Abrótano"], ["Canela", "Flor de azahar", "Alcaravea"], ["Vainilla", "Haba tonka", "Ámbar", "Sándalo", "Cedro"], "dulce, clásico y carismático", (22, 58), year=1995, use="night", intensity="Intensa")
add("CP02475", "Ámbar fougère", ["Lavanda", "Menta"], ["Vainilla", "Benjuí"], ["Miel", "Haba tonka", "Tabaco"], "opulento, dulce y magnético", (22, 48), year=2023, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP02516", "Amaderada aromática", ["Ciruela", "Canela", "Cardamomo", "Bergamota"], ["Lavanda", "Davana", "Abrótano"], ["Haba tonka", "Benjuí", "Ambreta", "Pachulí", "Ládano"], "especiado, afrutado y lujoso", (22, 50), year=2025, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP02345", "Ámbar", ["Cardamomo"], ["Lavanda", "Iris"], ["Vainilla", "Notas orientales", "Notas amaderadas"], "elegante, avainillado y nocturno", (24, 52), year=2020, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02358", "Ámbar amaderada", ["Salvia esclarea", "Mandarina"], ["Caramelo", "Haba tonka"], ["Vetiver"], "dulce, moderno y divertido", (18, 42), year=2021, use="night", intensity="Intensa")
add("CP02470", "Ámbar amaderada", ["Ciruela mirabel"], ["Castaña"], ["Sándalo"], "gourmand, cálido y sofisticado", (22, 48), year=2024, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP02394", "Ámbar", ["Geranio"], ["Haba tonka"], ["Sándalo"], "dulce, oscuro y sensual", (22, 48), year=2022, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP02148", "Ámbar fougère", ["Pera", "Lavanda", "Menta", "Bergamota", "Limón"], ["Canela", "Salvia esclarea", "Alcaravea"], ["Vainilla negra", "Ámbar", "Pachulí", "Cedro"], "juvenil, dulce y de fiesta", (18, 38), year=2015, use="night", intensity="Muy intensa")

# 178-187 · JOVAN / LACOSTE
add("CP00862", "Aromática", ["Clavel", "Pimienta", "Limón", "Lima"], ["Especias", "Lavanda", "Menta", "Maderas exóticas"], ["Almizcle", "Notas amaderadas"], "almizclado, clásico y cálido", (28, 62), year=1973, use="classic", intensity="Intensa")
add("CP02244", "Aromática acuática", ["Limón", "Jengibre", "Notas acuáticas"], ["Notas verdes", "Enebro", "Manzana"], ["Ambroxan", "Cedro", "Almizcle"], "fresco, deportivo y casual", (18, 42), year=2018, use="fresh")
add("CP01082", "Amaderada aromática", ["Toronja", "Romero", "Cardamomo"], ["Ylang-ylang", "Tuberosa"], ["Ante", "Cedro", "Vetiver", "Cuero"], "limpio, elegante y deportivo", (20, 50), year=2011, use="versatile", note="Edición limitada de botella; perfil vinculado a L.12.12 Blanc.")
add("CP02112", "Aromática", ["Sandía"], ["Albahaca", "Lavanda", "Verbena"], ["Chocolate oscuro", "Cachemira", "Cumarina", "Pachulí"], "oscuro, dulce y juvenil", (18, 42), year=2013, use="night", intensity="Intensa")
add("CP02220", "Aromática especiada", ["Bambú", "Enebro", "Abrótano"], ["Té", "Violeta", "Geranio"], ["Vetiver", "Ámbar", "Pachulí"], "magnético, herbal y moderno", (20, 45), year=2016, use="versatile")
add("CP00813", "Amaderada aromática", ["Casis", "Bergamota", "Mandarina", "Hojas de tomate"], ["Rosa", "Pimienta"], ["Sándalo", "Pachulí"], "verde, limpio y cotidiano", (20, 50), year=2005, use="fresh")
add("CP02406", "Aromática especiada", ["Mandarina", "Cúrcuma"], ["Lavanda", "Cardamomo", "Salvia esclarea"], ["Cuero", "Sándalo", "Vetiver"], "intenso, limpio y elegante", (22, 48), year=2023, concentration="Eau de Toilette Intense", intensity="Intensa", use="versatile")
add("CP02121", "Aromática acuática", ["Toronja", "Menta"], ["Flor de azahar", "Salvia"], ["Pachulí", "Helecho", "Musgo de roble"], "acuático, herbal y deportivo", (18, 45), year=2011, use="fresh")
add("CP00873", "Amaderada especiada", ["Ruibarbo", "Naranja dulce", "Mandarina", "Membrillo"], ["Pimienta negra", "Jengibre", "Jazmín", "Almendra"], ["Cedro", "Notas amaderadas", "Ámbar", "Almizcle", "Vainilla"], "frutal, especiado y refinado", (22, 50), year=2017, use="versatile")
add("CP00874", "Aromática fougère", ["Manzana verde"], ["Pino"], ["Pachulí", "Vetiver"], "verde, energético y casual", (18, 42), year=2004, use="fresh")

# 188-200 · LATTAFA / LIZ CLAIBORNE / LOUIS VUITTON / MARGIELA / MERCEDES / MESSI
add("CP02464", "Ámbar", ["Pimienta negra", "Tabaco", "Piña"], ["Pachulí", "Café", "Iris"], ["Vainilla", "Ámbar", "Maderas secas", "Benjuí", "Ládano"], "especiado, oscuro y potente", (22, 50), year=2021, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP02504", "Ámbar especiada", ["Lavanda", "Ciruela mirabel", "Pimienta rosa"], ["Cacao", "Nuez moscada", "Davana"], ["Vainilla Bourbon", "Ámbar", "Vetiver"], "gourmand, cálido y sofisticado", (20, 48), year=2025, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02477", "Ámbar amaderada", ["Canela", "Lavanda", "Mandarina"], ["Iris", "Benjuí", "Ciprés", "Mahonial"], ["Vainilla", "Haba tonka", "Ámbar", "Incienso", "Cedro", "Pachulí"], "cremoso, elegante y misterioso", (22, 50), year=2024, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02455", "Ámbar especiada", ["Pimienta negra", "Pimienta rosa", "Azafrán"], ["Ládano", "Aceite de cade", "Bálsamo gurjun", "Ruibarbo"], ["Cuero", "Cedro", "Madera de guayaco", "Almizcle", "Musgo", "Pachulí"], "ahumado, oscuro y desafiante", (24, 52), year=2019, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP00787", "Aromática verde", ["Piña", "Lavanda", "Limón", "Enebro", "Neroli"], ["Bergamota", "Cactus", "Jengibre", "Violeta", "Salvia"], ["Almizcle", "Sándalo", "Ámbar", "Vetiver", "Cedro", "Caoba"], "frutal, verde y relajado", (18, 45), year=1996, use="versatile")
add("CP00888", "Ámbar fougère", ["Lavanda", "Bergamota", "Lima", "Verbena"], ["Canela", "Flor de azahar", "Alcaravea", "Geranio", "Cedro"], ["Sándalo", "Almizcle", "Pachulí", "Abeto"], "cálido, clásico y rítmico", (24, 55), year=2001, use="night")
add("CP02293", "Cuero amaderada", ["Cardamomo", "Bergamota", "Limón"], ["Sándalo", "Neroli", "Fresia"], ["Cuero", "Almizcle", "Ambreta"], "seco, refinado y viajero", (26, 58), year=2018, concentration="Eau de Parfum", intensity="Intensa", use="classic", confidence="medium")
add("CP02498", "Cítrica aromática", ["Cidra", "Bergamota de Calabria", "Naranja siciliana"], ["Neroli de Túnez", "Jengibre de Nigeria", "Canela de Ceilán"], ["Té negro chino", "Ambroxan", "Madera de guayaco", "Olíbano"], "luminoso, limpio y lujoso", (22, 58), year=2021, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP02439", "Ámbar especiada", ["Toronja", "Jengibre", "Bergamota"], ["Notas acuáticas", "Salvia", "Romero", "Geranio"], ["Ambroxan", "Ámbar", "Ládano"], "cítrico, mineral y expansivo", (22, 55), year=2018, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP02397", "Cuero", ["Pimienta rosa", "Neroli", "Limón"], ["Ron", "Salvia esclarea", "Vetiver de Java"], ["Hoja de tabaco", "Vainilla", "Styrax"], "bohemio, cálido y nocturno", (24, 55), year=2013, use="night", intensity="Intensa")
add("CP02398", "Amaderada aromática", ["Bergamota", "Mandarina", "Menta"], ["Lavanda", "Flor de azahar", "Ciprés"], ["Amberwood", "Almizcle", "Haba tonka"], "moderno, limpio y seguro", (20, 48), year=2022, concentration="Eau de Parfum", use="versatile")
add("CP02170", "Amaderada especiada", ["Bergamota", "Limón", "Mandarina"], ["Violeta", "Pimienta", "Gálbano", "Nuez moscada"], ["Vetiver", "Pachulí", "Cedro"], "elegante, metálico y clásico", (26, 58), year=2012, use="classic")
add("CP02485", "Amaderada aromática", ["Cardamomo", "Hojas de manzano", "Ciprés"], ["Cuero", "Lavanda", "Raíz de lirio"], ["Vainilla", "Pachulí", "Cedro de Virginia"], "cálido, deportivo y elegante", (20, 50), year=2024, concentration="Eau de Parfum", intensity="Intensa", use="versatile")

# 201-217 · MICHAEL JORDAN / MONTBLANC / MOSCHINO / NAUTICA
add("CP00891", "Amaderada aromática", ["Ciprés", "Coñac", "Toronja", "Geranio"], ["Enebro", "Lavanda", "Abeto"], ["Sándalo", "Pachulí", "Almizcle"], "deportivo, cálido y clásico", (22, 55), year=1997, use="versatile")
add("CP02216", "Aromática especiada", ["Salvia esclarea", "Toronja", "Cardamomo"], ["Hojas de violeta", "Canela"], ["Haba tonka", "Notas amaderadas"], "sobrio, aromático y profesional", (24, 55), year=2014, use="classic")
add("CP02263", "Amaderada aromática", ["Bergamota", "Pimienta rosa", "Salvia esclarea"], ["Vetiver de Haití", "Cuero"], ["Ambroxan", "Akigalawood", "Pachulí de Indonesia", "Cacao"], "aventurero, versátil y moderno", (20, 50), year=2019, use="versatile")
add("CP02351", "Cítrica aromática", ["Bergamota siciliana", "Pimienta rosa", "Frutas exóticas"], ["Notas marinas", "Ámbar gris"], ["Pachulí de Indonesia", "Notas amaderadas", "Cuero"], "marino, fresco y aventurero", (18, 45), year=2021, use="fresh")
add("CP01056", "Aromática fougère", ["Lavanda", "Piña", "Bergamota", "Verbena"], ["Manzana roja", "Frutos secos", "Musgo de roble", "Geranio", "Cumarina", "Rosa"], ["Haba tonka", "Sándalo"], "limpio, masculino y versátil", (20, 52), year=2011, use="versatile")
add("CP02461", "Amaderada aromática", ["Menta", "Lavanda"], ["Cedro", "Sándalo"], ["Ambroxan", "Musgo"], "fresco, sereno y elegante", (22, 52), year=2024, concentration="Eau de Parfum", use="versatile")
add("CP02115", "Aromática fougère", ["Piña", "Bergamota"], ["Manzana roja", "Cardamomo", "Pimienta", "Jazmín"], ["Haba tonka", "Ámbar", "Cedro blanco", "Musgo de roble"], "frutal, intenso y elegante", (22, 50), year=2013, use="night", intensity="Intensa")
add("CP02222", "Amaderada aromática", ["Cardamomo", "Menta", "Bergamota", "Salvia esclarea"], ["Manzana", "Lavanda", "Cedro", "Violeta", "Resina de abeto"], ["Vainilla negra", "Akigalawood", "Almizcle", "Vetiver", "Pachulí"], "oscuro, aromático y seductor", (24, 52), year=2017, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02369", "Aromática frutal", ["Naranja sanguina", "Toronja", "Cardamomo"], ["Cedro", "Enebro", "Salvia esclarea"], ["Cedro del Atlas", "Caoba", "Haba tonka"], "vibrante, rojo y dinámico", (20, 48), year=2022, concentration="Eau de Parfum", use="versatile")
add("CP02273", "Amaderada aromática", ["Toronja", "Bergamota", "Pimienta rosa"], ["Notas acuáticas", "Lavanda", "Cardamomo"], ["Almizcle blanco", "Maderas blancas", "Cachemira", "Musgo de roble"], "limpio, deportivo y versátil", (18, 48), year=2016, use="fresh")
add("CP00948", "Amaderada especiada", ["Bambú", "Bergamota", "Mandarina"], ["Sándalo", "Almizcle blanco", "Cedro"], ["Jengibre", "Resina de abeto", "Ámbar", "Nuez moscada"], "transparente, amaderado y relajado", (20, 50), year=2005, use="versatile")
add("CP02275", "Floral amaderada almizclada", ["Pimienta rosa", "Pera", "Nuez moscada", "Elemi", "Bergamota"], ["Rosa", "Clavo", "Magnolia", "Lino"], ["Cachemira", "Vetiver de Haití", "Sándalo", "Ámbar", "Almizcle"], "atrevido, rosado y vanguardista", (20, 48), year=2019, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP00899", "Aromática acuática", ["Aldehídos", "Lima", "Limón", "Bergamota", "Neroli"], ["Ciclamen", "Jazmín", "Alcaravea", "Rosa", "Geranio"], ["Sándalo", "Almizcle", "Cedro", "Musgo de roble", "Pachulí"], "marino, clásico y limpio", (24, 58), year=1992, use="fresh")
add("CP02119", "Aromática acuática", ["Sal marina", "Jengibre"], ["Salvia", "Lavanda"], ["Notas amaderadas", "Haba tonka"], "salino, casual y tranquilo", (20, 48), year=2014, use="fresh")
add("CP01038", "Aromática acuática", ["Agua de mar", "Limón", "Sal"], ["Geranio", "Lavanda"], ["Teca", "Ámbar"], "acuático, ligero y limpio", (18, 45), year=2009, use="fresh")
add("CP01060", "Amaderada acuática", ["Hojas verdes", "Manzana"], ["Loto", "Mimosa"], ["Almizcle", "Cedro", "Musgo de roble", "Ámbar"], "fresco, frutal y cotidiano", (16, 42), year=2006, use="fresh")
add("CP02228", "Amaderada acuática", ["Notas marinas", "Cítricos", "Cilantro", "Manzana"], ["Hoja de palma", "Pimienta verde", "Geranio", "Apio"], ["Almizcle", "Cedro", "Vetiver", "Pachulí"], "deportivo, verde y marino", (18, 42), year=2016, use="fresh")

# 218-240 · PACO RABANNE / RABANNE
add("CP01021", "Amaderada especiada", ["Mandarina sanguina", "Toronja", "Menta"], ["Canela", "Notas especiadas", "Rosa"], ["Ámbar", "Cuero", "Notas amaderadas", "Pachulí"], "dulce, llamativo y nocturno", (18, 45), year=2008, use="night", intensity="Muy intensa")
add("CP02370", "Amaderada aromática", ["Manzana", "Davana"], ["Rosa de Damasco", "Cedro", "Osmanto"], ["Vainilla absoluta", "Haba tonka", "Pachulí"], "opulento, frutal y sensual", (22, 48), year=2022, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP02442", "Cuero amaderada", ["Azafrán", "Nuez moscada", "Pimienta negra", "Bergamota"], ["Pachulí", "Bálsamo gurjun", "Sándalo"], ["Cuero", "Oud", "Cedro", "Ládano"], "lujoso, oscuro y oriental", (28, 58), year=2023, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP02242", "Amaderada", ["Ciruela", "Notas ozónicas", "Toronja", "Bergamota"], ["Avellana", "Miel", "Cedro", "Cachemira", "Flor de azahar", "Jazmín"], ["Amberwood", "Pachulí", "Musgo de roble", "Vetiver"], "dulce, avellanado y juvenil", (18, 42), year=2018, use="night", intensity="Intensa")
add("CP02270", "Ámbar amaderada", ["Canela", "Mandarina sanguina"], ["Tabaco", "Mirra"], ["Haba tonka", "Pachulí"], "tabacoso, cálido y elegante", (24, 52), year=2016, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP02402", "Ámbar amaderada", ["Cardamomo", "Mandarina", "Bergamota"], ["Lavanda", "Hojas de violeta", "Salvia"], ["Benjuí", "Cedro", "Pachulí"], "regio, especiado y moderno", (22, 50), year=2023, concentration="Parfum", intensity="Intensa", use="night")
add("CP00745", "Ámbar amaderada", ["Limón", "Salvia"], ["Praliné", "Canela", "Bálsamo de Tolú", "Cardamomo negro"], ["Palisandro de Brasil", "Pachulí", "Ámbar negro"], "dulce, oscuro y rebelde", (18, 42), year=2005, use="night", intensity="Intensa")
add("CP01092", "Amaderada acuática", ["Notas marinas", "Toronja", "Mandarina"], ["Hoja de laurel", "Jazmín"], ["Ámbar gris", "Madera de guayaco", "Musgo de roble", "Pachulí"], "deportivo, marino y triunfal", (18, 45), year=2013, use="fresh", intensity="Intensa")
add("CP02431", "Aromática acuática", ["Mandarina verde", "Toronja", "Pimienta rosa"], ["Notas marinas", "Lavanda", "Hojas de violeta"], ["Ámbar gris", "Sándalo", "Almizcle"], "acuático, chispeante y moderno", (18, 42), year=2024, use="fresh", confidence="medium", note="Nueva edición Invictus Aqua; conservar en review para contrastar pirámide exacta con la clave del proveedor.")
add("CP02246", "Amaderada acuática", ["Toronja", "Hojas de violeta", "Notas marinas"], ["Violeta", "Notas amaderadas"], ["Ámbar gris", "Amberwood"], "marino, violeta y deportivo", (18, 42), year=2018, use="fresh")
add("CP02219", "Ámbar especiada", ["Pimienta negra", "Flor de azahar"], ["Laurel", "Whisky"], ["Ámbar", "Sal", "Ámbar gris"], "salado, oscuro y potente", (22, 48), year=2016, use="night", intensity="Muy intensa")
add("CP02265", "Amaderada aromática", ["Sal marina", "Toronja", "Notas marinas"], ["Hoja de laurel", "Geranio", "Especias"], ["Ámbar rojo", "Madera de guayaco"], "salino, especiado y épico", (20, 45), year=2019, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP02342", "Amaderada acuática", ["Notas marinas", "Toronja", "Mandarina"], ["Hoja de laurel", "Jazmín"], ["Ámbar gris", "Madera de guayaco", "Musgo de roble", "Pachulí"], "coleccionable, deportivo y marino", (18, 45), year=2020, use="fresh", note="Edición Onyx de botella; perfil olfativo vinculado al Invictus original.")
add("CP02381", "Aromática fougère", ["Absenta", "Toronja"], ["Menta", "Lavanda"], ["Ciprés", "Pachulí"], "verde, enérgico y competitivo", (18, 42), year=2022, use="versatile", intensity="Intensa")
add("CP02335", "Ámbar", ["Pimienta rosa", "Limón"], ["Olíbano", "Lavanda"], ["Vainilla", "Haba tonka", "Ámbar"], "avainillado, cálido y victorioso", (20, 46), year=2021, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP02512", "Amaderada", ["Pimienta negra"], ["Ámbar", "Ámbar gris", "Notas amaderadas"], ["Sándalo", "Incienso", "Pachulí"], "amaderado, mineral y maduro", (24, 55), year=2025, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP02434", "Ámbar amaderada", ["Lavanda", "Cardamomo verde", "Pimienta negra"], ["Incienso", "Pachulí"], ["Vainilla", "Haba tonka"], "oscuro, avainillado y potente", (22, 48), year=2023, concentration="Parfum Intense", intensity="Muy intensa", use="night")
add("CP02480", "Amaderada aromática", ["Mandarina", "Cardamomo", "Pimienta rosa"], ["Cedro", "Sándalo", "Lavanda"], ["Vainilla", "Haba tonka", "Pachulí"], "dorado, cálido y llamativo", (20, 48), year=2024, concentration="Eau de Parfum Intense", intensity="Intensa", use="night", confidence="medium")
add("CP02346", "Amaderada aromática", ["Lavanda", "Ralladura de limón", "Limón de Amalfi"], ["Lavanda", "Manzana", "Humo", "Notas terrosas", "Pachulí"], ["Vainilla", "Lavanda", "Vetiver"], "futurista, dulce y aromático", (18, 42), year=2021, use="versatile", intensity="Intensa")
add("CP02510", "Amaderada acuática", ["Notas marinas", "Notas minerales", "Mandarina"], ["Oud", "Pachulí", "Ámbar"], ["Vainilla", "Vetiver", "Almizcle"], "marino, oscuro y futurista", (22, 50), year=2025, concentration="Parfum", intensity="Muy intensa", use="night", confidence="low", note="Lanzamiento reciente; validar la pirámide exacta contra la clave del proveedor antes de pasar a validado.")
add("CP02451", "Ámbar aromática", ["Cardamomo", "Limón", "Ruibarbo"], ["Lavanda", "Cedro", "Pachulí", "Geranio"], ["Vainilla", "Vetiver", "Musgo"], "intenso, eléctrico y sensual", (20, 46), year=2024, concentration="Eau de Parfum Intense", intensity="Muy intensa", use="night")
add("CP02388", "Amaderada aromática", ["Lavanda", "Limón"], ["Manzana", "Pachulí", "Notas ahumadas"], ["Vainilla", "Vetiver"], "coleccionable, moderno y aromático", (18, 42), year=2022, use="versatile", note="Edición Legion de botella; perfil vinculado a Phantom original.")
add("CP00981", "Amaderada aromática", ["Menta", "Bergamota", "Limón"], ["Enebro", "Cilantro", "Geranio"], ["Romero", "Musgo de roble", "Sándalo", "Cedro", "Almizcle"], "fresco, noventero y deportivo", (20, 50), year=1994, use="fresh")

# 241-250 · PALOMA / PARFUMS DE MARLY / PARIS HILTON / PERRY ELLIS
add("CP00892", "Ámbar", ["Aldehídos", "Notas afrutadas", "Gálbano", "Estragón", "Bergamota"], ["Jazmín", "Geranio", "Rosa", "Muguete"], ["Vainilla", "Haba tonka", "Ámbar", "Almizcle", "Sándalo", "Cedro"], "dulce, atalcado y clásico", (28, 62), year=1992, use="classic", intensity="Intensa")
add("CP02469", "Cítrica aromática", ["Toronja", "Bergamota", "Grosella negra"], ["Vetiver", "Mandarina verde", "Geranio"], ["Maderas secas", "Cachemira", "Ámbar gris"], "cítrico, seco y refinado", (24, 55), year=2024, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP02202", "Ámbar fougère", ["Bergamota", "Cardamomo", "Mandarina"], ["Lavanda", "Geranio", "Salvia"], ["Ámbar", "Vainilla", "Haba tonka"], "dorado, cálido y elegante", (20, 48), year=2017, use="versatile")
add("CP00863", "Aromática acuática", ["Lima", "Bergamota", "Mandarina", "Casis", "Hierba", "Limón"], ["Notas marinas", "Notas ozónicas", "Nuez moscada", "Clavo", "Loto", "Salvia", "Fresia"], ["Incienso", "Pachulí", "Musgo de roble", "Sándalo", "Ámbar", "Almizcle"], "acuático, cítrico y juvenil", (18, 42), year=2005, use="fresh")
add("CP00914", "Amaderada aromática", ["Mango", "Notas verdes", "Toronja"], ["Enebro", "Albahaca", "Salvia"], ["Ámbar", "Almizcle", "Cedro"], "tropical, casual y juvenil", (18, 42), year=2005, use="versatile")
add("CP01024", "Aromática acuática", ["Melón", "Bergamota", "Notas marinas"], ["Jazmín", "Lavanda", "Geranio"], ["Abedul blanco"], "ligero, acuático y limpio", (18, 45), year=2006, use="fresh")
add("CP00995", "Ámbar especiada", ["Tabaco", "Cardamomo", "Tamarindo"], ["Jengibre"], ["Ámbar", "Vainilla"], "cálido, especiado y sensual", (22, 50), year=2006, use="night", intensity="Intensa")
add("CP00709", "Aromática acuática", ["Lima", "Bergamota", "Ciprés"], ["Fresia", "Romero", "Lavanda"], ["Cedro", "Vetiver", "Almizcle"], "azul, limpio y cotidiano", (18, 48), year=1995, use="fresh")
add("CP00707", "Aromática", ["Bayas de enebro", "Limón", "Bergamota"], ["Lavanda", "Salvia", "Fresia", "Cardamomo"], ["Notas amaderadas", "Almizcle", "Vetiver"], "clásico, limpio y versátil", (22, 55), year=1995, use="versatile")
add("CP00708", "Cítrica aromática", ["Lima", "Bergamota", "Canela", "Naranja", "Nuez moscada", "Clavo", "Mandarina"], ["Lavanda", "Cilantro"], ["Almizcle", "Pachulí", "Cedro rojo", "Sándalo", "Vetiver", "Musgo de roble"], "cítrico, especiado y energético", (18, 48), year=2003, use="versatile")

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
            "lastReviewedAt": TODAY, "reviewedBy": "PRIVÉ — Base Maestra Lote 003",
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
        "schemaVersion": "1.0.0", "batchSize": 50, "activeBatchSize": BATCH_SIZE, "activeBatch": 3,
        "reviewPolicy": "Regla general: lotes de 50 fragancias. Los lotes 002 y 003 son ampliaciones autorizadas de 100; cada lote se valida antes de activar el siguiente.",
        "sourcePolicy": "Fragrantica y Perfumoteca son fuentes principales complementarias. Nombre/versión/imagen desde Fragrantica; clave y referencia olfativa del proveedor desde Perfumoteca, con respaldo técnico por clave en Glass Essence.",
        "agePolicy": "La edad es una tendencia orientativa y secundaria; nunca una restricción.",
        "batches": previous_batches + [{"id": "batch-003", "status": "review", "createdAt": TODAY, "count": len(new_filenames), "codes": [item["code"] for item in batch]}],
        "perfumes": previous_files + new_filenames,
    })
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    review_path = CORE_DIR / "review-batch-003.csv"
    with review_path.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(review_rows[0]))
        writer.writeheader(); writer.writerows(review_rows)

    print(f"Generadas {len(new_filenames)} fichas Core en lote 003; total activo={len(manifest['perfumes'])}")


if __name__ == "__main__":
    main()
