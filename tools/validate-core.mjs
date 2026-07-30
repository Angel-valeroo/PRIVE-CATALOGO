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
if (!["draft", "review", "verified", "archived"].includes(perfume.status)) errors.push("status no es válido");

for (const field of ["topNotes", "heartNotes", "baseNotes"]) {
  if (!Array.isArray(perfume.olfactory?.[field])) errors.push(`olfactory.${field} debe ser una lista`);
}
if (!["unknown", "low", "medium", "high"].includes(perfume.olfactory?.notePyramidConfidence)) {
  errors.push("olfactory.notePyramidConfidence no es válido");
}
if (!perfume.classification?.family) errors.push("classification.family es obligatorio en la base maestra");
if (!Array.isArray(perfume.classification?.accords) || !perfume.classification.accords.length) {
  errors.push("classification.accords debe contener al menos un acorde");
}
for (const field of ["occasions", "contexts", "climates", "seasons", "dayParts"]) {
  if (!Array.isArray(perfume.recommendation?.[field])) errors.push(`recommendation.${field} debe ser una lista`);
}

const age = perfume.recommendation?.recommendedAge;
if (!age || typeof age !== "object") {
  errors.push("recommendation.recommendedAge es obligatorio");
} else {
  const validAge = value => value === null || (Number.isInteger(value) && value >= 0 && value <= 100);
  if (!validAge(age.min)) errors.push("recommendedAge.min debe ser entero entre 0 y 100 o null");
  if (!validAge(age.max)) errors.push("recommendedAge.max debe ser entero entre 0 y 100 o null");
  if (Number.isInteger(age.min) && Number.isInteger(age.max) && age.min > age.max) errors.push("recommendedAge.min no puede superar max");
  if (!["unknown", "low", "medium", "high"].includes(age.confidence)) errors.push("recommendedAge.confidence no es válido");
  if (age.framing !== "tendency") errors.push("recommendedAge.framing debe ser tendency");
  if (age.isRestrictive !== false) errors.push("recommendedAge.isRestrictive debe ser false");
  if (typeof age.guidance !== "string" || age.guidance.length < 40) errors.push("recommendedAge.guidance debe explicar la tendencia de manera amable");
  const guidance = String(age.guidance || "").toLowerCase();
  if (!guidance.includes("orientativ") || (!guidance.includes("cualquier edad") && !guidance.includes("no es una regla"))) {
    errors.push("recommendedAge.guidance debe dejar claro que la edad es orientativa y no restrictiva");
  }
}

if (typeof perfume.content?.shortDescription !== "string" || !perfume.content.shortDescription.trim()) {
  errors.push("content.shortDescription es obligatorio");
} else if (perfume.content.shortDescription.length > 500) {
  errors.push("content.shortDescription supera 500 caracteres");
}
if (typeof perfume.content?.advisorSummary === "string" && perfume.content.advisorSummary.length > 280) {
  errors.push("content.advisorSummary supera 280 caracteres");
}
if (!Array.isArray(perfume.provenance?.sources) || !perfume.provenance.sources.length) {
  errors.push("provenance.sources debe contener al menos una fuente");
}

if (errors.length) {
  console.error(`❌ ${path.basename(file)} no pasó la validación de PRIVÉ Core:`);
  errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}
console.log(`✅ ${path.basename(file)} pasó la validación de PRIVÉ Core Database v1.0.0`);
