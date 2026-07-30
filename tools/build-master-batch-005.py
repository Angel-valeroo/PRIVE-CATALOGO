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
BATCH_START = 350
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
def add(code, family, top, heart, base, style, age=(18,48), **kw):
    P[code] = profile(family, top, heart, base, style, age, **kw)

# 351–354 · CAROLINA HERRERA
add("DP02556","Ámbar floral",["Almendra","Café","Bergamota","Limón"],["Tuberosa","Jazmín sambac","Flor de azahar","Rosa","Iris"],["Haba tonka","Cacao","Vainilla","Praliné","Sándalo","Almizcle","Ámbar","Canela","Pachulí","Cedro"],"gourmand, floral y aterciopelado",(20,48),year=2018,concentration="Eau de Parfum",intensity="Muy intensa",use="night",note="Velvet Fatale es edición de colección de Good Girl; conserva el perfil del jugo original.")
add("DP02884","Floral frutal",["Pitahaya"],["Peonía roja","Frangipani"],["Vainilla","Pachulí"],"tropical, floral y expansivo",(18,44),year=2025,concentration="Eau de Parfum",intensity="Intensa",use="versatile",confidence="medium",note="Lanzamiento reciente; pirámide contrastada con comunicación oficial y fuentes especializadas.")
add("DP02598","Floral frutal",["Lichi","Grosella roja"],["Rosa"],["Vainilla","Vetiver"],"rosado, frutal y elegante",(18,45),year=2021,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02733","Floral frutal",["Cereza ácida","Almendra amarga"],["Rosa","Lirio"],["Vainilla bourbon","Vetiver"],"cereza, rosado y glamuroso",(18,44),year=2022,concentration="Parfum",intensity="Muy intensa",use="night")
# 355–361 · CHANEL
add("DP01054","Chipre floral",["Pimienta rosa","Mandarina","Piña"],["Jazmín","Iris","Jacinto"],["Pachulí","Almizcle","Vainilla","Vetiver"],"elegante, limpio y sofisticado",(22,58),year=2005,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02620","Chipre floral",["Cidra","Limón"],["Jacinto de agua","Jazmín","Pimienta rosa"],["Teca","Iris","Ámbar","Pachulí","Almizcle"],"cítrico, verde y chispeante",(18,48),year=2007,concentration="Eau de Toilette",use="fresh")
add("DP02622","Floral frutal",["Membrillo","Toronja"],["Jacinto","Jazmín"],["Almizcle","Iris","Cedro","Ámbar"],"delicado, frutal y luminoso",(16,45),year=2010,concentration="Eau de Toilette",use="fresh")
add("DP01057","Floral aldehídica",["Aldehídos","Ylang-ylang","Neroli","Bergamota","Durazno"],["Iris","Jazmín","Rosa","Muguete"],["Sándalo","Vainilla","Musgo de roble","Vetiver","Pachulí"],"clásico, empolvado y elegante",(28,68),year=1986,concentration="Eau de Parfum",intensity="Intensa",use="classic")
add("DP01068","Ámbar especiada",["Cilantro","Mandarina","Durazno","Jazmín","Rosa búlgara"],["Clavo","Mimosa","Flor de azahar","Trébol","Rosa"],["Ámbar","Sándalo","Haba tonka","Vainilla","Opopónaco","Civeta"],"cálido, especiado y opulento",(26,62),year=1984,concentration="Eau de Parfum",intensity="Muy intensa",use="classic")
add("DO01067","Ámbar floral",["Naranja","Mandarina","Bergamota","Flor de azahar"],["Rosa turca","Jazmín","Mimosa","Ylang-ylang"],["Pachulí","Almizcle blanco","Vainilla","Vetiver","Haba tonka"],"cítrico, elegante y sensual",(20,55),year=2001,concentration="Eau de Parfum",intensity="Intensa",use="versatile",note="La clave aparece como DO01067 en el catálogo operativo; se conserva sin alterarla.")
add("DP02444","Floral",["Toronja","Mandarina","Casis"],["Flor de azahar","Ylang-ylang","Jazmín","Tuberosa","Muguete","Pera","Pimienta rosa"],["Almizcle","Sándalo","Cachemira","Iris"],"floral, solar y refinado",(20,52),year=2017,concentration="Eau de Parfum",use="versatile")
# 362–374
add("DP02559","Ámbar floral",["Pera","Bergamota"],["Jazmín sambac","Magnolia"],["Haba tonka","Vainilla"],"cálido, dulce y cremoso",(18,42),year=2020,concentration="Eau de Parfum",use="versatile")
add("DP01073","Floral acuática",["Melón","Loto","Limón","Piña","Membrillo","Calone","Casis"],["Loto","Nenúfar","Muguete","Jazmín","Miel","Rosa"],["Almizcle","Vetiver","Frambuesa","Mora","Raíz de violeta","Durazno","Sándalo","Vainilla"],"acuático, fresco y limpio",(16,48),year=1996,use="fresh")
add("DP01163","Ámbar vainilla",["Coco","Ciruela","Chabacano"],["Palisandro","Jazmín","Alcaravea","Tuberosa","Rosa","Muguete"],["Vainilla","Almendra","Sándalo","Almizcle"],"dulce, almendrado y misterioso",(20,52),year=1998,concentration="Eau de Toilette",intensity="Muy intensa",use="night")
add("DP01176","Floral frutal",["Pera","Melón","Magnolia","Durazno","Mandarina","Bergamota"],["Jazmín","Muguete","Tuberosa","Fresia","Rosa","Orquídea","Ciruela","Violeta"],["Almizcle","Vainilla","Cedro","Mora"],"floral, luminoso y elegante",(20,58),year=1999,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02357","Floral",["Naranja siciliana"],["Peonía","Rosa de Damasco","Chabacano","Durazno"],["Almizcle blanco"],"rosado, delicado y fresco",(16,45),year=2014,concentration="Eau de Toilette",use="fresh")
add("DP02523","Ámbar floral",["Iris","Peonía","Muguete"],["Chabacano","Rosa","Durazno"],["Vainilla","Almizcle","Haba tonka","Benjuí","Sándalo"],"floral, cremoso y romántico",(18,48),year=2021,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02815","Chipre floral frutal",["Mandarina"],["Fresa silvestre","Jazmín","Rosa"],["Pachulí","Ámbar","Musgo","Cedro"],"frutal, oscuro y elegante",(20,48),year=2024,concentration="Parfum",intensity="Muy intensa",use="night")
add("DP01265","Ámbar floral",["Ciruela","Frutos del bosque","Cilantro","Anís","Palo de rosa"],["Tuberosa","Incienso","Miel","Canela","Clavel","Jazmín","Rosa"],["Opopónaco","Ámbar","Sándalo","Almizcle","Vainilla","Heliotropo","Vetiver","Cedro"],"oscuro, especiado y poderoso",(28,65),year=1985,concentration="Eau de Toilette",intensity="Muy intensa",use="classic")
add("DP02792","Ámbar vainilla",["Limón confitado"],["Panacota","Flor de azahar","Ron"],["Vainilla"],"cítrico, gourmand y cremoso",(18,45),year=2023,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP01197","Floral frutal",["Limón siciliano","Manzana","Cedro","Campanilla"],["Bambú","Jazmín","Rosa blanca"],["Cedro","Almizcle","Ámbar"],"cítrico, limpio y mediterráneo",(16,48),year=2001,concentration="Eau de Toilette",use="fresh")
add("DP02768","Floral frutal",["Limón siciliano"],["Durazno","Ciprés"],["Cedro","Ámbar"],"cítrico, frutal y veraniego",(16,42),year=2023,concentration="Eau de Toilette",use="fresh")
add("DP02717","Aromática frutal",["Limón siciliano","Naranja sanguina","Jazmín"],["Cereza","Heliotropo"],["Almizcle","Cedro"],"cereza, cítrico y moderno",(18,44),year=2023,concentration="Eau de Parfum",use="versatile")
add("DP02174","Ámbar floral",["Durazno","Lichi","Mandarina","Bergamota"],["Azucena","Ciruela","Jazmín","Muguete"],["Vainilla","Ámbar","Almizcle","Vetiver"],"frutal, cálido y sensual",(20,52),year=2006,concentration="Eau de Parfum",intensity="Intensa",use="night")
# 375–400
add("DP01029","Floral frutal",["Pepino","Toronja","Magnolia"],["Manzana verde","Muguete","Tuberosa","Violeta","Rosa"],["Notas amaderadas","Sándalo","Ámbar"],"verde, jugoso y urbano",(16,42),year=2004,concentration="Eau de Parfum",use="fresh")
add("DP02636","Floral frutal",["Toronja","Chabacano","Casis"],["Rosa","Muguete","Jazmín"],["Manzana roja","Notas amaderadas"],"frutal, rosado y fresco",(16,42),year=2009,concentration="Eau de Parfum",use="fresh")
add("DP01282","Floral frutal",["Frambuesa","Lichi"],["Rosa","Manzana"],["Cuero","Ámbar","Vainilla"],"frutal, dulce y atrevido",(18,44),year=2006,concentration="Eau de Parfum",use="versatile")
add("DP01283","Ámbar floral",["Rosa","Flor de azahar","Ciruela","Durazno","Anís"],["Miel","Clavel","Tuberosa","Ylang-ylang","Jazmín","Muguete"],["Sándalo","Ámbar","Benjuí","Almizcle","Vetiver","Cedro"],"floral, clásico y opulento",(28,65),year=1989,concentration="Eau de Toilette",intensity="Muy intensa",use="classic")
add("DP01346","Floral aldehídica",["Aldehídos","Lirio","Neroli","Naranja","Bergamota"],["Nardo","Jazmín","Ylang-ylang","Narciso","Clavel","Rosa"],["Almizcle","Sándalo","Ámbar","Musgo de roble","Pachulí"],"floral, clásico y brillante",(28,68),year=1991,concentration="Eau de Toilette",intensity="Intensa",use="classic")
add("DP02873","Floral frutal",["Pitahaya","Mandarina verde"],["Hibisco"],["Sándalo"],"tropical, luminoso y playero",(16,40),year=2024,concentration="Eau de Toilette",use="fresh")
add("DP02573","Floral frutal gourmand",["Manzana dulce"],["Rosa centifolia"],["Crema batida","Vainilla"],"dulce, rosado y cremoso",(16,38),year=2020,concentration="Eau de Toilette",use="versatile")
add("DP01175","Floral frutal",["Mango","Maracuyá","Frambuesa","Flor de pasionaria","Naranja","Magnolia"],["Durazno","Hibisco","Rosa silvestre","Muguete"],["Almizcle blanco","Notas amaderadas","Sándalo"],"tropical, frutal y alegre",(16,40),year=2004,concentration="Eau de Toilette",use="fresh")
add("DP02508","Floral frutal",["Sandía","Arándano","Naranja"],["Flor de tiaré","Jazmín","Tuberosa"],["Sándalo","Almizcle","Ambroxan"],"tropical, acuático y alegre",(16,40),year=2019,concentration="Eau de Toilette",use="fresh")
add("DP02824","Floral frutal",["Banana","Coco"],["Plátano","Manzana verde"],["Sándalo","Almizcle"],"tropical, cremoso y juvenil",(16,38),year=2024,concentration="Eau de Toilette",use="fresh",confidence="low")
add("DP02468","Aromática frutal",["Sandía","Pera","Mandarina"],["Fresa","Sal marina","Notas acuáticas","Rosa"],["Praliné","Ámbar","Almizcle"],"acuático, sandía y veraniego",(16,40),year=2018,concentration="Eau de Toilette",use="fresh")
add("DP01007","Floral",["Flor de azahar","Durazno","Ciruela","Neroli","Palo de rosa","Mandarina","Violeta"],["Tuberosa","Gardenia","Ylang-ylang","Jazmín","Clavel","Mimosa","Rosa","Orquídea"],["Sándalo","Ámbar","Almizcle","Vainilla","Cedro"],"floral, intenso y clásico",(26,62),year=1991,concentration="Eau de Toilette",intensity="Muy intensa",use="classic")
add("DP02133","Ámbar floral",["Azafrán","Tomillo","Mandarina"],["Lirio","Ylang-ylang","Orquídea"],["Vainilla","Haba tonka","Palo de rosa","Musgo de roble"],"especiado, floral y misterioso",(22,55),year=2006,concentration="Eau de Parfum",intensity="Intensa",use="night")
add("DP02567","Floral frutal",["Pera","Ambreta"],["Rosa","Iris"],["Almizcle","Cedro"],"frutal, almizclado y luminoso",(18,44),year=2020,concentration="Eau de Parfum",use="versatile")
add("DP01148","Ámbar floral",["Aldehídos","Piña","Flor de azahar","Lavanda","Notas verdes","Bergamota"],["Clavel","Tuberosa","Ylang-ylang","Rosa","Jazmín"],["Canela","Sándalo","Opopónaco","Almizcle","Civeta","Vainilla","Vetiver"],"floral, clásico y empolvado",(28,65),year=1982,concentration="Eau de Toilette",intensity="Intensa",use="classic")
add("DP02624","Floral",["Flor de peral","Bayas rojas","Mandarina"],["Gardenia","Jazmín","Frangipani"],["Azúcar morena","Pachulí"],"gardenia, dulce y luminoso",(16,42),year=2021,concentration="Eau de Parfum",use="versatile")
add("DP02701","Floral",["Mandarina italiana","Bergamota","Pimienta negra"],["Jazmín grandiflorum","Jazmín sambac","Magnolia","Rosa de Damasco"],["Benjuí","Sándalo","Pachulí"],"jazmín, cremoso y radiante",(18,46),year=2022,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02788","Floral frutal",["Mora","Coco"],["Magnolia","Jazmín sambac","Salvia esclarea"],["Almizcle","Maderas rubias","Pachulí"],"frutal, floral y cremoso",(18,44),year=2023,concentration="Eau de Parfum",use="versatile")
add("DP02849","Floral gourmand",["Ozono"],["Vainilla","Orquídea de vainilla"],["Ozono"],"vainilla, floral y aireado",(16,42),year=2024,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02320","Floral",["Bergamota"],["Lirio de Casablanca","Ylang-ylang","Flor de azahar"],["Sándalo","Vainilla de Tahití","Ámbar"],"floral, limpio y amaderado",(20,50),year=2015,concentration="Eau de Parfum",use="versatile")
add("DP02658","Floral",["Jazmín"],["Tuberosa"],["Rangoon creeper"],"blanco, floral y envolvente",(20,52),year=2017,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02421","Ámbar amaderada",["Lavanda","Bergamota"],["Iris","Jazmín sambac","Rosa"],["Vainilla de Tahití","Cumarina","Sándalo","Regaliz","Benjuí","Pachulí"],"lavanda, vainilla y elegante",(20,55),year=2017,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP01290","Ámbar amaderada",["Ylang-ylang","Durazno","Bergamota","Notas verdes","Limón"],["Iris","Jazmín","Narciso","Rosa","Violeta"],["Sándalo","Vainilla","Ámbar","Haba tonka","Almizcle"],"sándalo, floral y sensual",(26,62),year=1989,concentration="Eau de Parfum",intensity="Muy intensa",use="classic")
add("DP02672","Floral frutal",["Cítricos","Casis"],["Jazmín","Rosa"],["Almizcle","Vainilla","Praliné"],"frutal, rosado y dulce",(16,40),year=2022,concentration="Eau de Toilette",use="versatile",confidence="low")
add("DP01157","Ámbar floral",["Violeta","Notas marinas","Hoja de plátano","Petitgrain"],["Magnolia","Muguete","Tuberosa","Pimienta","Durazno"],["Incienso","Vainilla de Madagascar","Sándalo","Mirra"],"acuático, floral y misterioso",(18,50),year=1997,concentration="Eau de Toilette",intensity="Intensa",use="versatile")
add("DP02151","Floral frutal",["Manzana","Naranja","Sandía"],["Fresia","Peonía","Durazno"],["Vainilla","Almizcle"],"frutal, dulce y juvenil",(16,38),year=2008,concentration="Eau de Toilette",use="versatile",confidence="low")
# 401–423
add("DP01241","Floral",["Palo de rosa","Durazno","Miel","Ylang-ylang"],["Rosa","Iris","Muguete"],["Almizcle","Sándalo","Vainilla","Cumarina","Canela"],"rosado, empolvado y clásico",(26,62),year=1981,concentration="Eau de Toilette",intensity="Intensa",use="classic")
add("DP02891","Ámbar floral",["Sal"],["Tuberosa","Ylang-ylang"],["Vainilla","Haba tonka"],"salado, floral y avainillado",(18,45),year=2025,concentration="Parfum",intensity="Muy intensa",use="night",confidence="medium",note="Elixir reciente; datos contrastados con fuentes oficiales y especializadas.")
add("DP02848","Ámbar floral",["Calone"],["Ylang-ylang","Lirio","Jazmín"],["Benjuí","Merengue","Almizcle"],"marino, floral y cremoso",(18,45),year=2024,concentration="Parfum",intensity="Intensa",use="night")
add("DP02813","Floral frutal",["Loto azul"],["Iris"],["Vainilla"],"acuático, iris y vainilla",(18,42),year=2024,concentration="Eau de Parfum",use="versatile")
add("DP02452","Chipre floral",["Naranja sanguina","Mandarina"],["Miel","Gardenia","Flor de azahar","Jazmín","Durazno"],["Cera de abeja","Caramelo","Pachulí","Regaliz"],"miel, floral y provocador",(18,46),year=2017,concentration="Eau de Parfum",intensity="Muy intensa",use="night")
add("DP02700","Ámbar floral",["Jazmín"],["Caramelo","Sal"],["Vainilla"],"caramelo, salado y nocturno",(18,44),year=2022,concentration="Parfum",intensity="Muy intensa",use="night")
add("DP01225","Floral amaderada almizclada",["Jazmín","Neroli","Bergamota"],["Almizcle","Ylang-ylang","Muguete"],["Sándalo","Ámbar","Vetiver"],"almizclado, cálido y clásico",(22,60),year=1972,concentration="Cologne",intensity="Intensa",use="classic")
add("DP02405","Floral frutal",["Fresa","Toronja","Manzana","Sorbete"],["Peonía","Jazmín","Muguete"],["Almizcle","Sándalo","Coco"],"frutal, dulce y divertido",(16,36),year=2016,concentration="Eau de Parfum",use="versatile")
add("DP02231","Floral frutal",["Pera","Mandarina","Gardenia","Jazmín"],["Madreselva","Flor de azahar","Muguete"],["Vainilla","Ámbar","Sándalo","Almizcle"],"vainilla, floral y coqueto",(16,38),year=2011,concentration="Eau de Parfum",use="versatile")
add("DP02217","Floral frutal",["Durazno","Manzana","Gardenia","Bambú"],["Jazmín","Fresia","Rosa"],["Vainilla","Coco","Orquídea","Sándalo","Almizcle","Ámbar"],"frutal, cremoso y juguetón",(16,38),year=2010,concentration="Eau de Parfum",use="versatile")
add("DP02855","Floral frutal gourmand",["Pera confitada","Malvavisco","Ron","Hoja de violeta","Ylang-ylang","Bergamota"],["Chicle","Jellybean","Caramelo","Jazmín","Ládano"],["Azúcar","Pachulí","Haba tonka","Sándalo","Vetiver","Cachemira"],"dulce, chicle y gourmand",(16,38),year=2024,concentration="Eau de Parfum",intensity="Muy intensa",use="night")
add("DP02879","Floral frutal gourmand",["Fresa","Frambuesa","Limón"],["Malvavisco","Coco","Flor de azahar"],["Vainilla","Almizcle","Ambroxan"],"fresa, malvavisco y cremoso",(16,38),year=2024,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP01133","Floral",["Rosa búlgara","Espino","Casis","Mandarina"],["Violeta de Parma","Rosa","Opopónaco","Jazmín"],["Vainilla","Almizcle blanco","Incienso"],"violeta, empolvado y artístico",(20,55),year=2000,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02502","Floral frutal",["Manzana","Casis","Carambola"],["Jazmín","Peonía","Flor de manzano"],["Sándalo","Almizcle","Vainilla"],"frutal, limpio y juvenil",(16,36),year=2018,concentration="Eau de Parfum",use="versatile",confidence="low")
add("DP02635","Floral frutal gourmand",["Cereza","Frambuesa"],["Pétalos de rosa","Flor de cerezo"],["Vainilla","Almizcle"],"cereza, dulce y juguetón",(16,38),year=2017,concentration="Eau de Parfum",use="versatile",confidence="low")
add("DP02368","Floral frutal gourmand",["Mandarina roja","Manzana roja","Especias"],["Macaron","Algodón de azúcar","Muguete"],["Almizcle","Vetiver","Cachemira","Pachulí"],"dulce, chispeante y juvenil",(16,38),year=2015,concentration="Eau de Toilette",use="versatile")
add("DP02261","Floral frutal gourmand",["Casis","Pera"],["Iris","Jazmín","Flor de azahar"],["Praliné","Vainilla","Pachulí","Haba tonka"],"dulce, elegante y envolvente",(20,55),year=2012,concentration="Eau de Parfum",intensity="Muy intensa",use="versatile")
add("DP02679","Ámbar floral",["Frambuesa","Pimienta rosa","Bergamota"],["Heliotropo","Jazmín sambac","Flor de azahar"],["Vainilla","Iris","Benjuí","Pachulí","Sándalo"],"frambuesa, vainilla y sensual",(18,46),year=2020,concentration="Eau de Parfum Intense",intensity="Muy intensa",use="night")
add("DP02773","Floral frutal gourmand",["Casis","Pera"],["Iris","Jazmín","Flor de azahar"],["Oud","Rosa de Damasco","Incienso","Vainilla"],"oud, rosa y opulento",(24,58),year=2023,concentration="Extrait de Parfum",intensity="Muy intensa",use="night")
add("DP02853","Floral frutal gourmand",["Frambuesa","Bergamota"],["Hoja de violeta","Rosa"],["Manteca de cacao","Cuero","Cedro"],"frambuesa, cacao y oscuro",(20,48),year=2024,concentration="Eau de Parfum",intensity="Muy intensa",use="night")
add("DP02713","Floral frutal gourmand",["Casis","Pera"],["Iris","Jazmín","Flor de azahar"],["Praliné","Vainilla","Pachulí","Haba tonka"],"dulce, elegante y luminoso",(20,55),year=2022,concentration="Eau de Parfum",intensity="Intensa",use="versatile",confidence="low",note="Edición especial; perfil en revisión frente a La Vie Est Belle original.")
add("DP02741","Chipre floral",["Mandarina","Pimienta rosa","Bergamota"],["Ylang-ylang","Iris","Flor de azahar","Jazmín"],["Coco","Vainilla","Pachulí"],"solar, coco y floral",(18,46),year=2021,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02694","Floral frutal gourmand",["Frambuesa","Bergamota","Pimienta rosa"],["Rosa","Ylang-ylang"],["Acorde de cacao","Iris","Pachulí"],"frambuesa, rosa y cacao",(18,46),year=2022,concentration="Eau de Parfum",intensity="Intensa",use="night")
# 424–450
add("DP02901","Floral frutal gourmand",["Frutos rojos","Fresa"],["Malvavisco","Flor de azahar"],["Vainilla","Almizcle"],"frutos rojos, cremoso y dulce",(16,38),year=2025,concentration="Eau de Parfum",intensity="Intensa",use="versatile",confidence="low",note="Lanzamiento reciente; información limitada y sujeta a revisión por clave.")
add("DP02867","Ámbar vainilla",["Canela","Acorde místico"],["Jazmín","Tuberosa","Incienso"],["Vainilla","Haba tonka","Almizcle"],"vainilla, especiado y misterioso",(18,46),year=2024,concentration="Eau de Parfum",intensity="Muy intensa",use="night",confidence="medium")
add("DP02793","Floral frutal",["Lichi","Frambuesa","Hoja de violeta"],["Rosa blanca","Peonía","Jazmín"],["Almizcle","Vainilla"],"frutal, rosado y suave",(16,40),year=2022,concentration="Eau de Parfum",use="versatile")
add("DP02858","Floral frutal",["Higo verde","Mandarina","Melón","Agua de coco"],["Loto","Jazmín","Nenúfar"],["Vainilla","Sándalo","Ambroxan","Almizcle"],"verde, acuático y cremoso",(16,42),year=2024,concentration="Eau de Parfum",use="fresh")
add("DP02791","Ámbar vainilla",["Orquídea","Heliotropo","Mandarina"],["Acorde gourmand","Frutas tropicales"],["Vainilla","Almizcle","Sándalo"],"tropical, cremoso y avainillado",(16,42),year=2020,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02860","Floral frutal gourmand",["Mandarina verde","Casis"],["Caramelo de fresa","Gardenia"],["Vainilla","Sándalo","Almizcle","Ámbar"],"fresa, caramelo y dulce",(16,38),year=2024,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02850","Ámbar",["Jazmín","Durazno"],["Caramelo","Ámbar"],["Pachulí","Sándalo"],"caramelo, floral y amaderado",(18,44),year=2022,concentration="Eau de Parfum",intensity="Intensa",use="night")
add("DP02851","Floral frutal",["Coco","Mango","Maracuyá"],["Jazmín","Heliotropo","Flor de azahar"],["Vainilla","Almizcle","Cachemira"],"tropical, mango y cremoso",(16,40),year=2023,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02489","Floral amaderada almizclada",["Hoja de violeta","Fresa","Toronja"],["Gardenia","Violeta","Jazmín"],["Almizcle","Maderas blancas","Vainilla"],"floral, fresco y juvenil",(16,42),year=2007,concentration="Eau de Toilette",use="fresh")
add("DP02652","Floral frutal",["Notas verdes","Frambuesa","Pera","Toronja"],["Violeta","Lichi","Flor de manzano","Rosa","Jazmín"],["Almizcle","Ciruela","Cedro"],"frutal, verde y chispeante",(16,40),year=2011,concentration="Eau de Toilette",use="fresh")
add("DP02892","Floral frutal gourmand",["Fresa","Leche"],["Talco","Frutas rojas"],["Caramelo","Maderas"],"lechoso, fresa y nostálgico",(16,38),year=2016,concentration="Parfum",intensity="Intensa",use="versatile",confidence="low",note="Producto discontinuado y de información limitada; perfil comunitario en revisión.")
add("DP02569","Ámbar floral",["Clementina"],["Magnolia","Ylang-ylang","Peonía"],["Vainilla","Almizcle blanco","Benjuí"],"cremoso, almizclado y elegante",(18,48),year=2020,concentration="Eau de Parfum",use="versatile")
add("DP02149","Ámbar floral",["Mandarina","Sal marina","Abrótano"],["Orquídea","Hibisco","Nenúfar"],["Almizcle","Ámbar","Cedro"],"floral, salado y sensual",(18,46),year=2008,concentration="Eau de Parfum",use="versatile")
add("DP02294","Floral frutal",["Naranja amarga","Pimienta rosa","Casis"],["Té verde","Peonía","Jazmín","Violeta"],["Cedro","Ámbar","Almizcle","Musgo de roble"],"cítrico, té y alegre",(16,40),year=2007,concentration="Eau de Toilette",use="fresh")
add("DP02500","Floral amaderada almizclada",["Manzana","Mandarina","Magnolia"],["Grosella blanca","Peonía","Jazmín"],["Almizcle","Sándalo","Amberwood"],"limpio, frutal y moderno",(16,42),year=2018,concentration="Eau de Parfum",use="fresh")
add("DP02584","Floral frutal",["Frutas confitadas","Limón","Naranja amarga"],["Chicle","Rosa búlgara","Arándano","Durazno","Canela","Jengibre","Flor de durazno"],["Almizcle","Ambroxan","Cedro"],"chicle, frutal y divertido",(16,36),year=2021,concentration="Eau de Toilette",use="versatile")
add("DP01013","Ámbar vainilla",["Algodón de azúcar","Coco","Casis","Melón","Piña","Mandarina","Bergamota"],["Miel","Bayas rojas","Mora","Ciruela","Chabacano","Jazmín","Lirio","Rosa"],["Pachulí","Chocolate","Caramelo","Vainilla","Haba tonka","Ámbar","Almizcle","Sándalo"],"gourmand, dulce y icónico",(18,52),year=1992,concentration="Eau de Parfum",intensity="Muy intensa",use="night")
add("DP02843","Ámbar floral",["Lichi","Pera","Bergamota"],["Rosa turca","Oud","Incienso"],["Vainilla","Ámbar","Notas amaderadas"],"rosa, oud y opulento",(22,55),year=2018,concentration="Parfum",intensity="Muy intensa",use="night")
add("DP01406","Floral frutal",["Nectarina","Casis","Clementina"],["Flor de azahar","Orquídea"],["Ámbar","Almizcle","Notas amaderadas"],"frutal, dulce y coqueto",(16,38),year=2007,concentration="Eau de Parfum",use="versatile")
add("DP02408","Ámbar floral",["Bergamota","Limón","Nectarina"],["Rosa","Violeta","Orquídea"],["Praliné","Vainilla","Maderas de cachemira"],"dulce, cálido y glamuroso",(18,42),year=2016,concentration="Eau de Parfum",intensity="Intensa",use="night")
add("DP02152","Floral frutal",["Maracuyá","Durazno","Mimosa","Naranja","Champaña"],["Madreselva","Jazmín","Flor de tiaré","Ylang-ylang","Granadina"],["Hoja de violeta","Vetiver","Haba tonka","Maderas claras"],"frutal, chispeante y festivo",(16,38),year=2006,concentration="Eau de Parfum",use="versatile")
add("DP01255","Floral frutal",["Melón","Manzana","Durazno"],["Fresia","Jazmín","Muguete","Tuberosa","Mimosa","Azucena"],["Almizcle","Ylang-ylang","Sándalo","Musgo de roble"],"frutal, floral y juvenil",(16,40),year=2005,concentration="Eau de Parfum",use="versatile")
add("DP02492","Floral frutal",["Rosa","Lichi","Neroli"],["Peonía","Papaya","Rosa de mayo"],["Almizcle blanco","Ámbar","Cedro"],"rosado, frutal y luminoso",(16,40),year=2017,concentration="Eau de Parfum",use="versatile")
add("DP02838","Floral frutal",["Fresa","Casis","Ciruela"],["Rosa","Manzana roja","Azucena"],["Ámbar","Haba tonka","Almizcle"],"fresa, rosado y jugoso",(16,40),year=2024,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02451","Ámbar vainilla",["Caramelo"],["Notas atalcadas","Almizcle"],["Benjuí","Vainilla"],"caramelo, empolvado y cálido",(18,48),year=2011,concentration="Eau de Parfum",intensity="Intensa",use="night")
add("DP02802","Ámbar floral",["Pera","Mandarina","Bergamota"],["Flor de azahar","Neroli","Jazmín sambac"],["Vainilla bourbon","Ámbar","Almizcle blanco","Benjuí"],"floral, ambarado y moderno",(18,46),year=2022,concentration="Eau de Parfum",intensity="Intensa",use="versatile")
add("DP02673","Floral amaderada almizclada",["Mango","Bergamota"],["Jazmín","Incienso"],["Vainilla","Sándalo"],"mango, floral y cremoso",(18,44),year=2022,concentration="Eau de Parfum",intensity="Intensa",use="versatile")

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
            "lastReviewedAt": TODAY, "reviewedBy": "PRIVÉ — Base Maestra Lote 005",
            "confidence": confidence,
            "sources": [
                {"type": "internal", "title": "Catálogo operativo PRIVÉ — nombre, imagen, categoría y clave", "url": None, "accessedAt": TODAY, "supports": ["identity"]},
                {"type": "community", "title": "Fragrantica — nombre, versión, imagen y contraste olfativo", "url": fragrantica_url(item), "accessedAt": TODAY, "supports": ["identity", "classification", "olfactory"]},
                {"type": "editorial", "title": f"Perfumoteca — búsqueda exacta por clave {item['code']}", "url": perfumoteca_url(item), "accessedAt": TODAY, "supports": ["identity", "olfactory"]},
                {"type": "supplier", "title": f"Glass Essence — respaldo técnico por clave {item['code']}", "url": provider_url(item), "accessedAt": TODAY, "supports": ["classification", "olfactory"]},
                {"type": "official", "title": f"Sitio oficial de {item['designer']} — contraste de lanzamiento y narrativa", "url": f"https://www.google.com/search?q={quote_plus(item['designer'] + ' ' + item['name'] + ' official fragrance')}", "accessedAt": TODAY, "supports": ["identity", "classification"]},
                {"type": "community", "title": "Fuentes especializadas y reseñas — contraste de uso, clima y percepción", "url": f"https://www.google.com/search?q={quote_plus(item['designer'] + ' ' + item['name'] + ' perfume reviews notes')}", "accessedAt": TODAY, "supports": ["performance", "recommendation"]},
            ],
            "notes": ("Lote maestro 005. Fragrantica y Perfumoteca se mantienen como fuentes principales complementarias: "
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
        "schemaVersion": "1.0.0", "batchSize": 50, "activeBatchSize": BATCH_SIZE, "activeBatch": 5,
        "reviewPolicy": "Regla general: lotes de 50 fragancias. Los lotes 002, 003, 004 y 005 son ampliaciones autorizadas de 100; cada lote se valida antes de activar el siguiente.",
        "sourcePolicy": "Fragrantica y Perfumoteca son fuentes principales complementarias. Nombre/versión/imagen desde Fragrantica; clave y referencia olfativa del proveedor desde Perfumoteca, con respaldo técnico por clave en Glass Essence.",
        "agePolicy": "La edad es una tendencia orientativa y secundaria; nunca una restricción.",
        "batches": previous_batches + [{"id": "batch-005", "status": "review", "createdAt": TODAY, "count": len(new_filenames), "codes": [item["code"] for item in batch]}],
        "perfumes": previous_files + new_filenames,
    })
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    review_path = CORE_DIR / "review-batch-005.csv"
    with review_path.open("w", newline="", encoding="utf-8-sig") as fh:
        writer = csv.DictWriter(fh, fieldnames=list(review_rows[0]))
        writer.writeheader(); writer.writerows(review_rows)

    print(f"Generadas {len(new_filenames)} fichas Core en lote 005; total activo={len(manifest['perfumes'])}")


if __name__ == "__main__":
    main()
