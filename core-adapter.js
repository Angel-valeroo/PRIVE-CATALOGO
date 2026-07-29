(function (global) {
  "use strict";

  const unique = values => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];

  function normalizeIntensity(value) {
    const map = {
      "Suave": "Suave",
      "Moderada": "Moderada",
      "Intensa": "Intenso",
      "Muy intensa": "Muy intenso",
      "Desconocida": "Desconocida"
    };
    return map[value] || value || "";
  }

  function coreToCatalog(core) {
    if (!core || typeof core !== "object") throw new TypeError("La ficha Core debe ser un objeto.");

    const identity = core.identity || {};
    const classification = core.classification || {};
    const olfactory = core.olfactory || {};
    const performance = core.performance || {};
    const recommendation = core.recommendation || {};
    const content = core.content || {};

    if (!core.id || !identity.brand || !identity.name || !identity.priveCode) {
      throw new Error("La ficha Core no contiene identidad suficiente para el catálogo.");
    }

    return {
      id: core.id,
      designer: identity.brand,
      name: identity.name,
      code: identity.priveCode,
      category: identity.audience || "Unisex",
      family: classification.family || "",
      topNotes: unique(olfactory.topNotes),
      heartNotes: unique(olfactory.heartNotes),
      baseNotes: unique(olfactory.baseNotes),
      accords: unique(classification.accords),
      intensity: normalizeIntensity(performance.intensity),
      occasions: unique(recommendation.occasions),
      // El catálogo heredado usa contexts como etiquetas de uso. Conservamos
      // las ocasiones para que filtros y asesor sigan siendo compatibles,
      // y añadimos los contextos semánticos del Core.
      contexts: unique([...(recommendation.occasions || []), ...(recommendation.contexts || [])]),
      climates: unique(recommendation.climates),
      seasons: unique(recommendation.seasons),
      description: content.shortDescription || content.advisorSummary || "",
      image: content.image?.path || "",
      core: {
        schemaVersion: core.schemaVersion,
        status: core.status,
        advisorSummary: content.advisorSummary || "",
        source: "PRIVÉ Core Database"
      }
    };
  }

  function mergeCatalogs(legacyPerfumes, corePerfumes) {
    const merged = (Array.isArray(legacyPerfumes) ? legacyPerfumes : []).map(perfume => ({ ...perfume }));

    (Array.isArray(corePerfumes) ? corePerfumes : []).forEach(perfume => {
      const adapted = coreToCatalog(perfume);
      const index = merged.findIndex(item =>
        (adapted.code && item?.code === adapted.code) ||
        (adapted.id && item?.id === adapted.id)
      );

      if (index >= 0) {
        const previous = merged[index];
        // Excel / catálogo operativo es la fuente de verdad para identidad.
        // Core aporta la información enriquecida (notas, familia, usos, etc.).
        // Así, una corrección de nombre, diseñador, clave o categoría en Excel
        // también se refleja en perfumes que ya tienen ficha Core.
        merged[index] = {
          ...previous,
          ...adapted,
          id: previous.id || adapted.id,
          designer: previous.designer || adapted.designer,
          name: previous.name || adapted.name,
          code: previous.code || adapted.code,
          category: previous.category || adapted.category
        };
      } else {
        merged.push(adapted);
      }
    });

    return merged;
  }

  global.PriveCoreAdapter = Object.freeze({ coreToCatalog, mergeCatalogs });
})(globalThis);
