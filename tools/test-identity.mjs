import fs from "node:fs";

const legacy = JSON.parse(fs.readFileSync("data/perfumes.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("data/core/catalog.json", "utf8"));
const core = catalog.perfumes.map(file => JSON.parse(fs.readFileSync(`data/core/${file}`, "utf8")));

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

const duplicateLegacyCodes = duplicates(legacy.map(item => item.code));
const duplicateLegacyIds = duplicates(legacy.map(item => item.id));
const duplicateCoreCodes = duplicates(core.map(item => item.identity?.priveCode));
const duplicateCoreIds = duplicates(core.map(item => item.id));
const expectedCanonical = [
  legacy.some(item => item.code === "CP00850" && item.designer === "HUGO BOSS" && item.name === "HUGO MAN"),
  !legacy.some(item => item.code === "CP00850" && item.name === "HUGO"),
  legacy.some(item => item.code === "CP01079" && item.designer === "HALLOWEEN" && item.name === "HALLOWEEN MAN"),
  !legacy.some(item => item.code === "CP01079" && item.designer === "JESUS DEL POZO")
];

const errors = [];
if (duplicateLegacyCodes.length) errors.push(`Códigos heredados duplicados: ${duplicateLegacyCodes.join(", ")}`);
if (duplicateLegacyIds.length) errors.push(`IDs heredados duplicados: ${duplicateLegacyIds.join(", ")}`);
if (duplicateCoreCodes.length) errors.push(`Códigos Core duplicados: ${duplicateCoreCodes.join(", ")}`);
if (duplicateCoreIds.length) errors.push(`IDs Core duplicados: ${duplicateCoreIds.join(", ")}`);
if (!expectedCanonical.every(Boolean)) errors.push("Los registros canónicos CP00850 o CP01079 no quedaron correctamente normalizados");
if (legacy.length !== 323) errors.push(`Se esperaban 323 registros heredados y se encontraron ${legacy.length}`);

if (errors.length) {
  errors.forEach(error => console.error(`❌ ${error}`));
  process.exit(1);
}

console.log("✅ Identidad v1.3.9.1 validada: 323 perfumes, sin códigos ni IDs duplicados");
