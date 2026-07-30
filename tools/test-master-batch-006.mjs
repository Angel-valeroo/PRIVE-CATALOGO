import fs from "node:fs";

const legacy = JSON.parse(fs.readFileSync("data/perfumes.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("data/core/catalog.json", "utf8"));
const expectedFirst = legacy.slice(0, 50);
const expectedSecond = legacy.slice(50, 150);
const expectedThird = legacy.slice(150, 250);
const expectedFourth = legacy.slice(250, 350);
const expectedFifth = legacy.slice(350, 450);
const expectedSixth = legacy.slice(450, 547);
const expectedAll = legacy.slice(0, 547);
const errors = [];

if (manifest.batchSize !== 50) errors.push("batchSize general debe conservarse en 50");
if (manifest.activeBatchSize !== 97) errors.push("activeBatchSize debe ser 97 para el lote 006 de cierre");
if (manifest.activeBatch !== 6) errors.push("activeBatch debe ser 6");
if (!Array.isArray(manifest.perfumes) || manifest.perfumes.length !== 547) errors.push("El manifiesto debe activar 547 fichas en total");
if (manifest.batches?.length !== 6) errors.push("El manifiesto debe contener exactamente seis lotes");
if (manifest.batches?.[0]?.count !== 50) errors.push("batch-001 debe conservar 50 fichas");
if (manifest.batches?.[1]?.count !== 100) errors.push("batch-002 debe conservar 100 fichas");
if (manifest.batches?.[2]?.count !== 100) errors.push("batch-003 debe declarar 100 fichas");
if (manifest.batches?.[3]?.count !== 100) errors.push("batch-004 debe declarar 100 fichas");
if (manifest.batches?.[4]?.count !== 100) errors.push("batch-005 debe declarar 100 fichas");
if (manifest.batches?.[5]?.count !== 97) errors.push("batch-006 debe declarar 97 fichas");
if (JSON.stringify(manifest.batches?.[0]?.codes || []) !== JSON.stringify(expectedFirst.map(x => x.code))) errors.push("Los códigos del lote 001 cambiaron");
if (JSON.stringify(manifest.batches?.[1]?.codes || []) !== JSON.stringify(expectedSecond.map(x => x.code))) errors.push("Los códigos del lote 002 cambiaron");
if (JSON.stringify(manifest.batches?.[2]?.codes || []) !== JSON.stringify(expectedThird.map(x => x.code))) errors.push("Los códigos del lote 003 no coinciden con las posiciones 151–250");
if (JSON.stringify(manifest.batches?.[3]?.codes || []) !== JSON.stringify(expectedFourth.map(x => x.code))) errors.push("Los códigos del lote 004 no coinciden con las posiciones 251–350");
if (JSON.stringify(manifest.batches?.[4]?.codes || []) !== JSON.stringify(expectedFifth.map(x => x.code))) errors.push("Los códigos del lote 006 no coinciden con las posiciones 351–450");
if (JSON.stringify(manifest.batches?.[5]?.codes || []) !== JSON.stringify(expectedSixth.map(x => x.code))) errors.push("Los códigos del lote 006 no coinciden con las posiciones 451–547");
if (!String(manifest.sourcePolicy || "").includes("Fragrantica") || !String(manifest.sourcePolicy || "").includes("Perfumoteca")) errors.push("Falta la política de fuentes duales");

const ids = new Set();
const codes = new Set();
const loadedCodes = [];
for (const filename of manifest.perfumes || []) {
  const file = `data/core/${filename}`;
  if (!fs.existsSync(file)) { errors.push(`No existe ${file}`); continue; }
  const perfume = JSON.parse(fs.readFileSync(file, "utf8"));
  const code = perfume.identity?.priveCode;
  loadedCodes.push(code);
  if (ids.has(perfume.id)) errors.push(`ID duplicado: ${perfume.id}`);
  if (codes.has(code)) errors.push(`Clave duplicada: ${code}`);
  ids.add(perfume.id); codes.add(code);

  const legacyItem = legacy.find(item => item.code === code);
  if (!legacyItem) errors.push(`${code} no existe en catálogo operativo`);
  if (legacyItem && perfume.identity?.name !== legacyItem.name) errors.push(`${code}: nombre diferente al catálogo operativo`);
  if (legacyItem && perfume.identity?.brand !== legacyItem.designer) errors.push(`${code}: diseñador diferente al catálogo operativo`);
  if (legacyItem && perfume.identity?.audience !== legacyItem.category) errors.push(`${code}: categoría diferente al catálogo operativo`);
  if (!perfume.classification?.family) errors.push(`${code}: falta familia`);
  if (!perfume.classification?.accords?.length) errors.push(`${code}: faltan acordes`);
  const noteCount = ["topNotes","heartNotes","baseNotes"].reduce((sum, field) => sum + (perfume.olfactory?.[field]?.length || 0), 0);
  if (!noteCount) errors.push(`${code}: faltan notas olfativas`);
  if (!perfume.content?.shortDescription) errors.push(`${code}: falta descripción`);

  const age = perfume.recommendation?.recommendedAge || {};
  if (age.framing !== "tendency" || age.isRestrictive !== false) errors.push(`${code}: edad no orientativa/no restrictiva`);
  const guidance = String(age.guidance || "").toLowerCase();
  if (!guidance.includes("orientativ") || !guidance.includes("cualquier edad")) errors.push(`${code}: guía de edad insuficiente`);

  if (expectedSixth.some(item => item.code === code)) {
    if (perfume.status !== "review") errors.push(`${code}: el lote 006 debe estar en review`);
    const sources = perfume.provenance?.sources || [];
    const titles = sources.map(source => source.title || "");
    if (!titles.some(title => title.includes("Fragrantica"))) errors.push(`${code}: falta Fragrantica en procedencia`);
    if (!titles.some(title => title.includes("Perfumoteca") && title.includes(code))) errors.push(`${code}: falta búsqueda Perfumoteca por clave`);
    if (!titles.some(title => title.includes("Glass Essence") && title.includes(code))) errors.push(`${code}: falta respaldo técnico por clave`);
    const reviewText = String(perfume.provenance?.notes || "").toLowerCase();
    if (!reviewText.includes("no se inventan datos")) errors.push(`${code}: falta política explícita ante diferencias`);
  }
}

if (JSON.stringify(loadedCodes) !== JSON.stringify(expectedAll.map(x => x.code))) errors.push("El orden activo no coincide con los primeros 250 perfumes");

const report = "data/core/review-batch-006.csv";
if (!fs.existsSync(report)) errors.push("Falta review-batch-006.csv");
else {
  const rows = fs.readFileSync(report, "utf8").trim().split(/\r?\n/);
  if (rows.length !== 98) errors.push(`El reporte debe tener encabezado + 97 filas; tiene ${rows.length}`);
}

if (errors.length) {
  errors.forEach(error => console.error(`❌ ${error}`));
  process.exit(1);
}
console.log("✅ Lote maestro 006 validado: 97 fichas nuevas, 547 activas, orden correcto y fuentes duales registradas");
