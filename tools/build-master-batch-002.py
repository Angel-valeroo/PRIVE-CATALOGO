#!/usr/bin/env python3
from __future__ import annotations

import csv
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "perfumes.json"
CORE_DIR = ROOT / "data" / "core"
BATCH_START = 50
BATCH_SIZE = 100
TODAY = "2026-07-30"


def profile(family, accords, top, heart, base, style, age, *, year=None,
            concentration="Desconocida", intensity="Moderada", use="versatile",
            confidence="medium", note=""):
    return {
        "family": family, "accords": accords, "top": top, "heart": heart, "base": base,
        "style": style, "age": age, "year": year, "concentration": concentration,
        "intensity": intensity, "use": use, "confidence": confidence, "note": note,
    }


P = {}
def add(code, *args, **kwargs):
    P[code] = profile(*args, **kwargs)

# Carolina Herrera — 26
add("CP02324", "Aromática frutal", ["Afrutado","Aromático","Fresco","Cuero"], ["Pera","Cannabis","Jengibre"], ["Geranio","Salvia"], ["Almizcle","Cuero"], "juvenil, urbano y dinámico", (18,38), year=2021, concentration="Eau de Toilette", use="fresh")
add("CP00703", "Amaderada floral almizclada", ["Verde","Cítrico","Aromático","Amaderado"], ["Notas verdes","Toronja","Especias","Bergamota","Lavanda","Petitgrain"], ["Jengibre","Violeta","Gardenia","Salvia"], ["Almizcle","Sándalo","Incienso","Madera de guayaco","Vetiver","Ládano"], "limpio, verde y metropolitano", (22,50), year=1999, concentration="Eau de Toilette", use="fresh")
add("CP02368", "Aromática acuática", ["Acuático","Cítrico","Especiado","Amaderado"], ["Agua de mar","Jengibre","Toronja","Bergamota"], ["Ambroxan","Gardenia","Cardamomo","Cypriol"], ["Sándalo","Pachulí","Almizcle","Palisandro","Vetiver"], "acuático, pulcro y deportivo", (18,42), year=2017, concentration="Eau de Toilette", use="fresh")
add("CP00704", "Cítrica aromática", ["Cítrico","Fresco","Especiado","Almizclado"], ["Bergamota","Toronja"], ["Jengibre","Nuez moscada","Cardamomo","Gardenia"], ["Almizcle"], "fresco, ligero y casual", (18,42), year=2005, concentration="Eau de Toilette", use="fresh", confidence="low", note="Edición On Ice confirmada visualmente; conservar en review por coexistencia de ediciones limitadas.")
add("CP00994", "Ámbar fougère", ["Especiado","Vainilla","Amaderado","Cítrico"], ["Mandarina","Bergamota","Notas verdes"], ["Pimienta","Cardamomo","Notas florales"], ["Vainilla","Madera de guayaco","Sándalo","Almizcle","Ámbar"], "seductor, cálido y nocturno", (22,48), year=2006, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP02253", "Aromática fougère", ["Aromático","Anisado","Vainilla","Especiado"], ["Absenta","Anís","Hinojo"], ["Lavanda"], ["Vaina de vainilla negra","Almizcle"], "dulce, magnético y de fiesta", (20,42), year=2017, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02403", "Aromática amaderada", ["Café","Aromático","Especiado","Amaderado"], ["Toronja","Cardamomo"], ["Lavanda","Absenta"], ["Café","Vetiver"], "oscuro, urbano y nocturno", (22,45), year=2023, concentration="Eau de Parfum", intensity="Intensa", use="night", confidence="medium")
add("CP02502", "Cuero aromática", ["Aromático","Cuero","Amaderado","Especiado"], ["Lavanda silvestre","Romero"], ["Absenta","Cuero saffiano"], ["Vetiver","Pachulí"], "atrevido, vaquero y elegante", (22,48), year=2025, concentration="Eau de Parfum", intensity="Intensa", use="night", confidence="medium")
add("CP02312", "Cuero especiada", ["Especiado","Cuero","Amaderado","Aromático"], ["Pimiento morrón","Jengibre","Cardamomo"], ["Absenta"], ["Cuero","Madera de guayaco"], "intenso, provocador y nocturno", (22,45), year=2020, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02392", "Ámbar especiada", ["Cítrico","Especiado","Vainilla","Almendrado"], ["Naranja sanguina","Neroli de Túnez","Jengibre"], ["Pimienta de Madagascar","Sésamo","Lavanda"], ["Vainilla","Almizcle","Almendra dulce"], "alegre, dulce y llamativo", (18,38), year=2022, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP01063", "Ámbar amaderada", ["Aromático","Dulce","Especiado","Amaderado"], ["Maracuyá","Lima","Pimienta","Jengibre"], ["Vodka","Ginebra","Menta","Especias"], ["Ámbar","Cuero","Notas amaderadas"], "festivo, fresco y carismático", (18,40), year=2011, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP02337", "Aromática fougère", ["Cítrico","Aromático","Especiado","Cuero"], ["Yuzu","Albahaca","Mandarina"], ["Pimienta de Madagascar","Lavanda"], ["Cuero","Haba tonka"], "enérgico, moderno y competitivo", (18,40), year=2021, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP02266", "Ámbar especiada", ["Especiado","Cacao","Dulce","Amaderado"], ["Pimienta negra","Pimienta blanca","Bergamota"], ["Salvia","Cedro"], ["Haba tonka","Cacao","Amberwood"], "atrevido, dulce y contemporáneo", (18,42), year=2019, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP02430", "Ámbar especiada", ["Especiado","Aromático","Cacao","Amaderado"], ["Pimienta blanca","Toronja"], ["Salvia esclarea","Vetiver"], ["Cacao","Haba tonka"], "festivo, elegante y cálido", (20,45), year=2023, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP02492", "Cuero amaderada", ["Aromático","Cuero","Iris","Ahumado"], ["Salvia","Lavanda"], ["Cuero","Iris"], ["Cedro","Incienso"], "profundo, elegante y oscuro", (25,52), year=2025, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP02404", "Ámbar amaderada", ["Cacao","Amaderado","Ahumado","Especiado"], ["Jengibre","Bergamota","Davana"], ["Cacao","Vetiver","Pachulí"], ["Haba tonka","Incienso","Opopónaco","Ládano"], "opulento, oscuro y sensual", (22,48), year=2022, concentration="Eau de Parfum", intensity="Muy intensa", use="night")
add("CP02344", "Cuero aromática", ["Cannabis","Cuero","Especiado","Verde"], ["Cannabis","Toronja"], ["Pimienta negra","Geranio"], ["Cuero","Vetiver"], "rebelde, verde y provocador", (20,42), year=2021, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP01029", "Ámbar especiada", ["Especiado","Cacao","Dulce","Amaderado"], ["Pimienta negra","Pimienta blanca","Bergamota"], ["Salvia","Cedro"], ["Haba tonka","Cacao","Amberwood"], "coleccionable, atrevido y contemporáneo", (18,42), year=2021, concentration="Eau de Toilette", intensity="Intensa", use="night", confidence="medium", note="Edición de botella coleccionista; perfil olfativo vinculado a Bad Boy original.")
add("CP02267", "Ámbar especiada", ["Especiado","Cacao","Café","Aromático"], ["Pimienta rosa","Pimienta negra","Violeta","Cardamomo"], ["Lavanda","Cacao","Café","Piña","Salvia"], ["Haba tonka","Almizcle","Ámbar"], "regio, dulce y sofisticado", (24,48), year=2019, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP00988", "Ámbar especiada", ["Dulce","Cuero","Especiado","Amaderado"], ["Hierba","Bergamota","Toronja"], ["Notas amaderadas","Nuez moscada","Azafrán","Violeta","Jazmín"], ["Azúcar","Cuero","Vainilla","Ante","Ámbar","Madera de cachemira","Sándalo","Musgo","Vetiver"], "dulce, urbano y distinguido", (23,48), year=2009, concentration="Eau de Toilette", intensity="Intensa", use="versatile")
add("CP02130", "Ámbar especiada", ["Cítrico","Especiado","Café","Amaderado"], ["Mandarina","Pimienta rosa"], ["Salvia azul","Pimiento morrón"], ["Madera de cachemira","Café","Cedro del Atlas"], "cálido, aventurero y moderno", (22,45), year=2015, concentration="Eau de Toilette", intensity="Intensa", use="versatile")
add("CP02386", "Cuero amaderada", ["Verde","Especiado","Cuero","Amaderado"], ["Toronja","Hojas de ruibarbo","Hojas de violeta"], ["Pimienta de Sichuan","Angélica"], ["Cuero","Sándalo","Vetiver de Madagascar"], "verde, picante y provocador", (22,48), year=2022, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02151", "Cuero amaderada", ["Whisky","Cuero","Dulce","Especiado"], ["Whisky","Toronja","Pomelo"], ["Cardamomo","Lavanda","Salvia","Tomillo rojo"], ["Cuero","Haba tonka","Benjuí","Notas amaderadas"], "licoroso, íntimo y elegante", (25,50), year=2015, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP00774", "Amaderada especiada", ["Especiado","Fresco","Amaderado","Acuático"], ["Sandía","Cardamomo","Limón","Bergamota","Mandarina"], ["Pimienta","Canela"], ["Sándalo","Haba tonka","Ámbar","Almizcle","Cedro"], "refinado, fresco y carismático", (24,50), year=2003, concentration="Eau de Toilette", use="versatile")
add("CP00844", "Aromática especiada", ["Aromático","Cítrico","Tabaco","Amaderado"], ["Limón","Lavanda","Romero","Neroli"], ["Clavel","Geranio","Tabaco"], ["Sándalo","Cedro","Ámbar gris"], "clásico, varonil y elegante", (30,65), year=1991, concentration="Eau de Toilette", use="classic")
add("CP02126", "Ámbar amaderada", ["Cítrico","Dulce","Marino","Amaderado"], ["Lima","Notas acuáticas","Cítricos"], ["Caviar","Chocolate","Especias"], ["Notas amaderadas","Almizcle"], "festivo, chispeante y juvenil", (18,38), year=2015, concentration="Eau de Toilette", intensity="Intensa", use="night", confidence="low", note="Edición limitada Club Edition; mantener en review para cotejo puntual por clave.")

# Cartier — 3
add("CP00788", "Amaderada especiada", ["Especiado","Amaderado","Cítrico","Aromático"], ["Abedul","Bergamota","Naranja amarga","Mandarina","Cilantro","Alcaravea","Neroli","Artemisia"], ["Cardamomo","Pimienta","Jengibre","Iris","Enebro","Jazmín","Canela"], ["Vetiver","Cedro","Cuero","Té","Ámbar","Musgo de roble"], "intelectual, seco y elegante", (28,65), year=1998, concentration="Eau de Toilette", intensity="Intensa", use="classic")
add("CP00915", "Aromática fougère", ["Aromático","Verde","Amaderado","Especiado"], ["Lavanda","Menta","Alcaravea","Anís","Mandarina"], ["Cilantro","Palisandro"], ["Musgo de roble","Sándalo","Pachulí","Ládano"], "clásico, pulcro y distinguido", (30,65), year=1992, concentration="Eau de Toilette", use="classic")
add("CP00940", "Ámbar amaderada", ["Aromático","Amaderado","Especiado","Cálido"], ["Lavanda","Enebro","Albahaca","Verbena de limón","Bergamota","Neroli"], ["Pimienta","Vetiver","Nuez moscada","Geranio","Romero"], ["Sándalo","Pachulí","Coco","Ámbar","Vainilla","Cedro"], "opulento, clásico y sensual", (30,65), year=1981, concentration="Eau de Toilette", intensity="Intensa", use="classic")

# Chanel — 6
add("CP00718", "Ámbar amaderada", ["Cítrico","Especiado","Amaderado","Vainilla"], ["Limón","Durazno","Jengibre","Mandarina","Lavanda","Bergamota"], ["Pimienta","Cedro","Pachulí","Vetiver","Rosa","Jazmín"], ["Vainilla","Haba tonka","Sándalo","Ámbar","Almizcle","Musgo de roble","Cuero"], "elegante, complejo y versátil", (25,60), year=1999, concentration="Eau de Toilette", use="versatile")
add("CP00719", "Amaderada especiada", ["Cítrico","Acuático","Vainilla","Almizclado"], ["Naranja","Notas marinas","Aldehídos","Mandarina sanguina"], ["Pimienta","Neroli","Cedro"], ["Haba tonka","Vainilla","Almizcle blanco","Ámbar","Vetiver","Elemi"], "deportivo, limpio y sofisticado", (20,55), year=2004, concentration="Eau de Toilette", use="fresh")
add("CP02884", "Amaderada aromática", ["Cítrico","Amaderado","Almizclado","Fresco"], ["Mandarina","Cítricos"], ["Notas amaderadas","Cedro"], ["Almizcle blanco","Ámbar"], "aerodinámico, luminoso y refinado", (22,52), year=2024, concentration="Eau de Parfum", use="fresh", confidence="low", note="Lanzamiento reciente Superleggera; mantener en review por pirámide minimalista y posibles variaciones de publicación.")
add("CP00724", "Amaderada chipre", ["Cuero","Aromático","Musgo","Ahumado"], ["Mirra","Salvia esclarea","Cilantro","Bergamota","Lima"], ["Rosa","Tomillo","Albahaca","Jazmín"], ["Castóreo","Musgo de roble","Pachulí","Ládano"], "potente, clásico y dominante", (32,70), year=1981, concentration="Eau de Toilette", intensity="Muy intensa", use="classic")
add("CP01059", "Amaderada aromática", ["Cítrico","Amaderado","Ahumado","Especiado"], ["Toronja","Limón","Menta","Pimienta rosa","Bergamota","Aldehídos","Cilantro"], ["Jengibre","Jazmín","Nuez moscada","Melón"], ["Incienso","Ámbar","Cedro","Sándalo","Pachulí","Ládano"], "pulido, magnético y muy versátil", (22,60), year=2014, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP00803", "Amaderada floral almizclada", ["Aromático","Verde","Amaderado","Fresco"], ["Lavanda","Romero","Neroli","Petitgrain"], ["Geranio","Salvia esclarea","Gálbano","Jazmín"], ["Musgo de roble","Vetiver","Cedro","Sándalo","Ámbar"], "metálico, limpio y ejecutivo", (27,62), year=1993, concentration="Eau de Toilette", use="classic")

# Clinique / Coach / CR7 — 5
add("CP00840", "Cítrica aromática", ["Cítrico","Verde","Acuático","Amaderado"], ["Lima","Notas verdes","Mandarina","Limón","Notas marinas"], ["Fresia","Jazmín","Rosa","Muguete"], ["Ciprés","Almizcle","Madera de guayaco","Cedro"], "optimista, fresco y fácil de usar", (18,50), year=1999, concentration="Eau de Toilette", use="fresh")
add("CP02355", "Aromática especiada", ["Cítrico","Ozónico","Especiado","Amaderado"], ["Lima","Absenta"], ["Notas ozónicas","Pimienta negra","Cedro"], ["Ámbar","Sándalo"], "casual, limpio y moderno", (18,45), year=2020, concentration="Eau de Toilette", use="fresh")
add("CP02441", "Aromática frutal", ["Afrutado","Aromático","Especiado","Amaderado"], ["Longan","Toronja","Laurel"], ["Hojas de violeta","Geranio","Nuez moscada"], ["Vainilla","Haba tonka","Amberwood"], "seguro, juvenil y energético", (18,40), year=2023, concentration="Eau de Toilette", use="versatile", confidence="low")
add("CP02261", "Aromática acuática", ["Cítrico","Acuático","Aromático","Almizclado"], ["Mandarina","Pera","Bergamota"], ["Lavanda","Cardamomo","Notas marinas"], ["Haba tonka","Amberwood","Almizcle"], "refrescante, desenfadado y deportivo", (16,38), year=2019, concentration="Eau de Toilette", use="fresh", confidence="low")
add("CP02138", "Amaderada aromática", ["Aromático","Especiado","Amaderado","Afrutado"], ["Bergamota","Manzana verde","Canela"], ["Lavanda","Romero","Iris"], ["Cedro","Ámbar","Pachulí"], "masculino, sobrio y accesible", (22,50), year=2015, concentration="Eau de Toilette", use="versatile", confidence="low", note="La imagen corresponde a Legacy original; no confundir con Legacy EDP 2025.")

# Creed — 5
add("CP02471", "Chipre frutal", ["Cítrico","Especiado","Amaderado","Afrutado"], ["Toronja","Bergamota","Grosella negra"], ["Jengibre","Canela","Cidra","Cardamomo"], ["Pimienta rosa","Pachulí","Vetiver"], "intenso, lujoso y especiado", (25,55), year=2023, concentration="Eau de Parfum", intensity="Muy intensa", use="versatile")
add("CP02269", "Chipre frutal", ["Afrutado","Ahumado","Amaderado","Cítrico"], ["Piña","Bergamota","Grosella negra","Manzana"], ["Abedul","Pachulí","Jazmín de Marruecos","Rosa"], ["Almizcle","Musgo de roble","Ámbar gris","Vainilla"], "seguro, triunfante y versátil", (23,60), year=2010, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP02387", "Almizcle floral amaderado", ["Verde","Aromático","Fresco","Amaderado"], ["Verbena de limón","Iris"], ["Hojas de violeta"], ["Ámbar gris","Sándalo"], "verde, distinguido y atemporal", (25,65), year=1985, concentration="Eau de Parfum", use="classic")
add("CP02326", "Almizcle floral amaderado", ["Marino","Salado","Afrutado","Cítrico"], ["Sal marina","Notas afrutadas"], ["Limón siciliano","Bergamota","Iris","Mandarina"], ["Notas marinas","Almizcle","Notas amaderadas"], "luminoso, salino y lujoso", (22,58), year=1995, concentration="Eau de Parfum", use="fresh")
add("CP02327", "Amaderada aromática", ["Aromático","Especiado","Verde","Amaderado"], ["Pimienta rosa","Menta","Bergamota","Limón","Absenta","Naranja"], ["Lavanda","Rosa búlgara","Iris","Jazmín"], ["Vetiver","Cedro","Almizcle","Haba tonka"], "enérgico, clásico y audaz", (28,62), year=2017, concentration="Eau de Parfum", intensity="Intensa", use="versatile")

# David Beckham / Davidoff — 4
add("CP02288", "Amaderada especiada", ["Afrutado","Aromático","Amaderado","Especiado"], ["Manzana","Mandarina","Tomillo"], ["Lavanda","Piña","Hojas de violeta"], ["Ámbar","Ante","Cedro"], "casual, moderno y urbano", (18,42), year=2013, concentration="Eau de Toilette", use="versatile", confidence="low")
add("CP02496", "Aromática verde", ["Verde","Aromático","Amaderado","Fresco"], ["Romero"], ["Gálbano"], ["Vetiver de Haití"], "minimalista, verde y revitalizante", (22,55), year=2022, concentration="Eau de Parfum", use="fresh")
add("CP00783", "Aromática acuática", ["Acuático","Verde","Aromático","Fresco"], ["Agua de mar","Lavanda","Menta","Notas verdes","Romero","Calone","Cilantro"], ["Sándalo","Neroli","Geranio","Jazmín"], ["Almizcle","Tabaco","Musgo de roble","Cedro","Ámbar"], "marino, clásico y refrescante", (18,58), year=1988, concentration="Eau de Toilette", use="fresh")
add("CP00802", "Amaderada especiada", ["Ozónico","Especiado","Amaderado","Almizclado"], ["Vodka","Enebro","Toronja"], ["Pimiento","Nuez moscada","Violeta"], ["Almizcle","Sándalo","Ámbar"], "metálico, urbano y nocturno", (20,45), year=2003, concentration="Eau de Toilette", use="versatile", confidence="medium")

# Diesel — 4
add("CP02314", "Amaderada aromática", ["Tabaco","Aromático","Especiado","Cuero"], ["Lavanda","Bergamota","Cardamomo","Hojas de violeta"], ["Caviar","Iris","Salvia"], ["Tabaco","Notas amaderadas","Haba tonka","Pachulí"], "rebelde, salado y nocturno", (20,45), year=2016, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP02465", "Aromática amaderada", ["Cítrico","Aromático","Amaderado","Fresco"], ["Toronja","Naranja sanguina"], ["Lavanda","Salvia"], ["Sándalo","Amberwood"], "vibrante, directo y moderno", (18,42), year=2024, concentration="Eau de Parfum", use="versatile", confidence="low")
add("CP01404", "Aromática fougère", ["Afrutado","Especiado","Dulce","Amaderado"], ["Anís","Toronja"], ["Frambuesa","Lavanda"], ["Heliotropo","Notas amaderadas"], "coqueto, dulce y nocturno", (18,40), year=2007, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP02366", "Ámbar amaderada", ["Dulce","Especiado","Floral","Amaderado"], ["Naranja","Bergamota","Palma","Heliotropo"], ["Notas verdes","Jazmín","Abedul","Muguete","Violeta","Salvia"], ["Canela","Haba tonka","Sándalo","Almizcle","Pachulí"], "cremoso, peculiar y juvenil", (18,42), year=1997, concentration="Eau de Toilette", intensity="Intensa", use="versatile")

# Dior — 7
add("CP02289", "Almizcle floral amaderado", ["Iris","Atalcado","Amaderado","Dulce"], ["Lavanda"], ["Iris","Ambreta","Pera"], ["Cedro de Virginia","Vetiver"], "elegante, empolvado y nocturno", (25,55), year=2011, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02520", "Cuero floral", ["Iris","Cuero","Amaderado","Ahumado"], ["Naranja de Italia"], ["Iris de Toscana","Rosa"], ["Cuero","Sándalo","Ambreta","Cedro","Oud"], "opulento, formal y sofisticado", (30,65), year=2014, concentration="Parfum", intensity="Muy intensa", use="classic")
add("CP01005", "Amaderada aromática", ["Cítrico","Especiado","Iris","Amaderado"], ["Cidra","Jengibre","Bergamota"], ["Iris"], ["Cedro"], "nítido, elegante y deportivo", (20,50), year=2012, concentration="Eau de Toilette", use="fresh")
add("CP02408", "Amaderada aromática", ["Cítrico","Especiado","Amaderado","Fresco"], ["Naranja sanguina","Toronja","Limón"], ["Pimienta rosa","Nuez moscada"], ["Sándalo","Vetiver"], "chispeante, pulcro y activo", (20,50), year=2017, concentration="Eau de Toilette", use="fresh")
add("CP00815", "Aromática fougère", ["Cuero","Violeta","Ozónico","Amaderado"], ["Flor de nuez moscada","Lavanda","Cedro","Mandarina","Manzanilla","Bergamota","Limón"], ["Hojas de violeta","Nuez moscada","Cedro","Sándalo","Madreselva","Clavel","Jazmín","Muguete"], ["Cuero","Vetiver","Almizcle","Ámbar","Pachulí","Haba tonka"], "inconfundible, mineral y clásico", (28,65), year=1988, concentration="Eau de Toilette", intensity="Intensa", use="classic")
add("CP02158", "Aromática fougère", ["Cítrico","Especiado","Ambroxan","Aromático"], ["Bergamota de Calabria","Pimienta"], ["Pimienta de Sichuan","Lavanda","Pimienta rosa","Vetiver","Pachulí","Geranio","Elemi"], ["Ambroxan","Cedro","Ládano"], "potente, fresco y seguro", (18,55), year=2015, concentration="Eau de Toilette", intensity="Intensa", use="versatile")
add("CP02341", "Aromática especiada", ["Especiado","Canela","Lavanda","Amaderado"], ["Nuez moscada","Canela","Cardamomo","Toronja"], ["Lavanda"], ["Regaliz","Sándalo","Ámbar","Pachulí","Vetiver de Haití"], "concentrado, oscuro y dominante", (25,60), year=2021, concentration="Parfum", intensity="Muy intensa", use="night")

# Dolce & Gabbana — 6
add("CP00795", "Aromática fougère", ["Cítrico","Aromático","Tabaco","Especiado"], ["Cítricos","Bergamota","Neroli","Mandarina"], ["Lavanda","Salvia","Pimienta"], ["Tabaco","Haba tonka","Cedro"], "mediterráneo, pulcro y clásico", (25,60), year=2012, concentration="Eau de Toilette", use="versatile")
add("CP02328", "Amaderada aromática", ["Aromático","Cítrico","Especiado","Amaderado"], ["Naranja sanguina","Limón siciliano","Enebro","Cítricos"], ["Pimiento morrón","Lavanda","Salvia esclarea","Geranio"], ["Vetiver","Cedro","Pachulí"], "carismático, fresco y mediterráneo", (20,50), year=2019, concentration="Eau de Toilette", use="versatile")
add("CP00881", "Cítrica aromática", ["Cítrico","Aromático","Acuático","Amaderado"], ["Toronja","Bergamota","Mandarina siciliana","Enebro"], ["Pimienta","Romero","Palisandro"], ["Almizcle","Incienso","Musgo de roble"], "veraniego, limpio y relajado", (18,52), year=2001, concentration="Eau de Toilette", use="fresh")
add("CP01031", "Ámbar amaderada", ["Tabaco","Especiado","Ámbar","Cítrico"], ["Toronja","Cilantro","Albahaca"], ["Cardamomo","Jengibre","Flor de azahar"], ["Ámbar","Tabaco","Cedro"], "íntimo, elegante y seductor", (24,55), year=2008, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP02378", "Aromática especiada", ["Cítrico","Especiado","Amaderado","Ámbar"], ["Naranja sanguina","Jengibre","Bergamota siciliana"], ["Salvia esclarea","Lavanda","Cardamomo"], ["Amberwood","Pachulí","Vetiver"], "luminoso, lujoso y moderno", (23,52), year=2021, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP02113", "Amaderada aromática", ["Acuático","Aromático","Amaderado","Especiado"], ["Notas acuáticas","Romero"], ["Cardamomo","Secuoya"], ["Almizcle","Pachulí"], "deportivo, limpio y sobrio", (20,48), year=2012, concentration="Eau de Toilette", use="fresh")

# Misceláneos — 9
add("CP01020", "Cítrica aromática", ["Cítrico","Especiado","Verde","Amaderado"], ["Mandarina","Bergamota","Cardamomo"], ["Violeta","Ciprés","Salvia"], ["Almizcle","Cedro","Vetiver","Oud"], "juvenil, chispeante y aventurero", (18,40), year=2008, concentration="Eau de Toilette", use="versatile")
add("CP00966", "Aromática especiada", ["Cítrico","Afrutado","Aromático","Amaderado"], ["Toronja","Naranja","Manzana verde"], ["Tomillo","Lavanda"], ["Vetiver","Pachulí","Haba tonka"], "claro, casual y masculino", (20,48), year=2008, concentration="Eau de Toilette", use="versatile", confidence="low")
add("CP00809", "Cuero", ["Cuero","Aromático","Amaderado","Cítrico"], ["Bergamota","Naranja","Limón"], ["Cuero","Miel","Romero"], ["Musgo de roble","Cedro","Almizcle","Vetiver"], "tradicional, robusto y varonil", (35,75), year=1949, concentration="Cologne", intensity="Intensa", use="classic")
add("CP02149", "Amaderada especiada", ["Especiado","Cítrico","Cuero","Amaderado"], ["Mandarina","Limón","Hojas de violeta"], ["Pimienta negra","Azafrán","Pomarose"], ["Haba tonka","Cedro","Ante"], "energético, juvenil y seductor", (18,42), year=2014, concentration="Eau de Toilette", use="night")
add("CP00985", "Amaderada especiada", ["Cítrico","Iris","Amaderado","Aromático"], ["Bergamota","Romero"], ["Iris","Nuez moscada"], ["Pachulí","Musgo de roble"], "minimalista, ejecutivo y limpio", (24,55), year=2005, concentration="Eau de Toilette", use="versatile")
add("CP00817", "Aromática fougère", ["Afrutado","Dulce","Especiado","Amaderado"], ["Manzana","Ciruela","Lima","Bergamota"], ["Canela","Cardamomo","Rosa","Jazmín"], ["Vainilla","Ámbar","Cedro","Almizcle"], "dulce, accesible y nocturno", (18,42), year=1999, concentration="Eau de Toilette", use="night")
add("CP02214", "Cítrica aromática", ["Cítrico","Aromático","Verde","Amaderado"], ["Limón","Bergamota","Mandarina"], ["Salvia","Hojas de violeta","Nuez moscada"], ["Cedro","Almizcle"], "brillante, casual y deportivo", (18,42), year=1997, concentration="Eau de Toilette", use="fresh", confidence="low", note="Ferrari Yellow requiere cotejo visual y por clave por registros públicos limitados.")
add("CP02155", "Cítrica aromática", ["Cítrico","Aromático","Especiado","Amaderado"], ["Bergamota","Verbena de limón","Naranja","Menta","Gálbano","Petitgrain"], ["Jazmín","Geranio","Nuez moscada","Iris"], ["Cedro","Sándalo","Musgo","Vainilla"], "deportivo, vibrante y clásico", (18,48), year=2010, concentration="Eau de Toilette", use="fresh")
add("CP02449", "Ámbar especiada", ["Especiado","Cuero","Amaderado","Ahumado"], ["Jengibre","Bergamota","Mandarina","Angélica","Nuez moscada"], ["Cuero","Vetiver"], ["Incienso","Ámbar","Almizcle"], "crudo, intenso y sofisticado", (28,60), year=2022, concentration="Eau de Parfum", intensity="Muy intensa", use="classic")

# Givenchy — 5
add("CP02409", "Amaderada aromática", ["Iris","Dulce","Cuero","Aromático"], ["Pera","Cardamomo","Piña"], ["Iris","Lavanda","Geranio"], ["Cuero","Vainilla negra","Pachulí"], "elegante, dulce y moderno", (24,52), year=2017, concentration="Eau de Toilette", intensity="Intensa", use="versatile")
add("CP02419", "Amaderada aromática", ["Amaderado","Aromático","Floral","Vainilla"], ["Cardamomo","Salvia"], ["Narciso francés","Vetiver de Haití","Vetiver de Madagascar"], ["Vainilla","Palo santo","Cedro"], "contemporáneo, pulido y distintivo", (24,55), year=2023, concentration="Eau de Parfum", intensity="Intensa", use="versatile")
add("CP01087", "Amaderada aromática", ["Especiado","Amaderado","Aromático","Ahumado"], ["Pimienta rosa","Mandarina","Hojas de abedul","Nuez moscada","Bergamota"], ["Cedro","Pachulí","Vetiver"], ["Incienso","Almizcle"], "discreto, ejecutivo y masculino", (25,58), year=2013, concentration="Eau de Toilette", use="versatile")
add("CP00748", "Amaderada especiada", ["Cítrico","Especiado","Aromático","Amaderado"], ["Toronja","Mandarina","Violeta","Cilantro"], ["Lavanda","Vetiver"], ["Cedro","Ládano"], "elegante, luminoso y sobrio", (24,55), year=2002, concentration="Eau de Toilette", use="versatile")
add("CP00967", "Ámbar fougère", ["Aromático","Café","Avellanado","Amaderado"], ["Menta","Toronja"], ["Café","Sésamo"], ["Avellana","Cedro"], "peculiar, cálido y sensual", (22,48), year=2005, concentration="Eau de Toilette", intensity="Intensa", use="night")

# Gucci / Guerlain / Guy Laroche — 5
add("CP02150", "Aromática fougère", ["Aromático","Verde","Floral","Amaderado"], ["Lavanda","Cilantro"], ["Notas verdes","Flor de azahar","Neroli"], ["Cedro","Pachulí"], "oscuro, limpio y seductor", (20,48), year=2013, concentration="Eau de Toilette", use="night")
add("CP01055", "Ámbar amaderada", ["Aromático","Amaderado","Especiado","Floral"], ["Enebro","Limón","Lavanda"], ["Flor de azahar","Nuez moscada","Ládano"], ["Pachulí","Maderas secas","Almizcle"], "profundo, pulido y formal", (25,55), year=2022, concentration="Parfum", intensity="Intensa", use="versatile")
add("CP02445", "Ámbar floral", ["Floral","Vainilla","Especiado","Atalcado"], ["Flor de azahar","Nuez moscada","Pimiento morrón"], ["Iris","Osmanto","Flor de azahar"], ["Vainilla","Ambrofix","Benjuí","Pachulí"], "opulento, cremoso y magnético", (25,58), year=2023, concentration="Parfum", intensity="Muy intensa", use="night")
add("CP00974", "Amaderada aromática", ["Vetiver","Cítrico","Tabaco","Verde"], ["Bergamota","Tabaco","Limón","Nuez moscada","Cilantro","Mandarina","Neroli"], ["Vetiver","Pimienta","Clavel","Salvia","Iris"], ["Vetiver","Musgo de roble","Cuero","Mirra","Haba tonka","Ámbar"], "terroso, elegante y atemporal", (30,70), year=1959, concentration="Eau de Toilette", use="classic")
add("CP00796", "Aromática fougère", ["Aromático","Verde","Especiado","Amaderado"], ["Lavanda","Limón","Bergamota","Romero","Menta","Albahaca","Verbena","Artemisia"], ["Enebro","Cilantro","Canela","Clavel","Angélica","Jazmín"], ["Musgo de roble","Cuero","Pino","Sándalo","Vetiver","Cedro","Ámbar","Pachulí"], "barbería, potente y clásico", (28,65), year=1982, concentration="Eau de Toilette", intensity="Intensa", use="classic")

# Halloween / Halston — 4
add("CP01079", "Ámbar especiada", ["Dulce","Especiado","Aromático","Cuero"], ["Martini","Mandarina","Hojas de violeta","Albahaca"], ["Canela","Lavanda","Jengibre","Flor de azahar"], ["Vainilla","Ámbar","Almizcle","Cuero"], "juvenil, dulce y de fiesta", (18,38), year=2012, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP02120", "Amaderada especiada", ["Cítrico","Especiado","Aromático","Amaderado"], ["Limón","Cardamomo","Pimienta rosa","Bambú"], ["Manzana roja","Lavanda","Romero"], ["Almizcle","Sándalo","Musgo"], "eléctrico, casual y juvenil", (18,40), year=2014, concentration="Eau de Toilette", use="versatile")
add("CP02264", "Ámbar fougère", ["Café","Whisky","Especiado","Ámbar"], ["Café","Cardamomo","Limón"], ["Whisky","Canela","Cuero","Notas minerales"], ["Ámbar","Incienso","Haba tonka"], "adictivo, nocturno y moderno", (20,45), year=2019, concentration="Eau de Toilette", intensity="Intensa", use="night")
add("CP00839", "Cuero", ["Aromático","Cuero","Amaderado","Musgo"], ["Ciprés","Limón","Bergamota","Notas verdes","Albahaca","Gardenia"], ["Canela","Vetiver","Cedro","Pachulí","Geranio","Jazmín","Cilantro"], ["Cuero","Musgo de roble","Benjuí","Almizcle","Ámbar","Haba tonka"], "seco, clásico y robusto", (35,75), year=1976, concentration="Cologne", intensity="Intensa", use="classic")

# Hermès / Hollister — 3
add("CP02396", "Aromática verde", ["Verde","Aromático","Metálico","Floral"], ["Salvia esclarea"], ["Narciso","Palisandro"], ["Sclarene"], "minimalista, limpio y futurista", (22,55), year=2021, concentration="Eau de Toilette", use="fresh")
add("CP02226", "Amaderada especiada", ["Cítrico","Amaderado","Terroso","Especiado"], ["Naranja","Toronja"], ["Pimienta","Geranio"], ["Vetiver","Cedro","Pachulí","Benjuí"], "mineral, elegante y sobrio", (27,65), year=2006, concentration="Eau de Toilette", intensity="Intensa", use="versatile")
add("CP01407", "Aromática acuática", ["Cítrico","Acuático","Afrutado","Amaderado"], ["Cítricos","Manzana"], ["Notas acuáticas","Aromáticas"], ["Ámbar","Almizcle","Notas amaderadas"], "joven, casual y playero", (15,32), concentration="Cologne", use="fresh", confidence="low", note="Jake de Hollister tiene información pública fragmentada; cotejar botella y clave antes de verificar.")

# Hugo Boss — 8
add("CP02279", "Amaderada aromática", ["Afrutado","Especiado","Amaderado","Ahumado"], ["Manzana","Ciruela","Bergamota"], ["Canela","Madera de cachemira"], ["Madera de olivo","Cedro","Sándalo"], "oscuro, refinado y masculino", (24,52), year=2019, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02440", "Ámbar especiada", ["Incienso","Amaderado","Especiado","Ámbar"], ["Incienso","Cardamomo"], ["Vetiver","Pachulí"], ["Cedro","Ládano"], "denso, resinoso y majestuoso", (28,60), year=2023, concentration="Parfum", intensity="Muy intensa", use="classic")
add("CP02268", "Amaderada aromática", ["Afrutado","Aromático","Especiado","Amaderado"], ["Manzana","Canela","Mandarina","Salvia"], ["Lavanda","Pachulí","Romero"], ["Sándalo","Olivo"], "motivador, limpio y profesional", (22,52), year=2019, concentration="Eau de Parfum", use="versatile")
add("CP02129", "Amaderada especiada", ["Afrutado","Canela","Vainilla","Amaderado"], ["Manzana","Flor de azahar"], ["Canela","Clavo","Geranio"], ["Vainilla","Sándalo","Cedro","Vetiver"], "cálido, dulce y seguro", (22,52), year=2015, concentration="Eau de Parfum", intensity="Intensa", use="night")
add("CP02380", "Amaderada aromática", ["Acuático","Afrutado","Aromático","Amaderado"], ["Manzana helada","Menta"], ["Canela","Salvia esclarea"], ["Madera de cachemira","Pachulí"], "marino, juvenil y pulcro", (18,42), year=2022, concentration="Eau de Toilette", use="fresh")
add("CP01045", "Amaderada aromática", ["Aromático","Violeta","Amaderado","Almizclado"], ["Lavanda","Abedul"], ["Violeta"], ["Almizcle","Notas amaderadas"], "misterioso, limpio y nocturno", (20,48), year=2010, concentration="Eau de Toilette", use="night")
add("CP02203", "Amaderada especiada", ["Cítrico","Afrutado","Especiado","Amaderado"], ["Manzana","Naranja amarga","Toronja","Limón"], ["Jengibre","Canela","Geranio","Clavo"], ["Vetiver","Notas amaderadas"], "ligero, profesional y refrescante", (20,50), year=2017, concentration="Eau de Toilette", use="fresh")
add("CP02340", "Amaderada aromática", ["Afrutado","Aromático","Amaderado","Cítrico"], ["Naranja sanguina","Manzana"], ["Lavanda","Salvia"], ["Vetiver","Notas amaderadas"], "optimista, urbano y versátil", (20,50), year=2021, concentration="Eau de Parfum", use="versatile", confidence="low", note="Conservar en review para confirmar que la clave corresponde a United Eau de Parfum y no a la EDT previa.")

USE_PRESETS = {
    "fresh": {
        "occasions": ["Día","Diario","Oficina","Viaje","Playa"],
        "contexts": ["Casual","Profesional","Vacaciones"],
        "climates": ["Calor","Templado"], "seasons": ["Primavera","Verano"],
        "dayParts": ["Mañana","Tarde"],
    },
    "night": {
        "occasions": ["Noche","Cita","Fiesta","Evento"],
        "contexts": ["Romántico","Social","Especial"],
        "climates": ["Frío","Templado"], "seasons": ["Otoño","Invierno"],
        "dayParts": ["Tarde","Noche"],
    },
    "classic": {
        "occasions": ["Día","Noche","Oficina","Evento"],
        "contexts": ["Profesional","Formal","Especial"],
        "climates": ["Templado","Frío"], "seasons": ["Otoño","Invierno","Primavera"],
        "dayParts": ["Mañana","Tarde","Noche"],
    },
    "versatile": {
        "occasions": ["Día","Noche","Diario","Oficina","Cita"],
        "contexts": ["Casual","Profesional","Social"],
        "climates": ["Templado","Calor","Frío"], "seasons": ["Primavera","Otoño","Verano"],
        "dayParts": ["Mañana","Tarde","Noche"],
    },
}

NOTE_TRAITS = {
    "freshness": ["bergamota","limón","lima","mandarina","toronja","menta","mar","acuát","ozón","verde","romero","lavanda"],
    "sweetness": ["vainilla","caramelo","azúcar","haba tonka","miel","cacao","chocolate","frut","manzana","pera","piña","ciruela"],
    "warmth": ["ámbar","canela","tabaco","whisky","ron","benjuí","incienso","vainilla","cuero","oud","cacao"],
    "woodiness": ["cedro","sándalo","vetiver","pachulí","guayaco","palisandro","abedul","madera","oud","ciprés"],
    "spiciness": ["pimienta","cardamomo","canela","nuez moscada","azafrán","cilantro","anís","jengibre","clavo","especia"],
    "floral": ["rosa","jazmín","iris","geranio","lavanda","flor de azahar","gardenia","violeta","muguete","narciso"],
    "citrus": ["bergamota","limón","mandarina","toronja","naranja","lima","cítrico","petitgrain","neroli"],
    "fruitiness": ["manzana","piña","melón","pera","grosella","frambuesa","mango","ciruela","frut","maracuyá","durazno"],
    "aquatic": ["mar","acuát","calone","sal","ozón","agua"],
    "powdery": ["iris","heliotropo","violeta","almizcle","haba tonka","atalcado"],
    "smoky": ["incienso","tabaco","abedul","humo","mirra","lábdano","ládano"],
    "leathery": ["cuero","ante","castóreo"],
}


def sensory(notes, accords):
    haystack = " ".join(notes + accords).lower()
    out = {}
    for trait, words in NOTE_TRAITS.items():
        hits = sum(1 for word in words if word in haystack)
        out[trait] = min(5, hits * 2 if hits < 3 else 5)
    return out


def description_for(p):
    lead = ", ".join(p["accords"][:3]).lower()
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


def make_core(item, p):
    use = USE_PRESETS[p["use"]]
    all_notes = p["top"] + p["heart"] + p["base"]
    confidence = p["confidence"]
    note = p["note"] or "Identidad contrastada por nombre e imagen; clave conservada para búsqueda exacta en Perfumoteca."
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
            "family": p["family"], "subfamily": None, "accords": p["accords"],
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
        "sensoryProfile": sensory(all_notes, p["accords"]),
        "recommendation": {
            "occasions": use["occasions"], "contexts": use["contexts"], "climates": use["climates"],
            "seasons": use["seasons"], "dayParts": use["dayParts"],
            "formality": 4 if "Formal" in use["contexts"] else 3 if "Profesional" in use["contexts"] else 2,
            "versatility": 5 if p["use"] == "versatile" else 4 if p["use"] == "fresh" else 3,
            "distinctiveness": 4 if any(x in " ".join(p["accords"] + all_notes) for x in ["Oud","Incienso","Cuero","Tabaco","Whisky","Café","Cacao"]) else 3,
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
            "lastReviewedAt": TODAY, "reviewedBy": "PRIVÉ — Base Maestra Lote 002",
            "confidence": confidence,
            "sources": [
                {"type": "internal", "title": "Catálogo operativo PRIVÉ — nombre, imagen, categoría y clave", "url": None, "accessedAt": TODAY, "supports": ["identity"]},
                {"type": "community", "title": "Fragrantica — nombre, versión, imagen y contraste olfativo", "url": fragrantica_url(item), "accessedAt": TODAY, "supports": ["identity","classification","olfactory"]},
                {"type": "editorial", "title": f"Perfumoteca — búsqueda exacta por clave {item['code']}", "url": "https://perfumoteca.com/catalogo", "accessedAt": TODAY, "supports": ["identity","olfactory"]},
            ],
            "notes": ("Lote maestro 002. Fragrantica y Perfumoteca se registran como fuentes principales complementarias: "
                      "Fragrantica conserva nombre/versión/imagen; Perfumoteca se consulta por clave y representa la referencia "
                      "olfativa usada por proveedor y pedidos PRIVÉ. " + note + " La ficha permanece en review; no se inventan "
                      "datos ante diferencias. La edad es orientativa y nunca restrictiva."),
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
            "status": "review", "confidence": p["confidence"], "review_notes": p["note"],
        })

    manifest_path = CORE_DIR / "catalog.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    first_batch = manifest["batches"][0]
    first_files = manifest["perfumes"][:50]
    manifest.update({
        "schemaVersion": "1.0.0", "batchSize": 50, "activeBatchSize": BATCH_SIZE, "activeBatch": 2,
        "reviewPolicy": "Regla general: lotes de 50 fragancias. El lote 002 es una ampliación autorizada de 100; se valida antes de activar el siguiente.",
        "sourcePolicy": "Fragrantica y Perfumoteca son fuentes principales complementarias. Nombre/versión/imagen desde Fragrantica; clave y referencia olfativa del proveedor desde Perfumoteca.",
        "agePolicy": "La edad es una tendencia orientativa y secundaria; nunca una restricción.",
        "batches": [first_batch, {"id": "batch-002", "status": "review", "createdAt": TODAY, "count": len(new_filenames), "codes": [item["code"] for item in batch]}],
        "perfumes": first_files + new_filenames,
    })
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    review_path = CORE_DIR / "review-batch-002.csv"
    with review_path.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(review_rows[0]))
        writer.writeheader(); writer.writerows(review_rows)

    print(f"Generadas {len(new_filenames)} fichas Core en lote 002; total activo={len(manifest['perfumes'])}")


if __name__ == "__main__":
    main()
