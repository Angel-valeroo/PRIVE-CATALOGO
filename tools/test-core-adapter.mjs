import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("core-adapter.js", "utf8");
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const legacy = JSON.parse(fs.readFileSync("data/perfumes.json", "utf8"));
const core = JSON.parse(fs.readFileSync("data/core/perfume.example.json", "utf8"));
const merged = sandbox.PriveCoreAdapter.mergeCatalogs(legacy, [core]);
const perfume = merged.find(item => item.code === "CP02446");

const checks = [
  [merged.length === legacy.length, "Core no debe duplicar CP02446"],
  [perfume?.core?.source === "PRIVÉ Core Database", "CP02446 debe provenir de Core"],
  [perfume?.contexts?.includes("Cita"), "Debe conservar etiquetas compatibles con el asesor"],
  [perfume?.accords?.includes("Dulce"), "Debe adaptar acordes"],
  [perfume?.climates?.includes("Frío"), "Debe adaptar climas"]
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, message]) => console.error(`❌ ${message}`));
  process.exit(1);
}
console.log("✅ Adaptador Core → Catálogo validado con Afnan 9PM");
