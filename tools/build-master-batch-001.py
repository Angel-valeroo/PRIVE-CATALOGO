#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data" / "perfumes.json"
CORE_DIR = ROOT / "data" / "core"
BATCH_SIZE = 50
TODAY = "2026-07-30"


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def profile(*, family, accords, top, heart, base, style, age, intensity="Moderada",
            occasions=None, contexts=None, climates=None, seasons=None, day_parts=None,
            concentration="Desconocida", year=None, perfumers=None, description=None,
            confidence="medium", source_url=None, age_confidence="medium"):
    return {
        "family": family,
        "accords": accords,
        "top": top,
        "heart": heart,
        "base": base,
        "style": style,
        "age": age,
        "intensity": intensity,
        "occasions": occasions or ["Día", "Diario"],
        "contexts": contexts or ["Casual"],
        "climates": climates or ["Templado"],
        "seasons": seasons or ["Primavera", "Otoño"],
        "day_parts": day_parts or ["Mañana", "Tarde"],
        "concentration": concentration,
        "year": year,
        "perfumers": perfumers or [],
        "description": description,
        "confidence": confidence,
        "source_url": source_url,
        "age_confidence": age_confidence,
    }


P = {
"CP02446": profile(family="Ámbar vainilla", accords=["Dulce","Especiado","Afrutado"], top=["Bergamota","Lavanda","Canela","Manzana"], heart=["Muguete","Flor de azahar"], base=["Pachulí","Ámbar","Vainilla","Haba tonka"], style="juvenil, dulce y nocturno", age=(18,35), intensity="Intensa", occasions=["Noche","Cita","Fiesta","Evento"], contexts=["Romántico","Social","Especial"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Parfum", year=2020, source_url="https://afnan.com/products/9-pm"),
"CP02518": profile(family="Cítrica aromática", accords=["Cítrico","Aromático","Amaderado","Fresco"], top=["Bergamota","Mandarina"], heart=["Ámbar","Notas amaderadas","Especias frescas"], base=["Almizcle","Pachulí"], style="moderno, limpio y versátil", age=(20,45), intensity="Moderada", occasions=["Día","Diario","Oficina","Viaje"], contexts=["Casual","Profesional","Vacaciones"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Parfum", year=2021, source_url="https://afnan.com/products/turathi-blue-homme"),
"CP02494": profile(family="Aromática frutal", accords=["Cítrico","Afrutado","Fresco","Aromático"], top=["Bergamota","Notas verdes","Mandarina"], heart=["Melón","Piña","Grosella negra","Ámbar"], base=["Almizcle","Vainilla","Gálbano","Petitgrain"], style="luminoso, limpio y contemporáneo", age=(18,45), intensity="Intensa", occasions=["Día","Diario","Oficina","Playa","Viaje"], contexts=["Casual","Profesional","Vacaciones"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Extrait de Parfum", year=2024, source_url="https://shop.alharamainperfumes.com/uae/haramain-amber-oud-gold-aqua-dubai-100ml-extrait-de-parfum.html"),
"CP00723": profile(family="Ámbar amaderada", accords=["Dulce","Afrutado","Amaderado","Tabaco"], top=["Piña","Lavanda","Lima","Gálbano","Limón","Muguete"], heart=["Miel","Nuez moscada","Ylang-ylang","Rosa","Jazmín"], base=["Vainilla","Tabaco","Pachulí","Ámbar","Sándalo","Almizcle","Cedro"], style="intenso, retro y llamativo", age=(25,55), intensity="Muy intensa", occasions=["Noche","Fiesta","Evento"], contexts=["Social","Especial"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Toilette", year=1994, source_url="https://www.fragrantica.com/perfume/Animale/Animale-Animale-for-Men-5921.html"),
"CP02166": profile(family="Aromática acuática", accords=["Fresco","Acuático","Afrutado","Cítrico"], top=["Bergamota","Toronja","Melón","Piña","Manzana verde"], heart=["Notas marinas","Cardamomo","Neroli","Jazmín"], base=["Cedro","Vetiver","Ámbar","Almizcle blanco","Ante"], style="fresco, seductor y accesible", age=(18,40), intensity="Moderada", occasions=["Día","Diario","Cita","Playa","Viaje"], contexts=["Casual","Romántico","Vacaciones"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde","Noche"], concentration="Eau de Toilette", year=2014),
"CP00731": profile(family="Chipre amaderada", accords=["Amaderado","Aromático","Cuero","Especiado"], top=["Aldehídos","Mirra","Bergamota","Trébol","Gardenia"], heart=["Pachulí","Salvia","Jazmín","Cardamomo"], base=["Cuero","Musgo de roble","Sándalo","Ámbar","Almizcle"], style="clásico, formal y distinguido", age=(32,65), intensity="Intensa", occasions=["Día","Oficina","Evento","Noche"], contexts=["Profesional","Formal","Especial"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Eau de Toilette", year=1966),
"CP02438": profile(family="Chipre frutal", accords=["Cítrico","Afrutado","Amaderado","Ahumado"], top=["Limón","Piña","Bergamota","Grosella negra","Manzana"], heart=["Abedul","Jazmín","Rosa"], base=["Almizcle","Ámbar gris","Pachulí","Vainilla"], style="moderno, seguro y de presencia", age=(20,45), intensity="Intensa", occasions=["Día","Noche","Oficina","Cita","Evento"], contexts=["Casual","Profesional","Social","Especial"], climates=["Templado","Frío"], seasons=["Primavera","Otoño","Invierno"], day_parts=["Tarde","Noche"], concentration="Eau de Toilette", year=2015),
"CP02478": profile(family="Aromática especiada", accords=["Aromático","Especiado","Cítrico","Amaderado"], top=["Mandarina","Limón","Cardamomo"], heart=["Lavanda","Geranio","Rosa"], base=["Cedro","Vetiver","Almizcle","Pachulí"], style="deportivo, limpio y versátil", age=(18,42), intensity="Moderada", occasions=["Día","Diario","Oficina","Gimnasio","Viaje"], contexts=["Casual","Profesional","Deportivo"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Parfum", year=2016),
"CP02524": profile(family="Amaderada especiada", accords=["Amaderado","Oud","Especiado","Aromático"], top=["Bergamota","Lavanda","Azafrán"], heart=["Oud","Notas amaderadas","Especias"], base=["Almizcle","Ámbar","Pachulí"], style="oscuro, intenso y exótico", age=(25,50), intensity="Intensa", occasions=["Noche","Cita","Evento"], contexts=["Formal","Romántico","Especial"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Parfum", year=2023, confidence="low", source_url="https://armaf.com/products/odyssey-aoud-edition"),
"CP02522": profile(family="Ámbar floral", accords=["Dulce","Ámbar","Floral","Amaderado"], top=["Cardamomo","Neroli","Mandarina"], heart=["Flor de azahar","Rosa"], base=["Vainilla","Notas amaderadas","Sándalo","Ámbar"], style="cálido, elegante y envolvente", age=(23,48), intensity="Intensa", occasions=["Noche","Cita","Evento"], contexts=["Romántico","Formal","Especial"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Parfum"),
"CP02499": profile(family="Ámbar especiada", accords=["Dulce","Cítrico","Especiado","Amaderado"], top=["Mandarina","Naranja","Azafrán","Salvia"], heart=["Caramelo","Haba tonka","Tagetes"], base=["Ambroxan","Vetiver","Cedro"], style="juvenil, dulce y energético", age=(18,38), intensity="Intensa", occasions=["Noche","Cita","Fiesta"], contexts=["Romántico","Social"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Eau de Parfum", year=2023, source_url="https://armaf.com/products/odyssey-mega-for-men"),
"CP02521": profile(family="Ámbar amaderada", accords=["Dulce","Especiado","Amaderado","Cítrico"], top=["Mandarina","Lavanda","Pimienta negra","Cardamomo"], heart=["Caramelo","Incienso","Vainilla"], base=["Ambroxan","Haba tonka","Cedro","Vetiver"], style="intenso, moderno y nocturno", age=(20,42), intensity="Muy intensa", occasions=["Noche","Cita","Fiesta","Evento"], contexts=["Romántico","Social","Especial"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Parfum", year=2025, confidence="low", age_confidence="low"),
"CP02501": profile(family="Amaderada aromática", accords=["Aromático","Amaderado","Fresco","Cítrico"], top=["Bergamota","Enebro","Naranja"], heart=["Lavanda","Geranio","Notas aromáticas"], base=["Cedro","Almizcle","Vetiver"], style="fresco, urbano y dinámico", age=(18,42), intensity="Moderada", occasions=["Día","Diario","Oficina","Gimnasio","Viaje"], contexts=["Casual","Profesional","Deportivo"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Parfum", year=2023, source_url="https://www.armaf.ae/products/odyssey-mega-man"),
"CP00725": profile(family="Aromática acuática", accords=["Acuático","Cítrico","Fresco","Aromático"], top=["Bergamota","Neroli","Notas marinas"], heart=["Romero","Caqui","Jazmín"], base=["Cedro","Pachulí","Almizcle blanco"], style="fresco, mediterráneo y atemporal", age=(18,55), intensity="Moderada", occasions=["Día","Diario","Oficina","Escuela","Gimnasio","Playa"], contexts=["Casual","Profesional","Deportivo","Vacaciones"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=1996),
"CP02232": profile(family="Amaderada acuática", accords=["Acuático","Amaderado","Afrutado","Aromático"], top=["Notas marinas","Bergamota","Toronja","Limón","Manzana","Pera"], heart=["Lavanda","Romero","Geranio"], base=["Pachulí","Ládano","Haba tonka","Madera de ámbar"], style="sofisticado, fresco y cálido", age=(25,50), intensity="Intensa", occasions=["Día","Noche","Oficina","Cita","Evento"], contexts=["Profesional","Romántico","Social"], climates=["Templado","Calor"], seasons=["Primavera","Verano","Otoño"], day_parts=["Tarde","Noche"], concentration="Eau de Parfum", year=2018),
"CP02416": profile(family="Amaderada aromática", accords=["Acuático","Aromático","Amaderado","Incienso"], top=["Notas marinas","Bergamota"], heart=["Romero","Salvia esclarea","Geranio"], base=["Incienso","Pachulí"], style="elegante, mineral y contemporáneo", age=(25,55), intensity="Intensa", occasions=["Día","Noche","Oficina","Evento"], contexts=["Profesional","Formal","Especial"], climates=["Templado","Calor"], seasons=["Primavera","Verano","Otoño"], day_parts=["Tarde","Noche"], concentration="Parfum", year=2023),
"CP02310": profile(family="Aromática acuática", accords=["Acuático","Aromático","Cítrico","Mineral"], top=["Notas marinas","Aquozone","Bergamota","Mandarina verde"], heart=["Romero","Lavanda","Ciprés","Lentisco"], base=["Notas minerales","Almizcle","Pachulí","Ámbar"], style="moderno, profundo y pulcro", age=(20,50), intensity="Intensa", occasions=["Día","Diario","Oficina","Cita","Viaje"], contexts=["Casual","Profesional","Romántico"], climates=["Calor","Templado"], seasons=["Primavera","Verano","Otoño"], day_parts=["Mañana","Tarde","Noche"], concentration="Eau de Parfum", year=2020),
"CP02306": profile(family="Aromática acuática", accords=["Acuático","Incienso","Aromático","Amaderado"], top=["Notas marinas","Bergamota"], heart=["Romero","Salvia","Geranio"], base=["Incienso","Pachulí"], style="serio, elegante y magnético", age=(25,55), intensity="Intensa", occasions=["Noche","Cita","Evento","Oficina"], contexts=["Profesional","Romántico","Formal","Especial"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Parfum", year=2015),
"CP02374": profile(family="Ámbar especiada", accords=["Especiado","Cítrico","Cuero","Dulce"], top=["Limón","Bergamota"], heart=["Anís estrellado","Flor de olivo","Madera de guayaco"], base=["Cuero","Haba tonka","Tabaco"], style="elegante, sensual y nocturno", age=(25,55), intensity="Moderada", occasions=["Noche","Cita","Evento"], contexts=["Romántico","Formal","Especial"], climates=["Templado","Frío"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Toilette", year=2004),
"CP02259": profile(family="Ámbar especiada", accords=["Dulce","Vainilla","Especiado","Cuero"], top=["Mandarina verde","Manzana"], heart=["Flor de azahar","Nuez moscada","Semilla de zanahoria"], base=["Haba tonka","Vainilla","Ante","Notas amaderadas"], style="opulento, cremoso y seductor", age=(23,48), intensity="Muy intensa", occasions=["Noche","Cita","Fiesta","Evento"], contexts=["Romántico","Social","Especial"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Parfum", year=2019),
"CP02393": profile(family="Amaderada aromática", accords=["Iris","Aromático","Amaderado","Ámbar"], top=["Bergamota","Hoja de bergamota"], heart=["Iris","Raíz de lirio","Salvia esclarea"], base=["Haba tonka","Cedro"], style="pulcro, elegante y moderno", age=(25,55), intensity="Moderada", occasions=["Día","Noche","Oficina","Evento"], contexts=["Profesional","Formal","Especial"], climates=["Templado","Frío"], seasons=["Primavera","Otoño","Invierno"], day_parts=["Tarde","Noche"], concentration="Parfum", year=2022),
"CP02195": profile(family="Ámbar especiada", accords=["Dulce","Especiado","Ámbar","Cuero"], top=["Mandarina verde","Manzana verde","Cardamomo"], heart=["Flor de azahar","Lavanda","Nuez moscada"], base=["Haba tonka","Ámbar","Cuero"], style="intenso, dulce y atrevido", age=(20,45), intensity="Muy intensa", occasions=["Noche","Cita","Fiesta"], contexts=["Romántico","Social"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Parfum", year=2016),
"CP01089": profile(family="Ámbar especiada", accords=["Especiado","Iris","Ámbar","Amaderado"], top=["Bergamota","Pimienta rosa"], heart=["Cardamomo","Iris","Heliotropo"], base=["Ámbar","Haba tonka","Cedro"], style="refinado, sobrio y nocturno", age=(30,60), intensity="Moderada", occasions=["Noche","Cita","Evento"], contexts=["Formal","Romántico","Especial"], climates=["Templado","Frío"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Toilette", year=2013),
"CP01004": profile(family="Amaderada aromática", accords=["Amaderado","Cítrico","Cacao","Especiado"], top=["Bergamota","Madera de guayaco"], heart=["Pimienta de Sichuan","Cedro","Vetiver"], base=["Cacao","Ámbar"], style="elegante, seco y original", age=(25,50), intensity="Moderada", occasions=["Día","Noche","Oficina","Evento"], contexts=["Profesional","Formal","Especial"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Eau de Toilette", year=2008),
"CP02365": profile(family="Aromática fougère", accords=["Dulce","Vainilla","Especiado","Aromático"], top=["Pimienta rosa","Enebro","Violeta"], heart=["Toffee","Canela","Lavanda","Salvia"], base=["Vainilla","Haba tonka","Ante","Ámbar"], style="cálido, juvenil y romántico", age=(18,38), intensity="Intensa", occasions=["Noche","Cita","Fiesta"], contexts=["Romántico","Social"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Toilette", year=2017),
"CP02417": profile(family="Ámbar vainilla", accords=["Ámbar","Vainilla","Aromático","Cálido"], top=["Mandarina","Lavanda"], heart=["Ámbar","Vainilla"], base=["Notas amaderadas","Almizcle"], style="cálido, suave y envolvente", age=(20,45), intensity="Intensa", occasions=["Noche","Cita","Evento"], contexts=["Romántico","Especial"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Parfum", year=2023, confidence="low"),
"CP02316": profile(family="Ámbar amaderada", accords=["Oud","Vainilla","Aromático","Amaderado"], top=["Lavanda"], heart=["Oud"], base=["Vainilla"], style="oscuro, lujoso y minimalista", age=(25,50), intensity="Muy intensa", occasions=["Noche","Cita","Evento"], contexts=["Formal","Romántico","Especial"], climates=["Frío"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Parfum", year=2022),
"CP00775": profile(family="Aromática amaderada", accords=["Cítrico","Aromático","Amaderado","Verde"], top=["Bergamota","Mandarina verde"], heart=["Salvia","Lavanda"], base=["Bálsamo de abeto","Lentisco","Pino"], style="fresco, verde y pulcro", age=(20,50), intensity="Moderada", occasions=["Día","Diario","Oficina","Viaje"], contexts=["Casual","Profesional"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Parfum", year=2023, confidence="low"),
"CP00738": profile(family="Aromática fougère", accords=["Aromático","Especiado","Amaderado","Cuero"], top=["Alcaravea","Iris","Lavanda","Salvia","Albahaca","Anís","Bergamota","Limón"], heart=["Sándalo","Enebro","Pachulí","Vetiver","Cedro","Cardamomo"], base=["Cuero","Haba tonka","Ámbar","Almizcle","Musgo de roble"], style="clásico, masculino y formal", age=(32,65), intensity="Intensa", occasions=["Día","Oficina","Evento","Noche"], contexts=["Profesional","Formal","Especial"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Eau de Toilette", year=1978),
"CP02307": profile(family="Amaderada especiada", accords=["Canela","Dulce","Tabaco","Amaderado"], top=["Canela","Mandarina","Lavanda","Limón"], heart=["Notas frutales","Incienso","Comino","Cedro rojo"], base=["Tabaco","Vainilla","Cedro","Cuero","Benjuí","Ciprés","Pachulí"], style="seductor, especiado y nocturno", age=(22,48), intensity="Muy intensa", occasions=["Noche","Cita","Fiesta","Evento"], contexts=["Romántico","Social","Especial"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Parfum", year=2018),
"CP02443": profile(family="Aromática amaderada", accords=["Aromático","Cítrico","Verde","Acuático"], top=["Mezcal","Toronja","Bergamota","Pimienta negra"], heart=["Aloe vera","Sal","Lavanda","Salvia","Geranio"], base=["Vetiver","Abeto balsámico","Almizcle","Pachulí"], style="fresco, verde y juvenil", age=(16,35), intensity="Moderada", occasions=["Día","Diario","Oficina","Escuela","Playa"], contexts=["Casual","Deportivo","Vacaciones"], climates=["Calor"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=2023, perfumers=["Pierre-Constantin Guéros","Emilie Coppermann"], source_url="https://www.fragrantica.com/perfume/Benetton/United-Dreams-Green-Cactus-For-Him-82130.html"),
"CP02423": profile(family="Amaderada aromática", accords=["Cítrico","Especiado","Aromático","Amaderado"], top=["Kumquat","Toronja","Pimienta rosa"], heart=["Lavanda","Verbena"], base=["Vetiver","Haba tonka","Ámbar"], style="urbano, casual y energético", age=(18,38), intensity="Moderada", occasions=["Día","Diario","Oficina","Viaje"], contexts=["Casual","Profesional","Social"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=2020),
"CP02453": profile(family="Ámbar vainilla", accords=["Cítrico","Afrutado","Vainilla","Ámbar"], top=["Naranja","Bergamota","Limón"], heart=["Notas frutales"], base=["Vainilla","Almizcle","Ámbar"], style="dulce, llamativo y moderno", age=(18,40), intensity="Muy intensa", occasions=["Noche","Cita","Fiesta"], contexts=["Romántico","Social"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Eau de Parfum", year=2021),
"CP00756": profile(family="Ámbar amaderada", accords=["Especiado","Amaderado","Rosa","Dulce"], top=["Mandarina verde","Jengibre","Bergamota","Cardamomo"], heart=["Rosa silvestre","Nuez moscada","Cedro"], base=["Haba tonka","Ámbar gris","Pachulí"], style="elegante, cálido y británico", age=(23,50), intensity="Moderada", occasions=["Día","Noche","Oficina","Cita"], contexts=["Profesional","Romántico","Formal"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Eau de Toilette", year=2004),
"CP01012": profile(family="Amaderada especiada", accords=["Amaderado","Cítrico","Aromático","Especiado"], top=["Bergamota"], heart=["Enebro","Pimienta negra"], base=["Cedro del Atlas","Cedro de Virginia","Cedro del Himalaya"], style="minimalista, limpio y masculino", age=(20,48), intensity="Moderada", occasions=["Día","Diario","Oficina","Viaje"], contexts=["Casual","Profesional"], climates=["Calor","Templado"], seasons=["Primavera","Verano","Otoño"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=2021),
"CP02171": profile(family="Amaderada aromática", accords=["Aromático","Amaderado","Fresco","Especiado"], top=["Toronja","Cardamomo","Estragón","Menta"], heart=["Cedro","Hoja de abedul","Nuez moscada","Lavanda"], base=["Vetiver","Madera de guayaco","Sándalo","Musgo de roble","Benjuí","Madera de ámbar"], style="sobrio, urbano y profesional", age=(25,52), intensity="Moderada", occasions=["Día","Oficina","Evento","Viaje"], contexts=["Profesional","Formal","Casual"], climates=["Templado","Calor"], seasons=["Primavera","Otoño","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=2016),
"CP02139": profile(family="Aromática acuática", accords=["Acuático","Cítrico","Aromático","Amaderado"], top=["Mandarina","Naranja","Petitgrain"], heart=["Algas marinas","Lavanda","Flor de algodón"], base=["Cedro de Virginia","Notas amaderadas","Pachulí","Salvia esclarea"], style="marino, limpio y distintivo", age=(20,48), intensity="Moderada", occasions=["Día","Diario","Oficina","Playa","Viaje"], contexts=["Casual","Profesional","Vacaciones"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=2005),
"CP00758": profile(family="Amaderada floral almizclada", accords=["Aromático","Amaderado","Floral","Almizclado"], top=["Té","Aldehídos","Bergamota","Lavanda","Nuez moscada","Flor de azahar"], heart=["Pimienta","Iris","Palo de rosa","Cilantro","Geranio","Clavel","Ciclamen"], base=["Almizcle","Cedro","Ámbar","Musgo de roble","Haba tonka","Vetiver"], style="limpio, refinado y discreto", age=(25,60), intensity="Moderada", occasions=["Día","Diario","Oficina","Evento"], contexts=["Profesional","Formal"], climates=["Templado","Calor"], seasons=["Primavera","Otoño","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=1996),
"CP02154": profile(family="Ámbar floral", accords=["Especiado","Ron","Cuero","Dulce"], top=["Especias","Ron","Tabaco"], heart=["Cuero","Iris","Nardo"], base=["Haba tonka","Madera de guayaco","Benjuí"], style="oscuro, sensual y sofisticado", age=(25,50), intensity="Muy intensa", occasions=["Noche","Cita","Evento"], contexts=["Romántico","Formal","Especial"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Parfum", year=2014),
"CP00762": profile(family="Chipre amaderada", accords=["Aromático","Verde","Amaderado","Cuero"], top=["Aldehídos","Bergamota","Limón","Manzanilla","Salvia esclarea"], heart=["Clavel","Geranio","Jazmín","Rosa","Canela"], base=["Musgo de roble","Vetiver","Pachulí","Cedro","Ámbar","Almizcle","Cuero"], style="vintage, verde y formal", age=(35,70), intensity="Intensa", occasions=["Día","Oficina","Evento"], contexts=["Profesional","Formal","Especial"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Eau de Toilette", year=1981),
"CP01064": profile(family="Ámbar especiada", accords=["Tabaco","Dulce","Especiado","Aromático"], top=["Lavanda","Clementina","Pepino"], heart=["Cardamomo","Pimienta","Albahaca","Osmanto"], base=["Tabaco","Ámbar","Pachulí","Almizcle","Notas amaderadas"], style="juvenil, dulce y rebelde", age=(16,35), intensity="Intensa", occasions=["Noche","Cita","Fiesta"], contexts=["Casual","Social","Romántico"], climates=["Frío","Templado"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Toilette", year=2011),
"CP00941": profile(family="Aromática verde", accords=["Fresco","Aromático","Afrutado","Amaderado"], top=["Melón","Eucalipto","Mango","Toronja","Enebro","Bergamota"], heart=["Notas marinas","Abedul","Abeto","Ciprés","Romero","Salvia"], base=["Musgo de roble","Vetiver","Sándalo","Ámbar","Pachulí"], style="fresco, verde y clásico", age=(25,55), intensity="Moderada", occasions=["Día","Diario","Oficina","Viaje"], contexts=["Casual","Profesional","Vacaciones"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=1993),
"CP02458": profile(family="Aromática fougère", accords=["Acuático","Ozónico","Aromático","Fresco"], top=["Notas marinas","Notas ozónicas","Enebro","Mandarina"], heart=["Lavanda","Manzana verde","Hoja de violeta"], base=["Algas marinas","Pachulí","Ámbar gris"], style="ligero, aireado y deportivo", age=(18,45), intensity="Suave", occasions=["Día","Diario","Oficina","Gimnasio","Playa"], contexts=["Casual","Profesional","Deportivo"], climates=["Calor"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=2018),
"CP01043": profile(family="Amaderada acuática", accords=["Acuático","Fresco","Aromático","Amaderado"], top=["Pepino","Cítricos","Notas verdes","Loto"], heart=["Pimienta de Sichuan","Lavanda","Cedro","Ciruela"], base=["Almizcle","Sándalo","Pachulí","Madera de guayaco"], style="limpio, versátil y sereno", age=(20,50), intensity="Moderada", occasions=["Día","Diario","Oficina","Playa","Viaje"], contexts=["Casual","Profesional","Vacaciones"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=2010),
"CP00814": profile(family="Aromática fougère", accords=["Aromático","Verde","Amaderado","Cítrico"], top=["Lavanda","Limón","Bergamota","Mandarina"], heart=["Salvia","Enebro","Albahaca","Geranio","Jazmín","Cilantro","Flor de azahar"], base=["Sándalo","Vetiver","Almizcle","Ámbar","Palo de rosa"], style="clásico, limpio y profesional", age=(25,60), intensity="Moderada", occasions=["Día","Diario","Oficina","Evento"], contexts=["Profesional","Formal","Casual"], climates=["Templado","Calor"], seasons=["Primavera","Otoño","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=1989),
"CP01008": profile(family="Amaderada aromática", accords=["Especiado","Aromático","Amaderado","Ámbar"], top=["Jengibre","Pimienta"], heart=["Albahaca negra","Salvia","Cedro"], base=["Ámbar","Ante","Pachulí","Secuoya"], style="sensual, moderno y sobrio", age=(23,50), intensity="Moderada", occasions=["Noche","Cita","Oficina","Evento"], contexts=["Profesional","Romántico","Social"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Eau de Toilette", year=2006),
"CP00902": profile(family="Ámbar amaderada", accords=["Canela","Ámbar","Especiado","Dulce"], top=["Canela","Lavanda","Cilantro","Mandarina","Lima","Bergamota","Toronja"], heart=["Mirra","Nuez moscada","Clavel","Palo de rosa","Pino","Salvia","Jazmín"], base=["Ámbar","Vainilla","Sándalo","Almizcle","Pachulí","Vetiver"], style="intenso, cálido y clásico", age=(28,60), intensity="Muy intensa", occasions=["Noche","Cita","Evento"], contexts=["Romántico","Formal","Especial"], climates=["Frío"], seasons=["Otoño","Invierno"], day_parts=["Noche"], concentration="Eau de Toilette", year=1986),
"CP02160": profile(family="Amaderada aromática", accords=["Aromático","Marino","Cítrico","Verde"], top=["Bergamota","Albahaca","Mandarina"], heart=["Notas marinas","Pimienta","Cardamomo"], base=["Pino","Musgo","Almizcle"], style="fresco, clásico y casual", age=(22,50), intensity="Moderada", occasions=["Día","Diario","Oficina","Playa"], contexts=["Casual","Profesional","Vacaciones"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=2011, source_url="https://www.fragrantica.com/perfume/Carlo-Corinto/315-13321.html"),
"CP00764": profile(family="Amaderada aromática", accords=["Verde","Amaderado","Cuero","Afrutado"], top=["Bergamota","Limón","Lavanda","Albahaca","Frambuesa"], heart=["Pino","Salvia","Tomillo","Clavel"], base=["Cuero","Pachulí","Cedro","Ámbar"], style="clásico, verde y elegante", age=(30,65), intensity="Intensa", occasions=["Día","Oficina","Evento"], contexts=["Profesional","Formal","Especial"], climates=["Templado","Frío"], seasons=["Otoño","Invierno","Primavera"], day_parts=["Tarde","Noche"], concentration="Eau de Toilette", year=1984, confidence="medium", source_url="https://www.fragrantica.com/perfume/Carlo-Corinto/Carlo-Corinto-13309.html"),
"CP00702": profile(family="Aromática fresca", accords=["Cítrico","Afrutado","Aromático","Amaderado"], top=["Toronja","Mandarina","Casia","Enebro"], heart=["Grosella roja","Nuez moscada","Gardenia"], base=["Sándalo","Almizcle"], style="fresco, limpio y juvenil", age=(18,42), intensity="Moderada", occasions=["Día","Diario","Oficina","Playa","Viaje"], contexts=["Casual","Profesional","Vacaciones"], climates=["Calor","Templado"], seasons=["Primavera","Verano"], day_parts=["Mañana","Tarde"], concentration="Eau de Toilette", year=2003, source_url="https://beta.fragrantica.com/perfume/Carolina-Herrera/212-H2O-Men-7045.html"),
}

NOTE_TRAITS = {
    "freshness": ["bergamota","limón","mandarina","toronja","notas marinas","acuático","pepino","menta","ozónicas","eucalipto","aloe"],
    "sweetness": ["vainilla","caramelo","toffee","haba tonka","miel","azúcar","cacao","frutales","manzana","piña","melón"],
    "warmth": ["ámbar","canela","tabaco","ron","benjuí","incienso","vainilla","cuero","oud"],
    "woodiness": ["cedro","sándalo","vetiver","pachulí","guayaco","pino","abeto","notas amaderadas","oud"],
    "spiciness": ["pimienta","cardamomo","canela","nuez moscada","azafrán","comino","anís","especias"],
    "floral": ["rosa","jazmín","iris","geranio","lavanda","nardo","flor de azahar","gardenia","violeta","muguete"],
    "citrus": ["bergamota","limón","mandarina","toronja","naranja","clementina","lima","cítricos","petitgrain"],
    "fruitiness": ["manzana","piña","melón","pera","grosella","frambuesa","mango","ciruela","frutales","caqui"],
    "aquatic": ["marinas","marino","acuático","aquozone","algas","sal","ozónicas","loto"],
    "powdery": ["iris","heliotropo","violeta","almizcle","haba tonka"],
    "smoky": ["incienso","tabaco","abedul","humo","mirra"],
    "leathery": ["cuero","ante"],
}


def sensory(notes, accords):
    haystack = " ".join(notes + accords).lower()
    result = {}
    for trait, words in NOTE_TRAITS.items():
        hits = sum(1 for word in words if word in haystack)
        result[trait] = min(5, hits * 2 if hits < 3 else 5)
    return result


def description_for(item, p):
    if p["description"]:
        return p["description"]
    lead = ", ".join(p["accords"][:3]).lower()
    top = ", ".join(p["top"][:3]).lower()
    base = ", ".join(p["base"][:3]).lower()
    return f"Una fragancia de perfil {lead}, con una salida de {top} que evoluciona hacia un fondo de {base}. Su carácter {p['style']} la hace fácil de ubicar según ocasión y clima."


def age_guidance(p):
    low, high = p["age"]
    return (
        f"Tendencia orientativa: suele conectar especialmente con personas de {low} a {high} años por su estilo {p['style']}. "
        "No es una regla ni limita su uso: si te atraen sus notas y la imagen que proyecta, puede funcionar muy bien a cualquier edad."
    )




def public_source(url: str | None):
    if not url:
        return {
            "type": "internal",
            "title": "Revisión documental PRIVÉ — Lote maestro 001",
            "url": None,
        }
    if "fragrantica.com" in url:
        return {
            "type": "community",
            "title": "Fragrantica — referencia comunitaria",
            "url": url,
        }
    return {
        "type": "official",
        "title": "Sitio oficial de la marca",
        "url": url,
    }

def make_core(item, p):
    notes = p["top"] + p["heart"] + p["base"]
    source = {
        **public_source(p["source_url"]),
        "accessedAt": TODAY,
        "supports": ["classification", "olfactory", "recommendation", "content"]
    }
    effective_confidence = p["confidence"] if p["source_url"] else "low"
    effective_age_confidence = p["age_confidence"] if p["source_url"] else "low"
    return {
        "schemaVersion": "1.0.0",
        "id": item["id"],
        "status": "review",
        "identity": {
            "brand": item["designer"],
            "name": item["name"],
            "line": None,
            "flanker": None,
            "priveCode": item["code"],
            "sku": None,
            "audience": item["category"],
            "concentration": p["concentration"],
            "launchYear": p["year"],
            "perfumers": p["perfumers"],
            "countryOfOrigin": None
        },
        "classification": {
            "family": p["family"],
            "subfamily": None,
            "accords": p["accords"],
            "styleTags": [tag.strip().capitalize() for tag in p["style"].split(",")]
        },
        "olfactory": {
            "topNotes": p["top"],
            "heartNotes": p["heart"],
            "baseNotes": p["base"],
            "notePyramidConfidence": effective_confidence
        },
        "performance": {
            "intensity": p["intensity"],
            "longevity": "Desconocida",
            "projection": "Desconocida",
            "trail": "Desconocida",
            "longevityHours": {"min": None, "max": None}
        },
        "sensoryProfile": sensory(notes, p["accords"]),
        "recommendation": {
            "occasions": p["occasions"],
            "contexts": p["contexts"],
            "climates": p["climates"],
            "seasons": p["seasons"],
            "dayParts": p["day_parts"],
            "formality": 4 if "Formal" in p["contexts"] else 3 if "Profesional" in p["contexts"] else 2,
            "versatility": 4 if len(p["occasions"]) >= 4 else 3 if len(p["occasions"]) >= 3 else 2,
            "distinctiveness": 4 if any(x in p["accords"] for x in ["Oud","Incienso","Cuero","Tabaco","Ron"]) else 3,
            "recommendedAge": {
                "min": p["age"][0],
                "max": p["age"][1],
                "confidence": effective_age_confidence,
                "framing": "tendency",
                "isRestrictive": False,
                "guidance": age_guidance(p)
            }
        },
        "content": {
            "shortDescription": description_for(item, p),
            "advisorSummary": (
                f"Perfil {p['style']}. Afinidad orientativa: {p['age'][0]} a {p['age'][1]} años; "
                "sus notas pueden funcionar a cualquier edad según tus gustos y la imagen que deseas proyectar."
            ),
            "wearingTips": [
                f"Rinde mejor en clima {' y '.join(x.lower() for x in p['climates'])}.",
                "El rango de edad es orientativo; prioriza siempre tus gustos y la imagen que quieres proyectar."
            ],
            "image": {
                "path": f"IMAGES/{item['category']}/{item['code']}.avif",
                "alt": f"{item['designer']} {item['name']}"
            }
        },
        "provenance": {
            "lastReviewedAt": TODAY,
            "reviewedBy": "PRIVÉ — revisión de lote",
            "confidence": effective_confidence,
            "sources": [
                {
                    "type": "internal",
                    "title": "Catálogo operativo PRIVÉ",
                    "url": None,
                    "accessedAt": TODAY,
                    "supports": ["identity"]
                },
                source
            ],
            "notes": "Lote maestro 001. Ficha en estado review: validar la pirámide y la tendencia de edad antes de cambiar a verified. La edad es una tendencia secundaria, nunca una restricción de compra."
        }
    }


def main():
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    batch = catalog[:BATCH_SIZE]
    missing = [item["code"] for item in batch if item["code"] not in P]
    extra = sorted(set(P) - {item["code"] for item in batch})
    if missing or extra:
        raise SystemExit(f"Perfiles incompletos. Faltan={missing}; sobran={extra}")

    filenames = []
    for item in batch:
        core = make_core(item, P[item["code"]])
        filename = f"{item['id']}.json"
        (CORE_DIR / filename).write_text(json.dumps(core, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        filenames.append(filename)

    manifest = {
        "schemaVersion": "1.0.0",
        "batchSize": BATCH_SIZE,
        "activeBatch": 1,
        "reviewPolicy": "Cada lote contiene 50 fragancias. Se valida antes de activar el siguiente lote.",
        "agePolicy": "La edad es una tendencia orientativa y secundaria; nunca una restricción.",
        "batches": [
            {
                "id": "batch-001",
                "status": "review",
                "createdAt": TODAY,
                "count": len(filenames),
                "codes": [item["code"] for item in batch]
            }
        ],
        "perfumes": filenames
    }
    (CORE_DIR / "catalog.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Generadas {len(filenames)} fichas Core en lote 001")


if __name__ == "__main__":
    main()
