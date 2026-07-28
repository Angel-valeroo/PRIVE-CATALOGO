import fs from "node:fs";
import path from "node:path";

const file = process.argv[2] || "data/core/cp02446-afnan-9pm.json";
const absolute = path.resolve(process.cwd(), file);
const perfume = JSON.parse(fs.readFileSync(absolute, "utf8"));
const errors = [];

const required = ["schemaVersion", "id", "status", "identity", "classification", "olfactory", "recommendation", "content", "provenance"];
for (const key of required) if (!(key in perfume)) errors.push(`Falta el campo raíz: ${key}`);
if (perfume.schemaVersion !== "1.0.0") errors.push("schemaVersion debe ser 1.0.0");
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(perfume.id || "")) errors.push("id debe usar kebab-case");
if (!/^[A-Z]{2}[0-9]{5}$/.test(perfume.identity?.priveCode || "")) errors.push("identity.priveCode debe tener formato CP00000");
if (!["Caballero", "Dama", "Unisex"].includes(perfume.identity?.audience)) errors.push("identity.audience no es válido");
for (const field of ["topNotes", "heartNotes", "baseNotes"]) {
  if (!Array.isArray(perfume.olfactory?.[field])) errors.push(`olfactory.${field} debe ser una lista`);
}
for (const field of ["occasions", "contexts", "climates", "seasons"]) {
  if (!Array.isArray(perfume.recommendation?.[field])) errors.push(`recommendation.${field} debe ser una lista`);
}

if (errors.length) {
  console.error(`❌ ${path.basename(file)} no pasó la validación básica:`);
  errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}
console.log(`✅ ${path.basename(file)} pasó la validación básica de PRIVÉ Core Database v1.0.0`);
