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

const errors = [];
const expectedCategories = new Set(["Caballero", "Dama", "Unisex"]);
const categoryCounts = Object.fromEntries([...expectedCategories].map(category => [
  category,
  legacy.filter(item => item.category === category).length
]));

const checks = [
  [legacy.length === 547, `Se esperaban 547 perfumes y se encontraron ${legacy.length}`],
  [categoryCounts.Caballero === 305, `Caballero: se esperaban 305 y se encontraron ${categoryCounts.Caballero}`],
  [categoryCounts.Dama === 199, `Dama: se esperaban 199 y se encontraron ${categoryCounts.Dama}`],
  [categoryCounts.Unisex === 43, `Unisex: se esperaban 43 y se encontraron ${categoryCounts.Unisex}`],
  [legacy.every(item => item.designer && item.name && item.code && expectedCategories.has(item.category)), "Hay registros incompletos o categorías inválidas"],
  [core.every(item => legacy.some(perfume => perfume.code === item.identity?.priveCode)), "Core contiene una fragancia eliminada del catálogo operativo"]
];

for (const [values, label] of [
  [legacy.map(item => item.code), "Códigos del catálogo"],
  [legacy.map(item => item.id), "IDs del catálogo"],
  [core.map(item => item.identity?.priveCode), "Códigos Core"],
  [core.map(item => item.id), "IDs Core"]
]) {
  const repeated = duplicates(values);
  if (repeated.length) errors.push(`${label} duplicados: ${repeated.join(", ")}`);
}

checks.forEach(([ok, message]) => { if (!ok) errors.push(message); });

if (errors.length) {
  errors.forEach(error => console.error(`❌ ${error}`));
  process.exit(1);
}

console.log(`✅ Catálogo v2.0 validado: ${legacy.length} perfumes, sin claves ni IDs duplicados`);
