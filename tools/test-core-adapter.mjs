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
const expectedCodes = core.map(item => item.identity?.priveCode);

const checks = [
  [merged.length === legacy.length, "La migración no debe duplicar perfumes"],
  [expectedCodes.every(code => merged.find(item => item.code === code)?.core?.source === "PRIVÉ Core Database"), "Todas las fichas Core deben enriquecer el catálogo"],
  [expectedCodes.every(code => {
    const legacyItem = legacy.find(item => item.code === code);
    const mergedItem = merged.find(item => item.code === code);
    return legacyItem && mergedItem
      && mergedItem.name === legacyItem.name
      && mergedItem.designer === legacyItem.designer
      && mergedItem.category === legacyItem.category;
  }), "Core no debe sobrescribir nombre, diseñador ni categoría del Excel"],
  [merged.find(item => item.code === "CP02446")?.contexts?.includes("Cita"), "Afnan 9PM debe conservar Cita"],
  [merged.find(item => item.code === "CP02518")?.climates?.includes("Calor"), "Turathi Blue debe conservar Calor"],
  [merged.find(item => item.code === "CP02438")?.accords?.length > 0, "Club de Nuit debe conservar acordes"],
  [merged.find(item => item.code === "CP00725")?.topNotes?.length > 0, "Acqua di Giò debe conservar notas"],
  [merged.find(item => item.code === "CP02446")?.styleTags?.length > 0, "Afnan 9PM debe exponer etiquetas de estilo"],
  [merged.find(item => item.code === "CP02446")?.dayParts?.includes("Noche"), "Afnan 9PM debe exponer momento del día"],
  [merged.find(item => item.code === "CP02446")?.sensoryProfile?.sweetness >= 0, "Afnan 9PM debe exponer perfil sensorial"],
  [merged.find(item => item.code === "CP02446")?.ageTrend?.framing === "tendency", "La edad debe exponerse como tendencia"],
  [merged.find(item => item.code === "CP02446")?.ageTrend?.isRestrictive === false, "La edad no debe ser restrictiva"]
];

const failed = checks.filter(([ok]) => !ok);
if (failed.length) {
  failed.forEach(([, message]) => console.error(`❌ ${message}`));
  process.exit(1);
}
console.log(`✅ Adaptador Core validado: ${core.length} fichas enriquecen el catálogo sin alterar su identidad`);
