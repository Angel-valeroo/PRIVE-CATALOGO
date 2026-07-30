#!/usr/bin/env python3
from __future__ import annotations
import csv, json, importlib.util
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('batch005', ROOT/'tools'/'build-master-batch-005.py')
base = importlib.util.module_from_spec(spec); spec.loader.exec_module(base)
CATALOG_PATH=ROOT/'data'/'perfumes.json'; CORE_DIR=ROOT/'data'/'core'
BATCH_START=450; BATCH_SIZE=97; TODAY='2026-07-30'
P={}
def add(code,family,top,heart,base_notes,style,age=(18,50),**kw):
    P[code]=base.profile(family,top,heart,base_notes,style,age,**kw)

# 451–459 · Rabanne
add('DP02868','Floral frutal gourmand',['Pimienta rosa'],['Incienso','Flor de azahar','Jazmín'],['Vainilla','Almizcle','Sándalo'],'cremoso, floral y glamuroso',(18,44),year=2024,concentration='Eau de Parfum',intensity='Intensa',use='night',confidence='medium',note='Edición reciente; validar la pirámide exacta por clave antes de cerrar review.')
add('DP02210','Floral frutal',['Neroli','Limón de Amalfi','Frambuesa'],['Jazmín','Flor de azahar africana','Gardenia'],['Miel blanca','Pachulí','Ámbar'],'dulce, floral y lujoso',(20,55),year=2010,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('DP02704','Ámbar floral',['Pimienta rosa','Mandarina'],['Tuberosa','Jazmín','Ylang-ylang'],['Vainilla','Haba tonka','Musgo'],'floral, vainillado y festivo',(18,46),year=2021,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('DP02477','Floral frutal gourmand',['Frambuesa'],['Avellana','Rosa','Jazmín'],['Miel','Madera de cachemira','Cedro','Sándalo'],'avellanado, rosado y sensual',(20,48),year=2018,concentration='Eau de Parfum',intensity='Intensa',use='night')
add('DP02724','Floral frutal',['Granada','Mandarina'],['Nardo','Jazmín','Flor de azahar'],['Madera de cachemira','Pachulí','Almizcle'],'frutal, floral y seguro',(18,46),year=2023,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('DP02864','Floral amaderada almizclada',['Rosa','Mandarina','Lavanda'],['Flores blancas','Ylang-ylang','Jazmín'],['Almizcle','Vainilla','Musgo'],'floral, almizclado y luminoso',(18,46),year=2024,concentration='Eau de Parfum',intensity='Intensa',use='versatile',confidence='medium',note='Lanzamiento reciente; notas contrastadas con comunicación oficial y fuentes especializadas.')
add('DP02349','Ámbar floral',['Mandarina verde','Jazmín de agua','Flor de jengibre'],['Vainilla salada'],['Madera de cachemira','Ámbar gris','Sándalo'],'salado, vainillado y sensual',(20,52),year=2015,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('DP02674','Ámbar floral',['Flor de azahar','Mandarina','Cáscara de naranja'],['Flores solares','Tiaré','Musgo de roble'],['Ylang-ylang','Benjuí'],'solar, floral y cálido',(18,46),year=2022,concentration='Eau de Parfum',intensity='Intensa',use='fresh')
add('DP01334','Ámbar floral',['Pimienta','Chabacano','Cilantro','Almendra','Palo de rosa'],['Violeta','Jazmín','Rosa','Osmanthus'],['Vainilla','Ámbar','Pachulí','Cedro'],'empolvado, violeta y misterioso',(24,58),year=1999,concentration='Eau de Parfum',intensity='Muy intensa',use='classic')
# 460–469
add('DP01277','Floral frutal',['Manzana verde','Mandarina italiana','Osmanthus'],['Fresia amarilla','Magnolia','Borraja'],['Almizcle','Iris blanco'],'verde, frutal y juvenil',(16,40),year=2000,concentration='Eau de Toilette',use='fresh')
add('DP02304','Floral frutal',['Sandía','Limón','Mandarina'],['Magnolia','Rosa','Fresia'],['Almizcle','Cedro'],'acuático, cítrico y alegre',(16,38),year=2015,concentration='Eau de Toilette',use='fresh',confidence='medium')
add('DP02369','Floral frutal',['Maracuyá','Ron','Mandarina','Casis'],['Madreselva','Flor de azahar','Jazmín','Fresia'],['Vainilla','Almizcle','Sándalo','Benjuí'],'frutal, dulce y coqueto',(16,40),year=2012,concentration='Eau de Parfum',use='versatile')
add('DP02808','Floral frutal gourmand',['Malvavisco','Chocolate','Jengibre','Bergamota'],['Vainilla de Madagascar','Leche de coco','Jazmín'],['Crema batida','Azúcar','Almizcle','Maderas de cachemira'],'dulce, cremoso y juguetón',(16,38),year=2022,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('DP02880','Ámbar vainilla gourmand',['Espresso','Cacao'],['Biscotti','Jazmín'],['Caramelo','Vainilla','Almizcle'],'cafetero, chocolatoso y cremoso',(16,40),year=2024,concentration='Eau de Parfum',intensity='Intensa',use='night',confidence='medium',note='Nombre del catálogo contiene “Thooth”; conservar identidad operativa y revisar ortografía pública contra ficha exacta.')
add('DP02363','Floral frutal gourmand',['Naranja','Piña','Durazno','Frambuesa'],['Fresia','Almizcle','Mora'],['Chocolate oscuro','Vainilla','Ámbar','Coco'],'frutal, chocolatoso y dulce',(16,42),year=2012,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('DP02273','Floral frutal',['Pitahaya','Mandarina','Melón'],['Madreselva','Orquídea','Fresia'],['Caramelo','Vainilla','Almizcle'],'tropical, floral y dulce',(16,40),year=2013,concentration='Eau de Parfum',use='versatile',confidence='medium')
add('DP02863','Floral frutal',['Pera','Bergamota'],['Peonía','Jazmín'],['Sándalo','Almizcle'],'luminoso, limpio y femenino',(16,42),year=2024,concentration='Eau de Parfum',use='fresh',confidence='medium')
add('DP02643','Ámbar floral',['Toronja','Avellana','Peonía'],['Heliotropo','Orquídea negra'],['Vainilla','Vetiver','Sándalo'],'oscuro, floral y elegante',(20,50),year=2021,concentration='Parfum',intensity='Intensa',use='night')
add('DP01410','Floral',['Hoja de violeta','Bergamota','Cilantro'],['Gardenia','Peonía','Jazmín','Rosa'],['Almizcle blanco','Cedro','Iris'],'floral, limpio y clásico',(20,55),year=2002,concentration='Eau de Toilette',use='versatile')
# 470–479
add('DP02882','Ámbar floral',['Casis'],['Acorde de ron','Flor de azahar'],['Vainilla'],'vainillado, licoroso y sensual',(18,46),year=2025,concentration='Parfum Extradose',intensity='Muy intensa',use='night',confidence='medium',note='Lanzamiento 2025; validar concentración y pirámide exacta con sitio oficial.')
add('DP02753','Ámbar floral',['Casis','Bergamota','Pimienta rosa'],['Jazmín','Té de jazmín'],['Vainilla bourbon','Madera de cachemira','Guayaco'],'vainillado, amaderado y moderno',(18,48),year=2019,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('DP02839','Floral amaderada',['Té lapsang souchong','Bergamota'],['Jazmín'],['Extracto de vainilla'],'té, floral y vainillado',(18,44),year=2024,concentration='Eau de Parfum',use='versatile')
add('DP02757','Ámbar floral',['Vainilla bourbon','Ámbar'],['Jazmín'],['Benjuí'],'vainillado, ambarado y nocturno',(18,48),year=2023,concentration='Eau de Parfum Intense',intensity='Muy intensa',use='night')
add('DP02226','Floral frutal',['Yuzu','Granada','Acorde acuático'],['Peonía','Flor de loto','Magnolia'],['Almizcle','Caoba','Ámbar'],'acuático, floral y brillante',(16,46),year=2006,concentration='Eau de Toilette',use='fresh')
add('DP02857','Ámbar floral',['Especias','Pimienta rosa','Grosella negra'],['Nardo','Jazmín','Azahar'],['Ámbar','Sándalo','Vainilla'],'oscuro, especiado y cremoso',(20,52),year=2024,concentration='Parfum',intensity='Muy intensa',use='night',confidence='medium')
add('DP02302','Floral amaderada almizclada',['Limón siciliano','Granada','Bergamota'],['Flor de limón','Jazmín sambac','Peonía'],['Almizcle','Ambroxan','Sándalo','Notas amaderadas'],'cítrico, floral y poderoso',(18,48),year=2014,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('DP02600','Floral frutal',['Limón','Mandarina','Pimienta rosa'],['Guayaba','Fresia','Casis','Jazmín'],['Almizcle','Maderas claras','Cedro'],'cítrico, tropical y fresco',(16,42),year=2020,concentration='Eau de Toilette',use='fresh')
add('DP02177','Amaderada floral almizclada',['Bergamota','Higo verde','Cítricos','Pera'],['Cardamomo','Azucena','Jazmín'],['Cedro de Virginia','Olivo','Sándalo','Almizcle'],'verde, amaderado y mediterráneo',(18,50),year=2009,concentration='Eau de Toilette',use='fresh')
add('DP02262','Floral',['Limón de Amalfi','Pera','Bergamota','Neroli'],['Mimosa','Fresia','Nenúfar','Flor de azahar'],['Almizcle','Guayaco','Ámbar'],'cítrico, floral y luminoso',(16,48),year=2011,concentration='Eau de Toilette',use='fresh')
# 480–496 · Victoria's Secret
add('DP02833','Floral acuática',['Agua de mar'],['Fresia'],['Aloe vera','Manzanilla'],'acuático, limpio y ligero',(16,36),concentration='Body Mist',use='fresh',confidence='low',note='Body mist con información variable por edición; confirmar fórmula exacta por clave.')
add('DP02736','Amaderada floral almizclada',['Mandarina de Madagascar'],['Violeta egipcia'],['Sándalo australiano'],'almizclado, limpio y piel cálida',(18,44),year=2022,concentration='Eau de Parfum',use='versatile')
add('DP02661','Floral frutal',['Maracuyá','Toronja','Piña','Mandarina','Fresa'],['Peonía','Orquídea vainilla','Bayas rojas','Jazmín','Muguete'],['Almizcle','Notas amaderadas','Musgo de roble'],'frutal, floral y brillante',(16,42),year=2010,concentration='Eau de Parfum',use='fresh')
add('DP02466','Floral frutal',['Casis'],['Dalia'],['Maderas'],'oscuro, frutal y nocturno',(18,42),year=2017,concentration='Eau de Parfum',use='night',confidence='medium')
add('DP02737','Floral frutal',['Pomelo'],['Flor de peonía'],['Arena cálida'],'solar, cítrico y playero',(16,38),year=2022,concentration='Eau de Parfum',use='fresh',confidence='medium')
add('DP02514','Ámbar vainilla',['Coco'],['Muguete'],['Vainilla','Sándalo','Almizcle'],'coco, vainillado y cremoso',(16,40),concentration='Body Mist',use='versatile',confidence='medium')
add('DP02351','Floral frutal gourmand',['Manzana'],['Crema batida'],['Bergamota'],'cremoso, frutal y coqueto',(16,38),year=2014,concentration='Eau de Parfum',use='versatile',confidence='medium')
add('DP02201','Floral frutal',['Fresa'],['Jazmín'],['Vainilla'],'frutal, dulce y optimista',(16,36),concentration='Eau de Toilette',use='fresh',confidence='low',note='Colección descontinuada; pirámide de información limitada en fuentes públicas.')
add('DP02205','Floral frutal',['Maracuyá'],['Peonía'],['Almizcle'],'frutal, floral y alegre',(16,36),concentration='Eau de Toilette',use='fresh',confidence='low',note='Colección descontinuada; validar variante exacta por clave.')
add('DP02203','Floral frutal',['Frambuesa'],['Fresia'],['Vainilla'],'frutal, suave y juvenil',(16,36),concentration='Eau de Toilette',use='fresh',confidence='low',note='Colección descontinuada; validar variante exacta por clave.')
add('DP02310','Floral',['Narciso','Neroli'],['Peonía'],['Ámbar','Sándalo'],'floral, limpio y elegante',(18,44),year=2015,concentration='Eau de Parfum',use='versatile',confidence='medium')
add('DP02834','Floral frutal',['Manzana roja'],['Peonía'],['Almizcle'],'frutal, rosado y juvenil',(16,36),concentration='Body Mist',use='fresh',confidence='low',note='Nombre/edición de información pública limitada; mantener en revisión.')
add('DP02814','Floral frutal',['Manzana verde','Mandarina'],['Jazmín','Fresia'],['Almizcle','Maderas suaves'],'verde, floral y limpio',(16,38),concentration='Eau de Parfum',use='fresh',confidence='low',note='Validar si corresponde a Pink by Victoria’s Secret y su edición exacta.')
add('DP02350','Floral frutal',['Frambuesa'],['Peonía'],['Praliné'],'frutal, dulce y sensual',(18,42),year=2014,concentration='Eau de Parfum',use='night')
add('DP02832','Floral frutal',['Coco'],['Flor de tiaré'],['Vainilla'],'solar, tropical y cremoso',(16,38),concentration='Body Mist',use='fresh',confidence='low',note='Edición estacional; la fórmula puede variar por año.')
add('DP02786','Ámbar vainilla gourmand',['Bayas silvestres'],['Cacao','Fresia'],['Vainilla','Almizcle'],'chocolate, frutal y cremoso',(16,40),year=2023,concentration='Eau de Parfum',intensity='Intensa',use='night',confidence='medium')
add('DP02780','Floral frutal',['Manzana roja','Mandarina'],['Peonía','Fresia'],['Almizcle','Sándalo'],'floral, frutal y brillante',(16,40),year=2014,concentration='Eau de Parfum',use='fresh',confidence='medium')
# 497–504
add('DP02334','Ámbar floral',['Té','Bergamota','Osmanthus'],['Orquídea','Jazmín','Rosa','Fresia','Flor de azahar'],['Pachulí','Almizcle','Vainilla'],'floral, dulce y expansivo',(18,52),year=2005,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('DP02324','Ámbar vainilla',['Pera','Pimienta rosa','Flor de azahar'],['Café','Jazmín','Almendra amarga','Regaliz'],['Vainilla','Pachulí','Madera de cachemira','Cedro'],'cafetero, vainillado y nocturno',(18,50),year=2014,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('DP02866','Ámbar floral gourmand',['Mandarina verde','Pera'],['Flor de azahar','Malvavisco'],['Café','Vainilla','Pachulí'],'malvavisco, café y luminoso',(18,44),year=2024,concentration='Eau de Parfum',intensity='Intensa',use='night',confidence='medium')
add('DP02756','Ámbar vainilla',['Pera','Canela'],['Jazmín sambac','Notas solares'],['Vainilla de Madagascar','Vainilla bourbon','Absoluto de vainilla','Pachulí'],'vainilla intensa, cálida y sensual',(20,52),year=2022,concentration='Le Parfum',intensity='Muy intensa',use='night')
add('DP02816','Floral frutal gourmand',['Cereza','Mandarina verde'],['Jazmín','Flor de azahar','Té negro'],['Café','Vainilla','Pachulí'],'cereza, café y seductor',(18,46),year=2024,concentration='Eau de Parfum',intensity='Intensa',use='night')
add('DP02515','Ámbar fougère',['Lavanda','Mandarina','Casis','Petitgrain'],['Lavanda','Flor de azahar','Jazmín'],['Vainilla de Madagascar','Almizcle','Cedro','Ámbar gris'],'lavanda, vainilla y elegante',(18,52),year=2019,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('DP02800','Ámbar floral',['Aldehídos','Bergamota','Mandarina'],['Lavanda','Flor de azahar'],['Vainilla','Ámbar gris'],'metálico, lavanda y brillante',(20,52),year=2023,concentration='Parfum',intensity='Muy intensa',use='versatile')
add('DP02695','Ámbar floral',['Jengibre','Azafrán','Mandarina','Bergamota'],['Flor de azahar','Lavanda'],['Vainilla bourbon','Miel','Haba tonka','Vetiver'],'cálido, floral y meloso',(20,52),year=2022,concentration='Le Parfum',intensity='Muy intensa',use='night')
# 505–547 · Unisex
add('UP01171','Aromática acuática',['Limón','Menta','Casis','Pimienta rosa'],['Manzana','Incienso','Cedro'],['Jengibre','Sándalo','Pachulí','Jazmín'],'fresco, acuático y moderno',(18,45),year=2022,concentration='Eau de Parfum',use='fresh')
add('UP01092','Ámbar vainilla',['Bergamota','Notas verdes'],['Melón','Piña','Ámbar','Dulces'],['Vainilla','Almizcle','Notas amaderadas'],'dulce, frutal y expansivo',(18,48),year=2018,concentration='Eau de Parfum',intensity='Muy intensa',use='versatile')
add('UP01077','Ámbar floral',['Pera','Avellana','Incienso'],['Osmanthus','Rosa','Azafrán','Jazmín sambac'],['Sándalo','Vainilla','Akigalawood','Ámbar gris','Lábdano'],'cremoso, floral y sofisticado',(22,58),year=2023,concentration='Eau de Parfum',intensity='Muy intensa',use='night',note='El diseñador aparece como AMOUGE en catálogo; conservar clave e identidad operativa y validar ortografía pública Amouage.')
add('UP01170','Ámbar vainilla gourmand',['Chocolate','Café','Pistache'],['Praliné','Avellana','Vainilla'],['Ámbar','Almizcle','Maderas'],'chocolate, café y gourmand',(18,46),year=2025,concentration='Eau de Parfum',intensity='Muy intensa',use='night',confidence='medium',note='Lanzamiento reciente; validar pirámide exacta por clave.')
add('UP01101','Amaderada especiada',['Toronja','Pimienta rosa','Jazmín'],['Abeto','Azafrán','Cedro'],['Ámbar','Musgo','Almizcle'],'especiado, amaderado y oscuro',(18,46),year=2023,concentration='Eau de Parfum',intensity='Intensa',use='night')
add('UP01174','Amaderada almizclada',['Jengibre','Cardamomo','Bergamota'],['Durazno','Jazmín','Agua de coco'],['Sándalo','Almizcle','Maderas'],'limpio, amaderado y moderno',(18,44),year=2025,concentration='Eau de Parfum',use='versatile',confidence='medium',note='Lanzamiento reciente; confirmar fórmula oficial definitiva.')
add('UP01042','Ámbar vainilla',['Coñac'],['Canela','Haba tonka','Roble'],['Praliné','Vainilla','Sándalo'],'licoroso, canela y gourmand',(20,58),year=2020,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01018','Ámbar vainilla',['Ron','Chocolate oscuro'],['Café','Caramelo','Almendra','Heliotropo'],['Caña de azúcar','Sándalo','Vetiver'],'oscuro, café y licoroso',(22,58),year=2017,concentration='Extrait de Parfum',intensity='Muy intensa',use='night')
add('UP01017','Floral amaderada almizclada',['Lavanda','Notas verdes','Bergamota','Menta','Enebro','Mandarina'],['Hierba verde','Durazno','Jazmín','Fresia','Magnolia','Orquídea'],['Almizcle','Sándalo','Cedro','Vainilla','Ámbar'],'verde, limpio y almizclado',(16,55),year=1996,concentration='Eau de Toilette',use='fresh')
add('UP01002','Cítrica aromática',['Limón','Notas verdes','Bergamota','Mandarina','Piña','Cardamomo','Papaya'],['Muguete','Jazmín','Violeta','Rosa','Nuez moscada','Fresia'],['Acordes verdes','Almizcle','Cedro','Sándalo','Musgo de roble'],'cítrico, verde y limpio',(16,58),year=1994,concentration='Eau de Toilette',use='fresh')
add('UP01005','Amaderada floral almizclada',['Sal marina','Notas afrutadas'],['Limón siciliano','Bergamota','Iris','Mandarina'],['Notas marinas','Almizcle','Notas amaderadas'],'salado, frutal y elegante',(20,58),year=1995,concentration='Eau de Parfum',use='fresh')
add('UP01097','Floral frutal',['Cereza negra','Frambuesa','Bergamota'],['Praliné','Heliotropo','Rosa de Damasco','Jazmín'],['Palo santo','Haba tonka','Madera de guayaco','Ambrettolide'],'cereza, ahumado y sensual',(18,50),year=2022,concentration='Eau de Parfum',intensity='Intensa',use='night')
add('UP01164','Amaderada aromática',['Manzana','Lichi','Rosa'],['Ciruela','Jazmín'],['Musgo','Vainilla','Pachulí'],'frutal, verde y amaderado',(16,46),year=2023,concentration='Eau de Parfum',intensity='Intensa',use='versatile',note='La marca aparece como LATAFFA; conservar identidad operativa y validar ortografía pública Lattafa.')
add('UP01095','Aromática especiada',['Canela','Nuez moscada','Bergamota'],['Dátiles','Praliné','Tuberosa','Mahonia'],['Vainilla','Haba tonka','Benjuí','Mirra','Amberwood','Akigalawood'],'canela, dátiles y gourmand',(18,55),year=2022,concentration='Eau de Parfum',intensity='Muy intensa',use='night',note='La marca aparece como LATAFFA; conservar identidad operativa y validar ortografía pública Lattafa.')
add('UP01111','Ámbar vainilla gourmand',['Canela','Cardamomo','Jengibre'],['Praliné','Frutas confitadas','Flores blancas'],['Café','Vainilla','Haba tonka','Benjuí','Almizcle'],'café, canela y dulce',(18,55),year=2023,concentration='Eau de Parfum',intensity='Muy intensa',use='night',note='La marca aparece como LATAFFA; conservar identidad operativa y validar ortografía pública Lattafa.')
add('UP01000','Amaderada aromática',['Cardamomo','Violeta'],['Iris','Papiro'],['Sándalo','Cedro','Cuero','Ámbar'],'sándalo, cuero y seco',(20,58),year=2011,concentration='Eau de Parfum',intensity='Intensa',use='versatile',note='La marca aparece como LELABO; conservar identidad operativa y normalizar públicamente Le Labo.')
add('UP01090','Ámbar amaderada',['Oud'],['Incienso','Rosa','Frambuesa'],['Benjuí','Abedul','Ámbar gris','Azafrán'],'oud, ahumado y opulento',(24,65),year=2018,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01099','Cítrica aromática',['Cidra','Naranja','Menta','Casis','Cilantro'],['Chabacano','Albahaca','Semillas de zanahoria','Rosa'],['Higo','Dátiles','Ambreta'],'cítrico, frutal y verde',(18,52),year=2023,concentration='Eau de Parfum',use='fresh')
add('UP01140','Ámbar floral',['Almendra amarga','Azafrán'],['Jazmín egipcio','Cedro'],['Ámbar gris','Almizcle','Notas amaderadas'],'ambarado, almendrado y mineral',(20,60),year=2017,concentration='Extrait de Parfum',intensity='Muy intensa',use='night',note='La marca aparece como KURKDIJAN en catálogo; validar ortografía pública Kurkdjian.')
add('UP01100','Aromática fougère',['Pimienta','Flor de azahar','Pachulí'],['Lavanda','Café','Leche','Haba tonka','Benjuí'],['Vainilla','Cedro','Vetiver'],'café, lavanda y cremoso',(18,50),year=2019,concentration='Eau de Toilette',use='versatile')
add('UP01079','Ámbar vainilla',['Notas florales'],['Rosa','Café'],['Vainilla','Almizcle blanco','Ámbar'],'café, rosa y vainilla',(18,58),year=2013,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01087','Floral frutal',['Limón','Orégano','Sorbete'],['Arena','Fresia','Jazmín'],['Almizcle','Ciprés','Vetiver'],'cítrico, mineral y marino',(16,46),year=2023,concentration='Eau de Toilette',use='fresh')
add('UP01136','Ámbar amaderada',['Bergamota','Frutas'],['Ámbar','Jazmín'],['Oud','Vainilla','Almizcle'],'ambarado, frutal y amaderado',(20,55),concentration='Eau de Parfum',intensity='Intensa',use='night',confidence='low',note='Información pública limitada; confirmar identidad y pirámide por clave.')
add('UP01081','Ámbar amaderada',['Almendra','Mandarina','Notas acuáticas','Bergamota'],['Civeta','Rosa','Gardenia','Nenúfar'],['Madera de guayaco','Oud','Sándalo','Ámbar','Pimienta rosa','Musgo de roble','Café'],'amaderado, animal y complejo',(24,62),year=2017,concentration='Parfum',intensity='Muy intensa',use='night')
add('UP01067','Floral frutal',['Durazno','Naranja sanguina','Cardamomo','Heliotropo'],['Ron','Coñac','Davana','Jazmín'],['Pachulí','Vainilla','Sándalo','Benjuí','Cachemira','Styrax','Vetiver'],'durazno, licoroso y sensual',(20,58),year=2020,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01068','Amaderada especiada',['Pimienta rosa','Pimienta negra'],['Cedro atlas','Cedro de Virginia'],['Madera de guayaco','Vetiver','Pachulí'],'seco, cedro y especiado',(22,62),year=2021,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('UP01069','Aromática acuática',['Limón italiano'],['Ciprés','Roble'],['Madera flotante','Ámbar','Lábdano'],'marino, amaderado y elegante',(22,60),year=2022,concentration='Parfum',intensity='Intensa',use='fresh')
add('UP01085','Floral frutal',['Cereza','Jengibre'],['Jazmín sambac'],['Pimienta rosa','Ambrettolide','Almizcle'],'cereza, picante y luminoso',(18,48),year=2023,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('UP01030','Cuero',['Lavanda','Salvia'],['Cuero','Almendra amarga','Vainilla','Iris'],['Cuero','Haba tonka','Cachemira','Maderas blancas','Ámbar'],'cuero, almendrado y provocador',(22,60),year=2017,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01007','Ámbar floral',['Cereza negra','Almendra amarga','Licor'],['Cereza ácida','Ciruela','Rosa turca','Jazmín sambac'],['Haba tonka','Vainilla','Canela','Benjuí','Sándalo','Clavo','Cedro','Pachulí','Vetiver'],'cereza, licoroso y oscuro',(20,58),year=2018,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01031','Cítrica aromática',['Limón','Toronja','Menta','Albahaca','Estragón','Casis'],['Flor de azahar','Jazmín','Salvia sclarea','Cilantro','Pimienta negra'],['Almizcle','Vetiver','Lábdano','Ámbar','Civeta'],'cítrico, herbal y mediterráneo',(20,58),year=2014,concentration='Eau de Parfum',use='fresh')
add('UP01105','Ámbar amaderada',['Mirra','Resinas'],['Vainilla'],['Sándalo','Ámbar'],'resinoso, vainilla y oscuro',(22,60),year=2023,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01046','Cuero',['Cardamomo'],['Cuero','Jazmín sambac'],['Ámbar','Musgo','Pachulí'],'cuero, especiado y sensual',(20,60),year=2018,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01063','Amaderada acuática',['Sal marina','Algas','Pimienta rosa'],['Oud','Styrax'],['Abeto','Ámbar gris'],'marino, mineral y amaderado',(22,60),year=2017,concentration='Eau de Parfum',intensity='Intensa',use='fresh')
add('UP01047','Ámbar amaderada',['Palo de rosa','Cardamomo','Pimienta'],['Oud','Sándalo','Vetiver'],['Haba tonka','Vainilla','Ámbar'],'oud, cremoso y refinado',(22,62),year=2007,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('UP01020','Ámbar floral',['Rosa china','Peonía'],['Mirra','Lábdano'],['Pachulí','Sándalo'],'rosa, resinoso y elegante',(22,60),year=2022,concentration='Eau de Parfum',intensity='Intensa',use='night')
add('UP01029','Ámbar floral',['Pistache','Bergamota','Cardamomo','Pimienta rosa'],['Nardo','Ylang-ylang','Jazmín'],['Coco','Ámbar','Haba tonka','Benjuí'],'solar, coco y cremoso',(20,58),year=2016,concentration='Eau de Parfum',intensity='Intensa',use='fresh')
add('UP01071','Amaderada especiada',['Whisky'],['Canela','Cilantro','Especias'],['Tabaco','Oud','Incienso','Sándalo','Pachulí','Benjuí','Vainilla'],'tabaco, whisky y ahumado',(24,65),year=2013,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01028','Ámbar especiada',['Hoja de tabaco','Especias'],['Vainilla','Cacao','Haba tonka','Flor de tabaco'],['Frutos secos','Notas amaderadas'],'tabaco, vainilla y dulce',(22,65),year=2007,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01116','Cuero',['Frambuesa','Azafrán','Tomillo'],['Incienso','Jazmín'],['Cuero','Ante','Ámbar','Notas amaderadas'],'cuero, frambuesa y ahumado',(22,62),year=2007,concentration='Eau de Parfum',intensity='Muy intensa',use='night')
add('UP01141','Ámbar vainilla',['Cilantro','Azafrán'],['Café','Cebada','Narciso','Frangipani'],['Vainilla de Madagascar','Ante','Caoba','Tabaco'],'vainilla, café y especiado',(22,60),year=2024,concentration='Eau de Parfum',intensity='Muy intensa',use='night',confidence='medium',note='Reformulación 2024; no mezclar con la versión anterior.')
add('UP01147','Chipre floral',['Piña','Jacinto'],['Iris','Jazmín','Pimienta rosa'],['Almizcle','Vetiver','Pachulí','Ámbar','Vainilla'],'frutal, almizclado y elegante',(20,58),year=2009,concentration='Eau de Parfum',intensity='Intensa',use='versatile')
add('UP01129','Ámbar frutal',['Naranja siciliana','Bergamota','Limón siciliano'],['Frutas tropicales'],['Almizcle blanco','Ámbar','Vainilla de Madagascar'],'frutal, almizclado y expansivo',(18,55),year=2019,concentration='Eau de Parfum',intensity='Muy intensa',use='versatile')

def f_url(item): return f"https://www.fragrantica.com/search/?query={quote_plus(item['designer']+' '+item['name'])}"
def p_url(item): return f"https://perfumoteca.com/catalogo?search={quote_plus(item['code'])}"
def g_url(item): return f"https://glass-essence.com/?s={quote_plus(item['code'])}&post_type=product"

def make_core(item,p):
    core=base.make_core(item,p)
    core['provenance']['lastReviewedAt']=TODAY
    core['provenance']['reviewedBy']='PRIVÉ — Base Maestra Lote 006'
    core['provenance']['sources']=[
      {'type':'internal','title':'Catálogo operativo PRIVÉ — nombre, imagen, categoría y clave','url':None,'accessedAt':TODAY,'supports':['identity']},
      {'type':'community','title':'Fragrantica — nombre, versión, imagen y contraste olfativo','url':f_url(item),'accessedAt':TODAY,'supports':['identity','classification','olfactory']},
      {'type':'editorial','title':f"Perfumoteca — búsqueda exacta por clave {item['code']}",'url':p_url(item),'accessedAt':TODAY,'supports':['identity','olfactory']},
      {'type':'supplier','title':f"Glass Essence — respaldo técnico por clave {item['code']}",'url':g_url(item),'accessedAt':TODAY,'supports':['classification','olfactory']},
      {'type':'official','title':f"Sitio oficial de {item['designer']} — contraste de lanzamiento, concentración y narrativa",'url':f"https://www.google.com/search?q={quote_plus(item['designer']+' '+item['name']+' official fragrance notes')}",'accessedAt':TODAY,'supports':['identity','classification','olfactory']},
      {'type':'community','title':'Fuentes especializadas y reseñas — contraste de uso, clima, desempeño y percepción','url':f"https://www.google.com/search?q={quote_plus(item['designer']+' '+item['name']+' perfume reviews notes longevity')}",'accessedAt':TODAY,'supports':['performance','recommendation']},
    ]
    core['provenance']['notes']=('Lote maestro 006. Fragrantica y Perfumoteca se mantienen como fuentes principales complementarias; '
      'el sitio oficial, Glass Essence y fuentes especializadas sirven para contrastar o completar datos ausentes. '
      +(p['note'] or 'Nombre e imagen conservados desde el catálogo operativo; la clave guía la consulta exacta del proveedor.')+
      ' La ficha permanece en review; no se inventan datos ante diferencias. La edad es orientativa y nunca restrictiva.')
    return core

def main():
    catalog=json.loads(CATALOG_PATH.read_text(encoding='utf-8'))
    batch=catalog[BATCH_START:BATCH_START+BATCH_SIZE]
    expected={x['code'] for x in batch}; missing=[x['code'] for x in batch if x['code'] not in P]; extra=sorted(set(P)-expected)
    if missing or extra: raise SystemExit(f'Perfiles incompletos. Faltan={missing}; sobran={extra}')
    filenames=[]; rows=[]
    for pos,item in enumerate(batch,BATCH_START+1):
      p=P[item['code']]; fn=f"{item['id']}.json"; (CORE_DIR/fn).write_text(json.dumps(make_core(item,p),ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); filenames.append(fn)
      rows.append({'position':pos,'code':item['code'],'designer':item['designer'],'name':item['name'],'fragrantica_reference':f_url(item),'perfumoteca_lookup_key':item['code'],'provider_lookup':g_url(item),'status':'review','confidence':p['confidence'],'review_notes':p['note']})
    mp=CORE_DIR/'catalog.json'; m=json.loads(mp.read_text(encoding='utf-8'))
    m.update({'schemaVersion':'1.0.0','batchSize':50,'activeBatchSize':BATCH_SIZE,'activeBatch':6,
      'reviewPolicy':'Regla general: lotes de 50 fragancias. Los lotes 002–005 fueron ampliaciones autorizadas de 100; el lote 006 cierra la fase con las 97 fragancias restantes. Cada lote se valida antes de activar el siguiente.',
      'sourcePolicy':'Fragrantica y Perfumoteca son fuentes principales complementarias. Nombre/versión/imagen desde Fragrantica; clave y referencia olfativa del proveedor desde Perfumoteca. Sitios oficiales, Glass Essence y fuentes especializadas se usan para contrastar y completar datos ausentes.',
      'agePolicy':'La edad es una tendencia orientativa y secundaria; nunca una restricción.',
      'batches':list(m['batches'])+[{'id':'batch-006','status':'review','createdAt':TODAY,'count':len(filenames),'codes':[x['code'] for x in batch]}],
      'perfumes':list(m['perfumes'])+filenames})
    mp.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    with (CORE_DIR/'review-batch-006.csv').open('w',newline='',encoding='utf-8-sig') as fh:
      w=csv.DictWriter(fh,fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)
    print(f'Generadas {len(filenames)} fichas Core en lote 006; total activo={len(m["perfumes"])}')
if __name__=='__main__': main()
