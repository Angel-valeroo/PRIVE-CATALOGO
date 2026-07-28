import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("core-adapter.js", "utf8");
const sandbox = { console };
sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const legacy = JSON.parse(fs.readFileSync("data/perfumes.json", "utf8"));
const catalog = JSON.parse(fs.readFileSync("data/core/catalog.json", "utf8"));
const core = catalog.perfumes.map(file => JSON.parse(fs.readFileSync(`data/core/${file}`, "utf8")));
const merged = sandbox.PriveCoreAdapter.mergeCatalogs(legacy, core);

const expectedCodes = ["CP02446", "CP02518", "CP02438", "CP00725", "CP02414", "CP02310"];
const checks = [
  [merged.length === legacy.length, "La migración no debe duplicar perfumes"],
  [core.length === expectedCodes.length, "Deben cargarse las seis fichas Core"],
  [expectedCodes.every(code => merged.find(item => item.code === code)?.core?.source === "PRIVÉ Core Database"), "Las seis fragancias deben provenir de Core"],
  [merged.find(item => item.code === "CP02446")?.contexts?.includes("Cita"), "Afnan 9PM debe conservar Cita"],
  [merged.find(item => item.code === "CP02518")?.climates?.includes("Calor"), "Turathi Blue debe conservar Calor"],
  [merged.find(item => item.code === "CP02438")?.accords?.length > 0, "Club de Nuit debe conservar acordes"],
  [merged.find(item => item.code === "CP00725")?.topNotes?.length > 0, "Aqua di Gio debe conservar notas"],
  [expectedCodes.every(code => {
    const legacyItem = legacy.find(item => item.code === code);
    return legacyItem && !Object.prototype.hasOwnProperty.call(legacyItem, "family");
  }), "Los datos enriquecidos migrados ya no deben duplicarse en el JSON heredado"]
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, message]) => console.error(`❌ ${message}`));
  process.exit(1);
}
console.log("✅ Migración v1.3.9 validada: 6 fragancias servidas desde PRIVÉ Core Database");
