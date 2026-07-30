import fs from "node:fs";

const legacy = JSON.parse(fs.readFileSync("data/perfumes.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("data/core/catalog.json", "utf8"));
const expected = legacy.slice(0, 50);
const expectedCodes = expected.map(item => item.code);
const errors = [];

if (manifest.batchSize !== 50) errors.push("catalog.json debe fijar batchSize en 50");
if (manifest.activeBatch !== 1) errors.push("activeBatch debe ser 1");
if (!Array.isArray(manifest.perfumes) || manifest.perfumes.length !== 50) errors.push("El manifiesto debe activar exactamente 50 fichas");
if (manifest.batches?.[0]?.count !== 50) errors.push("batch-001 debe declarar 50 fichas");
if (JSON.stringify(manifest.batches?.[0]?.codes || []) !== JSON.stringify(expectedCodes)) {
  errors.push("Los códigos del lote 001 no coinciden con los primeros 50 perfumes del catálogo operativo");
}

const ids = new Set();
const codes = new Set();
const loadedCodes = [];
for (const filename of manifest.perfumes || []) {
  const file = `data/core/${filename}`;
  if (!fs.existsSync(file)) {
    errors.push(`No existe ${file}`);
    continue;
  }
  const perfume = JSON.parse(fs.readFileSync(file, "utf8"));
  const code = perfume.identity?.priveCode;
  loadedCodes.push(code);
  if (ids.has(perfume.id)) errors.push(`ID duplicado: ${perfume.id}`);
  if (codes.has(code)) errors.push(`Clave duplicada: ${code}`);
  ids.add(perfume.id);
  codes.add(code);

  const legacyItem = legacy.find(item => item.code === code);
  if (!legacyItem) errors.push(`${code} no existe en el catálogo operativo`);
  if (legacyItem && perfume.identity?.audience !== legacyItem.category) errors.push(`${code} tiene una categoría distinta al catálogo operativo`);
  if (!perfume.classification?.family) errors.push(`${code} no tiene familia olfativa`);
  if (!perfume.classification?.accords?.length) errors.push(`${code} no tiene acordes`);
  const noteCount = ["topNotes", "heartNotes", "baseNotes"].reduce((sum, field) => sum + (perfume.olfactory?.[field]?.length || 0), 0);
  if (!noteCount) errors.push(`${code} no tiene notas olfativas`);
  if (!perfume.content?.shortDescription) errors.push(`${code} no tiene descripción`);
  if (!perfume.recommendation?.occasions?.length) errors.push(`${code} no tiene ocasiones`);
  if (!perfume.recommendation?.climates?.length) errors.push(`${code} no tiene climas`);

  const age = perfume.recommendation?.recommendedAge || {};
  if (age.framing !== "tendency") errors.push(`${code}: la edad no está marcada como tendencia`);
  if (age.isRestrictive !== false) errors.push(`${code}: la edad debe ser no restrictiva`);
  if (!Number.isInteger(age.min) || !Number.isInteger(age.max) || age.min > age.max) errors.push(`${code}: rango de edad inválido`);
  const guidance = String(age.guidance || "").toLowerCase();
  if (!guidance.includes("orientativ") || !guidance.includes("cualquier edad")) errors.push(`${code}: falta orientación amable sobre la edad`);
}

if (JSON.stringify(loadedCodes) !== JSON.stringify(expectedCodes)) errors.push("El orden del lote no coincide con el catálogo operativo");

if (errors.length) {
  errors.forEach(error => console.error(`❌ ${error}`));
  process.exit(1);
}
console.log("✅ Lote maestro 001 validado: 50 fichas, orden correcto, sin duplicados y con edad orientativa no restrictiva");
