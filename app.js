const state = {
  perfumes: [], query: "", designer: "", family: "", category: "",
  tags: new Set(), selectedPerfume: null,
  advisor: { step: 0, answers: { category: "", age: "", occasion: "", profile: "", intensity: "", climate: "" } }
};

const IMAGE_BASE_PATH = "IMAGES";
const IMAGE_EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png"];
const MIN_RECOMMENDATION_SCORE = 62;
const CORE_DATA_VERSION = "master-004-scrollfix-v50";
const IS_MOBILE_CATALOG = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;
const CATALOG_BATCH_SIZE = IS_MOBILE_CATALOG ? 24 : 40;
const CATALOG_INITIAL_BATCH_SIZE = IS_MOBILE_CATALOG ? 48 : 72;
const CATALOG_IMAGE_CACHE_LIMIT = IS_MOBILE_CATALOG ? 112 : 180;
const CATALOG_IMAGE_RELEASE_DISTANCE = IS_MOBILE_CATALOG ? 9 : 11;
const CATALOG_IMAGE_ROOT_MARGIN = IS_MOBILE_CATALOG ? "1400px 0px" : "2200px 0px";
const CATALOG_IMAGE_CONCURRENCY = IS_MOBILE_CATALOG ? 4 : 6;
const CATALOG_IDLE_DELAY = IS_MOBILE_CATALOG ? 950 : 500;

const DISCOVERY_GROUPS = [
  { label: "Género", type: "category", featured: true, values: ["Caballero", "Dama", "Unisex"] },
  { label: "Ocasión", values: ["Día", "Noche", "Diario", "Oficina", "Cita", "Fiesta", "Evento", "Playa", "Gimnasio", "Escuela", "Viaje"] },
  { label: "Clima", values: ["Calor", "Templado", "Frío"] },
  { label: "Estación", values: ["Primavera", "Verano", "Otoño", "Invierno"] },
  { label: "Perfil aromático", values: ["Fresco", "Acuático", "Dulce", "Amaderado", "Aromático", "Cítrico", "Afrutado", "Floral", "Especiado"] }
];

const TAG_ICONS = {
  Caballero: "■", Dama: "◆", Unisex: "●",
  Día: "☀️", Noche: "🌙", Diario: "📅", Oficina: "☕", Cita: "❤️", Fiesta: "🎉", Evento: "🎆",
  Playa: "🌴", Gimnasio: "🏋️", Escuela: "📚", Viaje: "✈️",
  Casual: "👕", Profesional: "💼", Vacaciones: "🏖️", Deportivo: "🏃", Especial: "✨", Formal: "🎩", Romántico: "💞", Social: "🥂",
  Calor: "🔥", Templado: "☁️", Frío: "❄️",
  Primavera: "🌸", Verano: "☀️", Otoño: "🍁", Invierno: "☃️",
  Fresco: "🍃", Acuático: "🌊", Dulce: "🍬", Amaderado: "🪵", Aromático: "🌿",
  Cítrico: "🍊", Afrutado: "🍎", Floral: "🌸", Especiado: "🌶️"
};

const ADVISOR_FIELDS = [
  { key: "category", values: ["Caballero", "Dama", "Unisex"] },
  { key: "age", values: ["Menos de 20", "20–29", "30–44", "45+"] },
  { key: "occasion", values: ["Día", "Noche", "Diario", "Oficina", "Cita", "Fiesta", "Evento", "Playa", "Gimnasio", "Escuela", "Viaje"] },
  { key: "profile", values: ["Fresco", "Acuático", "Dulce", "Amaderado", "Aromático", "Cítrico", "Afrutado", "Floral", "Especiado"] },
  { key: "intensity", values: ["Sutil", "Equilibrado", "Intenso"] },
  { key: "climate", values: ["Calor", "Templado", "Frío"] }
];

const ADVISOR_WEIGHTS = { category: 24, age: 12, occasion: 20, profile: 20, intensity: 12, climate: 12 };
const ADVISOR_OPTION_ICONS = {
  Caballero: "🕴️", Dama: "🌹", Unisex: "⚖️",
  "Menos de 20": "✦", "20–29": "◒", "30–44": "◐", "45+": "◆",
  Sutil: "○", Equilibrado: "◉", Intenso: "●"
};
const $ = selector => document.querySelector(selector);

const elements = {
  catalog: $("#catalog"), template: $("#perfumeCardTemplate"), search: $("#search"), submitSearch: $("#submitSearch"),
  clearSearch: $("#clearSearch"), catalogSearchDock: $("#catalogSearchDock"), catalogSearch: $("#catalogSearch"), catalogSearchClear: $("#catalogSearchClear"), designerFilter: $("#designerFilter"), familyFilter: $("#familyFilter"),
  familyFilterField: $("#familyFilterField"), resetFilters: $("#resetFilters"),
  resultCount: $("#resultCount"), resultLabel: $("#resultLabel"), emptyState: $("#emptyState"),
  activeFilters: $("#activeFilters"), categoryFilters: [...document.querySelectorAll(".category-filter")],
  dialog: $("#perfumeDialog"), closeDialog: $("#closeDialog"),
  detailImage: $("#detailImage"), detailFallback: $("#detailFallback"), detailMonogram: $("#detailMonogram"),
  detailBottleStage: $(".detail-bottle-stage"), detailComposition: $(".detail-product-composition"),
  detailStageName: $("#detailStageName"), detailStageCode: $("#detailStageCode"),
  detailScrollCue: $(".detail-scroll-cue"),
  detailDesigner: $("#detailDesigner"), detailName: $("#detailName"), detailCode: $("#detailCode"),
  detailDescription: $("#detailDescription"), detailCategory: $("#detailCategory"), profileChips: $("#profileChips"), useSection: $("#useSection"),
  familySection: $("#familySection"), detailFamily: $("#detailFamily"), notesSection: $("#notesSection"),
  topNotesGroup: $("#topNotesGroup"), heartNotesGroup: $("#heartNotesGroup"), baseNotesGroup: $("#baseNotesGroup"),
  detailTopNotes: $("#detailTopNotes"), detailHeartNotes: $("#detailHeartNotes"), detailBaseNotes: $("#detailBaseNotes"),
  pendingData: $("#pendingData"), relatedPerfumes: $("#relatedPerfumes"), relatedSection: $("#relatedSection"),
  relatedReason: $("#relatedReason"), viewDesigner: $("#viewDesigner"),
  openAdvisor: $("#openAdvisor"), advisorDialog: $("#advisorDialog"), closeAdvisor: $("#closeAdvisor"),
  advisorProgressBar: $("#advisorProgressBar"), advisorProgressText: $("#advisorProgressText"),
  advisorSteps: $("#advisorSteps"), advisorResults: $("#advisorResults"),
  advisorRecommendations: $("#advisorRecommendations"), advisorNoMatch: $("#advisorNoMatch"),
  advisorResultsIntro: $("#advisorResultsIntro"), advisorBack: $("#advisorBack"),
  advisorSkip: $("#advisorSkip"), advisorNext: $("#advisorNext"), advisorRestart: $("#advisorRestart")
};


const detailImageBoundsCache = new Map();
let detailLayoutFrame = 0;
let detailOpenSequence = 0;
let catalogRenderToken = 0;
let catalogRenderedCount = 0;
let catalogObserver = null;
let catalogImageObserver = null;
let catalogBatchTimer = 0;
let catalogScrollIdleTimer = 0;
let catalogScrollBusy = false;
let lastCatalogScrollY = window.scrollY;
let lastCatalogScrollTime = performance.now();
let catalogImageActiveLoads = 0;
let catalogImageGeneration = 0;
let catalogImageSweepFrame = 0;
const catalogImageQueue = [];
const catalogImageQueued = new WeakSet();

function categoryFromCode(code) {
  const value = String(code || "").trim().toUpperCase();
  if (value.startsWith("DP") || value.startsWith("D")) return "dama";
  if (value.startsWith("UP") || value.startsWith("U")) return "unisex";
  return "caballero";
}

function applyDetailCategoryTheme(perfume) {
  const gender = categoryFromCode(perfume?.code);
  elements.dialog.classList.remove("detail-gender-caballero", "detail-gender-dama", "detail-gender-unisex");
  elements.dialog.classList.add(`detail-gender-${gender}`);
}

function alphaBoundsForImage(image) {
  const cacheKey = image.currentSrc || image.src;
  if (detailImageBoundsCache.has(cacheKey)) return detailImageBoundsCache.get(cacheKey);
  const canvas = document.createElement("canvas");
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return null;
  const maxSample = 720;
  const ratio = Math.min(1, maxSample / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let pixels;
  try { pixels = context.getImageData(0, 0, canvas.width, canvas.height).data; }
  catch (_) { return null; }
  let minX = canvas.width, minY = canvas.height, maxX = -1, maxY = -1;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const alpha = pixels[(y * canvas.width + x) * 4 + 3];
      if (alpha > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const bounds = maxX < minX || maxY < minY
    ? { x: 0, y: 0, width, height }
    : {
        x: minX / ratio,
        y: minY / ratio,
        width: (maxX - minX + 1) / ratio,
        height: (maxY - minY + 1) / ratio
      };
  detailImageBoundsCache.set(cacheKey, bounds);
  return bounds;
}

function layoutDetailBottle() {
  cancelAnimationFrame(detailLayoutFrame);
  detailLayoutFrame = requestAnimationFrame(() => {
    const image = elements.detailImage;
    const stage = elements.detailBottleStage;
    if (!image || !stage || image.hidden || !image.complete || !image.naturalWidth) return;
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width < 20 || stageRect.height < 20) return;
    const bounds = alphaBoundsForImage(image) || { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
    const safeWidth = stageRect.width * .88;
    const safeHeight = stageRect.height * .94;
    const scale = Math.min(safeWidth / bounds.width, safeHeight / bounds.height);
    const renderedWidth = image.naturalWidth * scale;
    const renderedHeight = image.naturalHeight * scale;
    const visibleCenterX = (bounds.x + bounds.width / 2) * scale;
    const visibleCenterY = (bounds.y + bounds.height / 2) * scale;
    image.style.width = `${renderedWidth.toFixed(2)}px`;
    image.style.height = `${renderedHeight.toFixed(2)}px`;
    image.style.left = `${(stageRect.width / 2 - visibleCenterX).toFixed(2)}px`;
    image.style.top = `${(stageRect.height / 2 - visibleCenterY).toFixed(2)}px`;
  });
}

function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
function initials(designer) {
  return String(designer || "PRIVÉ").split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase() || "P";
}
function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) return value.split(/[,·]/).map(item => item.trim()).filter(Boolean);
  return [];
}
function includesNormalized(list, value) {
  const wanted = normalize(value);
  return asList(list).some(item => normalize(item) === wanted);
}
function perfumeTags(perfume) {
  return [...new Set([...asList(perfume.contexts), ...asList(perfume.occasions), ...asList(perfume.climates), ...asList(perfume.seasons), ...asList(perfume.accords), ...asList(perfume.styleTags), ...asList(perfume.dayParts)])];
}
function searchableText(perfume) {
  return normalize([perfume.name, perfume.designer, perfume.code, perfume.family,
    ...asList(perfume.accords), ...asList(perfume.topNotes), ...asList(perfume.heartNotes),
    ...asList(perfume.baseNotes), ...perfumeTags(perfume)].join(" "));
}
function filteredPerfumes() {
  const query = normalize(state.query);
  const selectedTags = [...state.tags].map(normalize);
  return state.perfumes.filter(perfume => {
    const values = perfumeTags(perfume).map(normalize);
    return (!state.category || perfume.category === state.category)
      && (!state.designer || perfume.designer === state.designer)
      && (!state.family || perfume.family === state.family)
      && selectedTags.every(tag => values.includes(tag))
      && (!query || searchableText(perfume).includes(query));
  });
}
function loadImage(image, fallback, monogram, perfume, onSettled = null) {
  let extensionIndex = 0;
  const requestId = `${perfume.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  image.dataset.requestId = requestId;
  monogram.textContent = initials(perfume.designer);
  image.alt = `${perfume.name} de ${perfume.designer}`;
  if (image !== elements.detailImage) image.fetchPriority = "low";
  image.hidden = false;
  image.classList.add("is-loading");
  fallback.hidden = false;

  const isCurrentRequest = () => image.dataset.requestId === requestId;
  let settled = false;
  const settle = success => {
    if (settled) return;
    settled = true;
    if (typeof onSettled === "function") onSettled(success);
  };
  const revealCurrentImage = async () => {
    if (!isCurrentRequest()) return;
    // En tarjetas evitamos decodificaciones masivas simultáneas. Safari puede
    // recargar la pestaña cuando muchas imágenes se decodifican al hacer scroll rápido.
    if (image === elements.detailImage) {
      try { if (typeof image.decode === "function") await image.decode(); } catch (_) { /* onload ya confirmó el recurso */ }
      if (!isCurrentRequest()) return;
    }
    image.classList.remove("is-loading");
    fallback.hidden = true;
    settle(true);
    if (image === elements.detailImage) {
      const revealSequence = detailOpenSequence;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (revealSequence !== detailOpenSequence || !elements.dialog.open) return;
        forceDetailScrollToTop();
        layoutDetailBottle();
        requestAnimationFrame(() => {
          if (revealSequence !== detailOpenSequence || !elements.dialog.open) return;
          forceDetailScrollToTop();
          layoutDetailBottle();
          elements.dialog.classList.remove("detail-switching", "detail-resetting-scroll");
        });
      }));
    }
  };
  const tryNextExtension = () => {
    if (!isCurrentRequest()) return;
    if (extensionIndex >= IMAGE_EXTENSIONS.length) {
      image.onload = null;
      image.onerror = null;
      image.removeAttribute("src");
      image.hidden = true;
      image.classList.remove("is-loading");
      fallback.hidden = false;
      settle(false);
      return;
    }
    const extension = IMAGE_EXTENSIONS[extensionIndex++];
    image.src = `${IMAGE_BASE_PATH}/${encodeURIComponent(perfume.category)}/${encodeURIComponent(perfume.code)}.${extension}`;
  };

  image.onload = revealCurrentImage;
  image.onerror = tryNextExtension;
  tryNextExtension();
}
function unloadCatalogImage(image) {
  if (!image || image === elements.detailImage) return;
  // Nunca cancelar una petición activa. Antes se liberaban imágenes con
  // dataset.loaded=true aunque todavía estuvieran descargándose; al borrar
  // sus handlers, la cola nunca recibía el callback y perdía capacidad.
  if (image.dataset.loadState === "loading" || image.dataset.loadState === "queued") return;
  catalogImageQueued.delete(image);
  image.dataset.requestId = `unloaded-${Date.now()}`;
  image.onload = null;
  image.onerror = null;
  image.removeAttribute("src");
  image.classList.add("is-loading");
  image.hidden = false;
  const card = image.closest(".perfume-card");
  const fallback = card?.querySelector(".image-fallback");
  if (fallback) fallback.hidden = false;
  image.dataset.loaded = "false";
  image.dataset.loadState = "idle";
}

function imageDistanceFromViewport(image) {
  const rect = image.getBoundingClientRect();
  const viewportHeight = Math.max(window.innerHeight, 1);
  if (rect.bottom < 0) return Math.abs(rect.bottom);
  if (rect.top > viewportHeight) return rect.top - viewportHeight;
  return 0;
}

function pumpCatalogImageQueue() {
  catalogImageQueue.sort((a, b) => imageDistanceFromViewport(a.image) - imageDistanceFromViewport(b.image));
  while (catalogImageActiveLoads < CATALOG_IMAGE_CONCURRENCY && catalogImageQueue.length) {
    const task = catalogImageQueue.shift();
    if (!task?.image?.isConnected || task.image.dataset.loadState !== "queued") {
      if (task?.image) catalogImageQueued.delete(task.image);
      continue;
    }
    const { image, card, perfume, generation } = task;
    catalogImageActiveLoads += 1;
    image.dataset.loaded = "true";
    image.dataset.loadState = "loading";
    loadImage(
      image,
      card.querySelector(".image-fallback"),
      card.querySelector(".monogram"),
      perfume,
      success => {
        catalogImageQueued.delete(image);
        image.dataset.loadState = success ? "loaded" : "failed";
        if (!success) image.dataset.loaded = "false";
        if (generation === catalogImageGeneration) {
          catalogImageActiveLoads = Math.max(0, catalogImageActiveLoads - 1);
          pumpCatalogImageQueue();
        }
      }
    );
  }
}

function queueCatalogImage(image) {
  if (!image || image.dataset.loadState === "loaded" || image.dataset.loadState === "loading" || image.dataset.loadState === "queued" || catalogImageQueued.has(image)) return;
  const card = image.closest(".perfume-card");
  const perfumeId = card?.dataset.perfumeId;
  const perfume = state.perfumes.find(item => item.id === perfumeId);
  if (!card || !perfume) return;
  catalogImageQueued.add(image);
  image.dataset.loadState = "queued";
  catalogImageQueue.push({ image, card, perfume, generation: catalogImageGeneration });
  pumpCatalogImageQueue();
}


function queueNearbyCatalogImages() {
  cancelAnimationFrame(catalogImageSweepFrame);
  catalogImageSweepFrame = requestAnimationFrame(() => {
    const preloadDistance = IS_MOBILE_CATALOG ? 1500 : 2400;
    const viewportHeight = Math.max(window.innerHeight, 1);
    const candidates = [...elements.catalog.querySelectorAll('.perfume-image[data-load-state="idle"], .perfume-image[data-load-state="failed"]')]
      .filter(image => {
        const rect = image.getBoundingClientRect();
        return rect.bottom >= -preloadDistance && rect.top <= viewportHeight + preloadDistance;
      })
      .sort((a, b) => imageDistanceFromViewport(a) - imageDistanceFromViewport(b));
    candidates.forEach(queueCatalogImage);
  });
}

function ensureCatalogImageObserver() {
  if (catalogImageObserver || typeof IntersectionObserver === "undefined") return;
  catalogImageObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) queueCatalogImage(entry.target);
    }
  }, { root: null, rootMargin: CATALOG_IMAGE_ROOT_MARGIN, threshold: 0.01 });
}

function releaseFarCatalogImages() {
  const loaded = [...elements.catalog.querySelectorAll('.perfume-image[data-load-state="loaded"]')];
  if (loaded.length <= CATALOG_IMAGE_CACHE_LIMIT) return;
  const viewportHeight = Math.max(window.innerHeight, 1);
  const releaseDistance = viewportHeight * CATALOG_IMAGE_RELEASE_DISTANCE;
  const candidates = loaded
    .map(image => {
      const rect = image.getBoundingClientRect();
      const distance = rect.bottom < 0 ? Math.abs(rect.bottom) : rect.top > viewportHeight ? rect.top - viewportHeight : 0;
      return { image, distance };
    })
    .filter(item => item.distance > releaseDistance)
    .sort((a, b) => b.distance - a.distance);
  const excess = Math.max(0, loaded.length - CATALOG_IMAGE_CACHE_LIMIT);
  candidates.slice(0, excess).forEach(({ image }) => unloadCatalogImage(image));
}

function configureImage(card, perfume) {
  const image = card.querySelector(".perfume-image");
  const fallback = card.querySelector(".image-fallback");
  const monogram = card.querySelector(".monogram");
  image.removeAttribute("src");
  // IntersectionObserver ya controla la carga; el lazy nativo puede posponerla
  // demasiado cuando el usuario desplaza el catálogo con rapidez.
  image.loading = "eager";
  image.decoding = "async";
  image.fetchPriority = "low";
  image.dataset.loaded = "false";
  image.dataset.loadState = "idle";
  monogram.textContent = initials(perfume.designer);
  fallback.hidden = false;
  ensureCatalogImageObserver();
  if (catalogImageObserver) catalogImageObserver.observe(image);
  else loadImage(image, fallback, monogram, perfume);
}
function scrollToCatalog(behavior = "smooth") {
  $("#catalogo").scrollIntoView({ behavior, block: "start" });
}
function setFilter(type, value, shouldScroll = true) {
  state[type] = value || "";
  if (type === "designer") elements.designerFilter.value = state.designer;
  if (type === "family") elements.familyFilter.value = state.family;
  closePerfume(false); render(); if (shouldScroll) scrollToCatalog();
}
function toggleTag(tag, shouldScroll = true) {
  if (state.tags.has(tag)) state.tags.delete(tag); else state.tags.add(tag);
  closePerfume(false); render(); if (shouldScroll) scrollToCatalog();
}
function createFilterChip(label, removeAction) {
  const chip = document.createElement("button");
  chip.className = "filter-chip"; chip.type = "button";
  chip.innerHTML = `<span>${label}</span><b aria-hidden="true">×</b>`;
  chip.setAttribute("aria-label", `Quitar filtro ${label}`); chip.addEventListener("click", removeAction);
  return chip;
}
function renderActiveFilters() {
  const chips = [];
  if (state.category) chips.push(createFilterChip(state.category, () => setFilter("category", "", false)));
  if (state.designer) chips.push(createFilterChip(state.designer, () => setFilter("designer", "", false)));
  if (state.family) chips.push(createFilterChip(state.family, () => setFilter("family", "", false)));
  [...state.tags].forEach(tag => chips.push(createFilterChip(tag, () => toggleTag(tag, false))));
  elements.activeFilters.replaceChildren(...chips); elements.activeFilters.hidden = chips.length === 0;
}

function profileValues(perfume) {
  return [...new Set([...asList(perfume.contexts), ...asList(perfume.climates), ...asList(perfume.seasons), ...asList(perfume.accords), ...asList(perfume.styleTags)])].slice(0, 12);
}
function similarityScore(reference, candidate) {
  if (reference.id === candidate.id) return -1;
  let score = 0;
  if (reference.family && reference.family === candidate.family) score += 8;
  const shared = (field, weight) => asList(reference[field]).filter(item => asList(candidate[field]).includes(item)).length * weight;
  score += shared("accords", 3) + shared("contexts", 3) + shared("climates", 2) + shared("occasions", 2) + shared("styleTags", 2) + shared("dayParts", 1) + shared("seasons", 1);
  if (reference.intensity && reference.intensity === candidate.intensity) score += 2;
  if (reference.designer === candidate.designer) score += 1;
  return score;
}
function recommendationsFor(perfume) {
  const scored = state.perfumes.map(item => ({ item, score: similarityScore(perfume, item) }))
    .filter(entry => entry.score > 0).sort((a,b) => b.score-a.score || a.item.name.localeCompare(b.item.name,"es"));
  if (scored.length) return { items: scored.slice(0,4).map(entry => entry.item), reason: "Basado en ocasión, clima y perfil olfativo" };
  const sameDesigner = state.perfumes.filter(item => item.designer === perfume.designer && item.id !== perfume.id).slice(0,4);
  if (sameDesigner.length) return { items: sameDesigner, reason: "Más opciones del mismo diseñador" };
  return { items: state.perfumes.filter(item => item.id !== perfume.id).slice(0,4), reason: "Otras fragancias de la colección" };
}
function createRelatedButton(perfume) {
  const button = document.createElement("button"); button.className = "related-card"; button.type = "button";
  button.innerHTML = `<span>${perfume.name}</span><small>${perfume.designer} · ${perfume.code}</small>`;
  button.addEventListener("click", () => openPerfume(perfume)); return button;
}
function renderNoteGroup(group, output, notes) {
  const list = asList(notes); group.hidden = list.length === 0; output.textContent = list.join(" · "); return list.length > 0;
}
function createProfileChip(value) {
  const button = document.createElement("button"); button.type = "button"; button.className = "profile-chip";
  button.innerHTML = `<span aria-hidden="true">${TAG_ICONS[value] || "•"}</span>${value}`;
  button.addEventListener("click", () => toggleTag(value)); return button;
}

let detailCueTimer = null;

function resetDetailScrollCue() {
  clearTimeout(detailCueTimer);
  elements.dialog.classList.remove("detail-cue-nudge", "detail-cue-dismissed");
  detailCueTimer = setTimeout(() => {
    if (elements.dialog.open && elements.dialog.scrollTop < 8) {
      elements.dialog.classList.add("detail-cue-nudge");
    }
  }, 3000);
}

function updateDetailScrollProgress() {
  const viewport = Math.max(1, elements.dialog.clientHeight);
  const maxDistance = Math.max(320, Math.min(760, viewport * 0.78));
  const progress = Math.max(0, Math.min(1, elements.dialog.scrollTop / maxDistance));
  elements.dialog.style.setProperty("--detail-progress", progress.toFixed(3));
  elements.dialog.classList.toggle("detail-is-discovering", progress > 0.08);
  elements.dialog.classList.toggle("detail-is-reading", progress > 0.62);
  if (elements.dialog.scrollTop > 10) {
    clearTimeout(detailCueTimer);
    elements.dialog.classList.add("detail-cue-dismissed");
    elements.dialog.classList.remove("detail-cue-nudge");
  }
}

function forceDetailScrollToTop() {
  if (!elements.dialog) return;
  elements.dialog.classList.add("detail-resetting-scroll");
  elements.dialog.scrollTo({ top: 0, left: 0, behavior: "auto" });
  elements.dialog.scrollTop = 0;
}

function stabilizeDetailOpening(sequence) {
  const settle = (remaining) => {
    if (sequence !== detailOpenSequence || !elements.dialog.open) return;
    forceDetailScrollToTop();
    updateDetailScrollProgress();
    layoutDetailBottle();
    if (remaining > 0) {
      requestAnimationFrame(() => settle(remaining - 1));
    } else {
      elements.dialog.classList.remove("detail-resetting-scroll");
    }
  };
  requestAnimationFrame(() => settle(3));
}

function resetDetailRenderState() {
  cancelAnimationFrame(detailLayoutFrame);
  const image = elements.detailImage;
  if (image) {
    image.dataset.requestId = "";
    image.onload = null;
    image.onerror = null;
    image.removeAttribute("src");
    image.style.removeProperty("width");
    image.style.removeProperty("height");
    image.style.removeProperty("left");
    image.style.removeProperty("top");
    image.classList.add("is-loading");
  }
  forceDetailScrollToTop();
  elements.dialog.style.setProperty("--detail-progress", "0");
  elements.dialog.classList.remove("detail-is-discovering", "detail-is-reading", "detail-cue-dismissed", "detail-cue-nudge");
  elements.dialog.classList.add("detail-switching");
}

function openPerfume(perfume, updateHash = true) {
  if (!perfume) return;
  const openingSequence = ++detailOpenSequence;
  resetDetailRenderState();
  state.selectedPerfume = perfume;
  elements.detailDesigner.textContent = perfume.designer; elements.detailName.textContent = perfume.name;
  elements.detailCode.textContent = `CLAVE ${perfume.code}`;
  elements.detailStageName.textContent = perfume.name;
  elements.detailStageCode.textContent = `Clave ${perfume.code}`;
  applyDetailCategoryTheme(perfume);
  elements.detailCategory.textContent = `COLECCIÓN ${String(perfume.category || "PRIVÉ").toUpperCase()}`;
  elements.detailDescription.textContent = perfume.description || "Una fragancia de la colección PRIVÉ. Su información olfativa se incorporará progresivamente a la base de datos.";
  loadImage(elements.detailImage, elements.detailFallback, elements.detailMonogram, perfume);
  const chips = profileValues(perfume).map(createProfileChip);
  elements.profileChips.replaceChildren(...chips); elements.profileChips.hidden = chips.length === 0; elements.useSection.hidden = chips.length === 0;
  elements.familySection.hidden = !perfume.family; elements.detailFamily.textContent = perfume.family || "";
  elements.detailFamily.onclick = perfume.family ? () => setFilter("family", perfume.family) : null;
  const hasNotes = [
    renderNoteGroup(elements.topNotesGroup,elements.detailTopNotes,perfume.topNotes),
    renderNoteGroup(elements.heartNotesGroup,elements.detailHeartNotes,perfume.heartNotes),
    renderNoteGroup(elements.baseNotesGroup,elements.detailBaseNotes,perfume.baseNotes)
  ].some(Boolean);
  elements.notesSection.hidden = !hasNotes;
  elements.pendingData.hidden = Boolean(perfume.family || hasNotes || chips.length || perfume.description);
  const related = recommendationsFor(perfume);
  elements.relatedPerfumes.replaceChildren(...related.items.map(createRelatedButton)); elements.relatedReason.textContent = related.reason;
  elements.relatedSection.hidden = related.items.length === 0;
  elements.viewDesigner.onclick = () => setFilter("designer", perfume.designer);
  elements.detailDesigner.onclick = () => setFilter("designer", perfume.designer);
  if (!elements.dialog.open) elements.dialog.showModal();
  forceDetailScrollToTop();
  resetDetailScrollCue();
  stabilizeDetailOpening(openingSequence);
  document.body.classList.add("dialog-open");
  scheduleCatalogSearchDockUpdate();
  if (updateHash) history.pushState({ perfume: perfume.id }, "", `#perfume=${encodeURIComponent(perfume.id)}`);
}
function closePerfume(updateHash = true) {
  detailOpenSequence += 1;
  clearTimeout(detailCueTimer);
  state.selectedPerfume = null;
  elements.dialog.classList.remove("detail-resetting-scroll", "detail-switching");
  if (elements.dialog.open) elements.dialog.close();
  if (!elements.advisorDialog.open) document.body.classList.remove("dialog-open");
  scheduleCatalogSearchDockUpdate();
  // showModal()/close() puede restaurar foco y viewport un frame después, sobre todo
  // en Safari. Revalidamos cuando el navegador ya terminó esa restauración.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    updateCatalogSearchVisualViewport();
    scheduleCatalogSearchDockUpdate();
  }));
  if (updateHash && location.hash.startsWith("#perfume=")) history.pushState({}, "", location.pathname + location.search);
}
function createCatalogCard(perfume, index) {
  const card = elements.template.content.cloneNode(true);
  const article = card.querySelector(".perfume-card");
  const designer = card.querySelector(".designer");
  const openButtons = card.querySelectorAll(".card-open, .name-button, .details-link");
  designer.textContent = perfume.designer;
  designer.addEventListener("click", () => setFilter("designer", perfume.designer));
  card.querySelector(".perfume-name").textContent = perfume.name;
  card.querySelector(".product-code").textContent = `CLAVE ${perfume.code}`;
  article.dataset.perfumeId = perfume.id;
  article.style.setProperty("--card-index", Math.min(index, 18));
  const cardNumber = card.querySelector(".card-number");
  if (cardNumber) cardNumber.textContent = String(index + 1).padStart(2, "0");
  const meta = card.querySelector(".card-meta");
  const metaValues = [perfume.family, ...asList(perfume.contexts).slice(0,1), ...asList(perfume.accords).slice(0,1)].filter(Boolean);
  meta.textContent = metaValues.join(" · ");
  meta.hidden = metaValues.length === 0;
  openButtons.forEach(button => button.addEventListener("click", () => openPerfume(perfume)));
  configureImage(card, perfume);
  return card;
}

function disconnectCatalogObserver() {
  if (catalogObserver) catalogObserver.disconnect();
  catalogObserver = null;
}

function disconnectCatalogImages() {
  if (catalogImageObserver) catalogImageObserver.disconnect();
  catalogImageObserver = null;
  catalogImageGeneration += 1;
  catalogImageQueue.length = 0;
  catalogImageActiveLoads = 0;
  cancelAnimationFrame(catalogImageSweepFrame);
}

function scheduleCatalogBatch(results, token) {
  clearTimeout(catalogBatchTimer);
  const run = deadline => {
    if (token !== catalogRenderToken || catalogRenderedCount >= results.length) return;
    const canWork = !deadline || deadline.didTimeout || deadline.timeRemaining() > 5;
    if (!canWork) {
      scheduleCatalogBatch(results, token);
      return;
    }
    appendCatalogBatch(results, token, CATALOG_BATCH_SIZE);
  };
  if (IS_MOBILE_CATALOG && catalogScrollBusy) {
    // No detenemos el render durante un scroll rápido: de lo contrario el usuario
    // alcanza filas que todavía no existen y percibe el catálogo en blanco.
    catalogBatchTimer = window.setTimeout(() => run(null), 24);
  } else if (typeof requestIdleCallback === "function") {
    requestIdleCallback(run, { timeout: IS_MOBILE_CATALOG ? 280 : 180 });
  } else {
    catalogBatchTimer = window.setTimeout(() => run(null), IS_MOBILE_CATALOG ? 40 : 28);
  }
}

function appendCatalogBatch(results, token, requestedSize = CATALOG_BATCH_SIZE) {
  if (token !== catalogRenderToken || catalogRenderedCount >= results.length) return;
  const end = Math.min(catalogRenderedCount + requestedSize, results.length);
  const fragment = document.createDocumentFragment();
  for (let index = catalogRenderedCount; index < end; index += 1) {
    fragment.appendChild(createCatalogCard(results[index], index));
  }
  elements.catalog.appendChild(fragment);
  catalogRenderedCount = end;
  queueNearbyCatalogImages();
  updateCatalogSentinel(results.length);
  if (catalogRenderedCount < results.length) scheduleCatalogBatch(results, token);
}

function updateCatalogSentinel(total) {
  let sentinel = document.getElementById("catalogLoadSentinel");
  if (!sentinel) {
    sentinel = document.createElement("div");
    sentinel.id = "catalogLoadSentinel";
    sentinel.className = "catalog-load-sentinel";
    sentinel.setAttribute("aria-hidden", "true");
    elements.catalog.insertAdjacentElement("afterend", sentinel);
  }
  sentinel.hidden = true;
  sentinel.dataset.remaining = String(Math.max(0, total - catalogRenderedCount));
}

function render() {
  const results = filteredPerfumes();
  const token = ++catalogRenderToken;
  disconnectCatalogObserver();
  disconnectCatalogImages();
  clearTimeout(catalogBatchTimer);
  catalogRenderedCount = 0;
  elements.catalog.replaceChildren();
  appendCatalogBatch(results, token, CATALOG_INITIAL_BATCH_SIZE);
  elements.resultCount.textContent = results.length.toLocaleString("es-MX");
  elements.resultLabel.textContent = results.length === 1 ? "fragancia" : "fragancias";
  elements.emptyState.hidden = results.length !== 0;
  const sentinel = document.getElementById("catalogLoadSentinel");
  if (sentinel && results.length === 0) sentinel.hidden = true;
  elements.clearSearch.classList.toggle("visible", Boolean(state.query));
  elements.categoryFilters.forEach(button => {
    const active = button.dataset.category === state.category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  renderActiveFilters();
}
function populateSelect(select, values) {
  values.forEach(value => { const option=document.createElement("option"); option.value=value; option.textContent=value; select.appendChild(option); });
}
function populateFilters() {
  const designers=[...new Set(state.perfumes.map(item=>item.designer).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  const families=[...new Set(state.perfumes.map(item=>item.family).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
  populateSelect(elements.designerFilter,designers); populateSelect(elements.familyFilter,families);
  elements.familyFilterField.hidden=families.length===0;
}
function openFromHash() {
  if (!location.hash.startsWith("#perfume=")) return;
  const id=decodeURIComponent(location.hash.replace("#perfume=",""));
  const perfume=state.perfumes.find(item=>item.id===id); if (perfume) openPerfume(perfume,false);
}

/* Asesor Inteligente */
function advisorAvailableValues(field) {
  const config = ADVISOR_FIELDS.find(item => item.key === field);
  if (!config) return [];
  if (["category", "age", "intensity"].includes(field)) return config.values;
  const allTags = new Set(state.perfumes.flatMap(perfumeTags));
  return config.values.filter(value => allTags.has(value));
}
function renderAdvisorOptions() {
  document.querySelectorAll(".advisor-options").forEach(container => {
    const field = container.dataset.field;
    const values = advisorAvailableValues(field);
    const buttons = values.map(value => {
      const button = document.createElement("button");
      button.type = "button"; button.className = "advisor-option";
      button.dataset.value = value;
      button.setAttribute("aria-pressed", String(state.advisor.answers[field] === value));
      if (state.advisor.answers[field] === value) button.classList.add("is-selected");
      button.innerHTML = `<span aria-hidden="true">${ADVISOR_OPTION_ICONS[value] || TAG_ICONS[value] || "•"}</span><strong>${value}</strong>`;
      button.addEventListener("click", () => {
        state.advisor.answers[field] = state.advisor.answers[field] === value ? "" : value;
        renderAdvisorOptions(); updateAdvisorAtmosphere(); updateAdvisorNavigation();
      });
      return button;
    });
    container.replaceChildren(...buttons);
  });
}
function advisorThemeKey(value) {
  return normalize(value).replace(/\s+/g, "-");
}
function updateAdvisorAtmosphere() {
  if (!elements.advisorDialog) return;
  const field = ADVISOR_FIELDS[state.advisor.step]?.key;
  const category = state.advisor.answers.category;
  const climate = state.advisor.answers.climate;
  let theme = "neutral";
  if (field === "category" && category) theme = `category-${advisorThemeKey(category)}`;
  if (field === "climate" && climate) theme = `climate-${advisorThemeKey(climate)}`;
  if (elements.advisorResults && !elements.advisorResults.hidden && climate) theme = `climate-${advisorThemeKey(climate)}`;
  elements.advisorDialog.dataset.advisorTheme = theme;
}
function openAdvisor() {
  state.advisor.step = 0;
  state.advisor.answers = { category: "", age: "", occasion: "", profile: "", intensity: "", climate: "" };
  elements.advisorResults.hidden = true; elements.advisorSteps.hidden = false;
  elements.advisorRestart.hidden = true; elements.advisorNext.hidden = false;
  elements.advisorBack.hidden = false; elements.advisorSkip.hidden = false;
  renderAdvisorOptions(); updateAdvisorStep(); updateAdvisorAtmosphere();
  if (!elements.advisorDialog.open) elements.advisorDialog.showModal();
  document.body.classList.add("dialog-open");
  scheduleCatalogSearchDockUpdate();
}
function closeAdvisor() {
  if (elements.advisorDialog.open) elements.advisorDialog.close();
  if (!elements.dialog.open) document.body.classList.remove("dialog-open");
  scheduleCatalogSearchDockUpdate();
}
function updateAdvisorStep() {
  document.querySelectorAll(".advisor-step").forEach((step, index) => step.classList.toggle("is-active", index === state.advisor.step));
  const progress = ((state.advisor.step + 1) / ADVISOR_FIELDS.length) * 100;
  elements.advisorProgressBar.style.width = `${progress}%`;
  elements.advisorProgressText.textContent = `Paso ${state.advisor.step + 1} de ${ADVISOR_FIELDS.length}`;
  updateAdvisorAtmosphere();
  updateAdvisorNavigation();
}
function updateAdvisorNavigation() {
  elements.advisorBack.disabled = state.advisor.step === 0;
  const field = ADVISOR_FIELDS[state.advisor.step]?.key;
  const hasAnswer = Boolean(field && state.advisor.answers[field]);
  elements.advisorNext.textContent = state.advisor.step === ADVISOR_FIELDS.length - 1 ? "Ver recomendaciones" : "Continuar";
  elements.advisorSkip.textContent = hasAnswer ? "Quitar respuesta" : "Omitir";
}
function advisorAgeRange(value) {
  const ranges = {
    "Menos de 20": [0, 19],
    "20–29": [20, 29],
    "30–44": [30, 44],
    "45+": [45, 100]
  };
  return ranges[value] || null;
}
function advisorMatchScore(perfume, field, value) {
  if (!value) return 0;
  if (field === "category") {
    if (normalize(perfume.category) === normalize(value)) return 1;
    if (normalize(perfume.category) === "unisex" && normalize(value) !== "unisex") return .35;
    return 0;
  }
  if (field === "age") {
    const target = advisorAgeRange(value);
    const min = Number(perfume.ageTrend?.min);
    const max = Number(perfume.ageTrend?.max);
    if (!target || !Number.isFinite(min) || !Number.isFinite(max)) return .45;
    const overlap = Math.max(0, Math.min(max, target[1]) - Math.max(min, target[0]) + 1);
    const targetSize = Math.max(1, target[1] - target[0] + 1);
    if (overlap > 0) return Math.min(1, .62 + .38 * (overlap / targetSize));
    const distance = target[1] < min ? min - target[1] : target[0] - max;
    return distance <= 5 ? .35 : 0;
  }
  if (field === "occasion") {
    return (includesNormalized(perfume.occasions, value) || includesNormalized(perfume.contexts, value)) ? 1 : 0;
  }
  if (field === "profile") {
    if (includesNormalized(perfume.accords, value)) return 1;
    if (includesNormalized(perfume.styleTags, value)) return .72;
    return 0;
  }
  if (field === "intensity") {
    const raw = normalize(perfume.intensity);
    const groups = {
      sutil: ["suave", "sutil"],
      equilibrado: ["moderada", "moderado", "equilibrado", "media"],
      intenso: ["intenso", "muy intenso", "intensa", "muy intensa"]
    };
    const target = normalize(value);
    if ((groups[target] || []).some(item => raw.includes(normalize(item)))) return 1;
    if (target === "equilibrado" && (raw.includes("intens") || raw.includes("suav"))) return .42;
    if ((target === "sutil" && raw.includes("moder")) || (target === "intenso" && raw.includes("moder"))) return .55;
    if (!raw || raw === "desconocida") return .35;
    return 0;
  }
  if (field === "climate") return includesNormalized(perfume.climates, value) ? 1 : 0;
  return 0;
}
function scoreAdvisorPerfume(perfume) {
  const selected = Object.entries(state.advisor.answers).filter(([, value]) => value);
  if (!selected.length) return null;
  const maxWeight = selected.reduce((sum, [field]) => sum + ADVISOR_WEIGHTS[field], 0);
  let earned = 0; const reasons = [];
  selected.forEach(([field, value]) => {
    const match = advisorMatchScore(perfume, field, value);
    if (match <= 0) return;
    earned += ADVISOR_WEIGHTS[field] * match;
    if (match < .5 && field !== "age" && field !== "intensity") return;
    const labels = {
      category: match === 1 ? `Coincide con ${value}` : "Perfil unisex compatible",
      age: `Afinidad orientativa con ${value.toLowerCase()}`,
      occasion: `Encaja con ${value.toLowerCase()}`,
      profile: `Perfil ${value.toLowerCase()}`,
      intensity: `Intensidad ${value.toLowerCase()}`,
      climate: `Funciona en clima ${value.toLowerCase()}`
    };
    reasons.push(labels[field]);
  });
  const percentage = Math.round((earned / maxWeight) * 100);
  return { perfume, percentage, reasons: reasons.slice(0, 5), matched: reasons.length, criteria: selected.length };
}
function advisorRecommendations() {
  const ranked = state.perfumes.map(scoreAdvisorPerfume).filter(Boolean)
    .filter(item => item.percentage >= MIN_RECOMMENDATION_SCORE)
    .sort((a,b) => b.percentage - a.percentage || b.matched - a.matched || a.perfume.name.localeCompare(b.perfume.name,"es"));

  // Mantiene precisión, pero evita que cinco empates del mismo diseñador hagan
  // sentir al Asesor repetitivo cuando existen alternativas casi igual de fuertes.
  const selected = [];
  const usedDesigners = new Set();
  for (const item of ranked) {
    if (selected.length >= 5) break;
    const designer = normalize(item.perfume.designer);
    const bestScore = ranked[0]?.percentage || item.percentage;
    if (!usedDesigners.has(designer) || bestScore - item.percentage > 7 || selected.length >= 4) {
      selected.push(item);
      usedDesigners.add(designer);
    }
  }
  if (selected.length < 5) {
    for (const item of ranked) {
      if (selected.length >= 5) break;
      if (!selected.includes(item)) selected.push(item);
    }
  }
  return selected.slice(0,5);
}
function recommendationCard(result, index) {
  const card = document.createElement("article");
  card.className = "advisor-result-card";
  const medal = ["🥇","🥈","🥉","④","⑤"][index] || "✦";
  card.innerHTML = `
    <div class="advisor-result-top">
      <span class="advisor-rank" aria-hidden="true">${medal}</span>
      <div><p>${result.perfume.designer}</p><h4>${result.perfume.name}</h4><small>CLAVE ${result.perfume.code}</small></div>
      <strong class="advisor-score">${result.percentage}%</strong>
    </div>
    <div class="advisor-why"><span>Por qué coincide</span><ul>${result.reasons.map(reason => `<li>${reason}</li>`).join("")}</ul></div>
    <button type="button">Ver perfil completo →</button>`;
  card.querySelector("button").addEventListener("click", () => {
    closeAdvisor(); openPerfume(result.perfume);
  });
  return card;
}
function showAdvisorResults() {
  const selectedCount = Object.values(state.advisor.answers).filter(Boolean).length;
  if (!selectedCount) {
    elements.advisorResultsIntro.textContent = "Selecciona por lo menos un criterio para poder calcular una coincidencia.";
  } else {
    elements.advisorResultsIntro.textContent = `Calculado con ${selectedCount} ${selectedCount === 1 ? "criterio" : "criterios"} seleccionados. Comparamos categoría, afinidad de edad, ocasión, perfil, intensidad y clima para mostrar hasta cinco coincidencias sólidas.`;
  }
  const results = selectedCount ? advisorRecommendations() : [];
  elements.advisorRecommendations.replaceChildren(...results.map(recommendationCard));
  elements.advisorNoMatch.hidden = results.length > 0;
  elements.advisorSteps.hidden = true; elements.advisorResults.hidden = false;
  elements.advisorNext.hidden = true; elements.advisorBack.hidden = true; elements.advisorSkip.hidden = true;
  elements.advisorRestart.hidden = false;
  elements.advisorProgressBar.style.width = "100%";
  elements.advisorProgressText.textContent = "Recomendación lista";
  updateAdvisorAtmosphere();
}
function restartAdvisor() {
  state.advisor.step = 0;
  state.advisor.answers = { category: "", age: "", occasion: "", profile: "", intensity: "", climate: "" };
  elements.advisorResults.hidden = true; elements.advisorSteps.hidden = false;
  elements.advisorRestart.hidden = true; elements.advisorNext.hidden = false;
  elements.advisorBack.hidden = false; elements.advisorSkip.hidden = false;
  renderAdvisorOptions(); updateAdvisorStep();
}

const SEARCH_SUGGESTIONS = ["Dior", "Aventus", "Imagination", "Ariana Grande", "Victoria's Secret", "Baccarat Rouge", "Louis Vuitton"];
let searchSuggestionIndex = 0;
let searchPlaceholderTimer;
function rotateSearchPlaceholder() {
  if (document.activeElement === elements.search || state.query) return;
  const suggestion = SEARCH_SUGGESTIONS[searchSuggestionIndex % SEARCH_SUGGESTIONS.length];
  elements.search.placeholder = `Busca ${suggestion}...`;
  searchSuggestionIndex += 1;
}
function startSearchPlaceholderRotation() {
  rotateSearchPlaceholder();
  searchPlaceholderTimer = window.setInterval(rotateSearchPlaceholder, 3200);
}
function syncSearchInputs(value) {
  const nextValue = String(value ?? "");
  // Asignar el valor a ambas barras no dispara eventos input, por lo que es seguro
  // y evita que la barra que originó una limpieza conserve texto visualmente.
  if (elements.search) elements.search.value = nextValue;
  if (elements.catalogSearch) elements.catalogSearch.value = nextValue;
  if (elements.catalogSearchClear) elements.catalogSearchClear.hidden = !nextValue.trim();
  document.body.classList.toggle("search-has-query", Boolean(nextValue.trim()));
}
function applySearch(value, { scroll = false, scrollBehavior = "smooth" } = {}) {
  state.query = String(value ?? "").trim();
  syncSearchInputs(value);
  render();
  if (scroll) scrollToCatalog(scrollBehavior);
}

let catalogSearchEngaged = false;
let catalogSearchPositioning = false;
let catalogSearchPositioningTimer = 0;
let catalogSearchAnchorPending = false;
let catalogSearchAnchorFrame = 0;

function catalogCardsSearchTarget() {
  const catalogGrid = elements.catalog;
  if (!catalogGrid) return null;
  const dockHeight = elements.catalogSearchDock?.getBoundingClientRect().height || 52;
  const viewportOffset = window.visualViewport ? Math.max(0, window.visualViewport.offsetTop || 0) : 0;
  const safeTop = Math.max(14, dockHeight + 16 + viewportOffset);
  const absoluteGridTop = window.scrollY + catalogGrid.getBoundingClientRect().top;
  return Math.max(0, absoluteGridTop - safeTop);
}

function positionCatalogCardsForContextSearch(behavior = "auto") {
  const targetTop = catalogCardsSearchTarget();
  if (targetTop == null) return;
  catalogSearchEngaged = true;
  scheduleCatalogSearchDockUpdate();
  if (Math.abs(window.scrollY - targetTop) < 8) return;

  catalogSearchPositioning = true;
  clearTimeout(catalogSearchPositioningTimer);
  window.scrollTo({ top: targetTop, left: 0, behavior });
  catalogSearchPositioningTimer = window.setTimeout(() => {
    catalogSearchPositioning = false;
    scheduleCatalogSearchDockUpdate();
  }, behavior === "smooth" ? 520 : 120);
}

function scheduleCatalogSearchAnchor(behavior = "auto") {
  cancelAnimationFrame(catalogSearchAnchorFrame);
  catalogSearchAnchorFrame = requestAnimationFrame(() => {
    // Esperar un segundo frame permite que render() reconstruya la primera fila
    // antes de calcular su posición definitiva. Esto evita anclar usando la altura
    // de la consulta anterior.
    catalogSearchAnchorFrame = requestAnimationFrame(() => {
      catalogSearchAnchorFrame = 0;
      positionCatalogCardsForContextSearch(behavior);
    });
  });
}

function beginCatalogSearchSession() {
  catalogSearchEngaged = true;
  catalogSearchAnchorPending = true;
  scheduleCatalogSearchDockUpdate();
  // Movimiento preventivo al tocar la barra. La primera edición de texto vuelve a
  // verificar el ancla después del render, por lo que Safari no puede dejarla a medias.
  scheduleCatalogSearchAnchor("auto");
}

function anchorCatalogSearchAfterFirstEdit() {
  if (!catalogSearchAnchorPending) return;
  catalogSearchAnchorPending = false;
  scheduleCatalogSearchAnchor("auto");
}

function updateCatalogSearchVisualViewport() {
  if (!elements.catalogSearchDock) return;
  const viewport = window.visualViewport;
  // iOS/Safari puede desplazar el visual viewport cuando aparece el teclado.
  // Compensamos ese offset para que el buscador nunca quede arriba de la zona visible.
  const offsetTop = viewport ? Math.max(0, viewport.offsetTop || 0) : 0;
  elements.catalogSearchDock.style.setProperty("--catalog-search-viewport-offset", `${offsetTop}px`);
}
function executeSearch() {
  applySearch(elements.search.value, { scroll: true });
}

elements.categoryFilters.forEach(button => button.addEventListener("click", () => {
  state.category = button.dataset.category || "";
  render();
  scrollToCatalog();
}));
elements.search.addEventListener("focus", () => {
  elements.search.placeholder = "Busca por nombre, diseñador o clave...";
  document.body.classList.add("search-active");
});
elements.search.addEventListener("blur", () => {
  document.body.classList.remove("search-active");
  if (!state.query) rotateSearchPlaceholder();
});
elements.search.addEventListener("input", event => {
  applySearch(event.target.value);
});
elements.search.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    executeSearch();
  }
});
elements.submitSearch.addEventListener("click", executeSearch);
if (elements.catalogSearch) {
  elements.catalogSearch.addEventListener("pointerdown", () => {
    // Cada nueva interacción con la barra inicia una sesión. Si el cliente bajó
    // dentro de Valentino/Dior/etc., el primer resultado vuelve a quedar arriba.
    beginCatalogSearchSession();
  });
  elements.catalogSearch.addEventListener("focus", () => {
    catalogSearchEngaged = true;
    if (!catalogSearchAnchorPending) catalogSearchAnchorPending = true;
    updateCatalogSearchVisualViewport();
    scheduleCatalogSearchDockUpdate();
    scheduleCatalogSearchAnchor("auto");
  });
  elements.catalogSearch.addEventListener("input", event => {
    catalogSearchEngaged = true;
    applySearch(event.target.value);
    // Solo la PRIMERA edición de esta sesión reposiciona, y se hace después de
    // renderizar los resultados nuevos. Las letras siguientes jamás hacen scroll.
    anchorCatalogSearchAfterFirstEdit();
    scheduleCatalogSearchDockUpdate();
  });
  elements.catalogSearch.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      applySearch(event.currentTarget.value);
      anchorCatalogSearchAfterFirstEdit();
      // Enter confirma la consulta y únicamente cierra el teclado móvil.
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  });
}
if (elements.catalogSearchClear) {
  elements.catalogSearchClear.addEventListener("click", () => {
    catalogSearchEngaged = true;
    catalogSearchAnchorPending = false;
    applySearch("");
    scheduleCatalogSearchAnchor("auto");
    elements.catalogSearch?.focus({ preventScroll: true });
  });
}
elements.clearSearch.addEventListener("click", () => {
  applySearch("");
  elements.search.focus();
});
elements.designerFilter.addEventListener("change",event=>setFilter("designer",event.target.value));
elements.familyFilter.addEventListener("change",event=>setFilter("family",event.target.value));
elements.resetFilters.addEventListener("click",()=>{state.query="";state.category="";state.designer="";state.family="";state.tags.clear();syncSearchInputs("");elements.designerFilter.value="";elements.familyFilter.value="";render();});
elements.closeDialog.addEventListener("click",()=>closePerfume());
elements.dialog.addEventListener("click",event=>{if(event.target===elements.dialog)closePerfume();});
elements.dialog.addEventListener("cancel",event=>{event.preventDefault();closePerfume();});
elements.dialog.addEventListener("scroll", updateDetailScrollProgress, { passive: true });
elements.openAdvisor.addEventListener("click", openAdvisor);
elements.closeAdvisor.addEventListener("click", closeAdvisor);
elements.advisorDialog.addEventListener("click", event => { if (event.target === elements.advisorDialog) closeAdvisor(); });
elements.advisorDialog.addEventListener("cancel", event => { event.preventDefault(); closeAdvisor(); });
elements.advisorBack.addEventListener("click", () => { if (state.advisor.step > 0) { state.advisor.step -= 1; updateAdvisorStep(); } });
elements.advisorSkip.addEventListener("click", () => {
  const field = ADVISOR_FIELDS[state.advisor.step].key;
  state.advisor.answers[field] = "";
  renderAdvisorOptions();
  if (state.advisor.step === ADVISOR_FIELDS.length - 1) showAdvisorResults();
  else { state.advisor.step += 1; updateAdvisorStep(); }
});
elements.advisorNext.addEventListener("click", () => {
  if (state.advisor.step === ADVISOR_FIELDS.length - 1) showAdvisorResults();
  else { state.advisor.step += 1; updateAdvisorStep(); }
});
elements.advisorRestart.addEventListener("click", restartAdvisor);
window.addEventListener("popstate",()=>location.hash.startsWith("#perfume=")?openFromHash():closePerfume(false));

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`No fue posible cargar ${path}.`);
  return response.json();
}

async function loadCorePerfumes() {
  if (!window.PriveCoreAdapter) {
    console.warn("PRIVÉ Core Adapter no está disponible; se usará el catálogo heredado.");
    return [];
  }
  try {
    const manifest = await fetchJson(`data/core/catalog.json?v=${CORE_DATA_VERSION}`);
    const files = Array.isArray(manifest.perfumes) ? manifest.perfumes : [];
    return await Promise.all(files.map(file => fetchJson(`data/core/${file}?v=${CORE_DATA_VERSION}`)));
  } catch (error) {
    console.warn("No fue posible cargar PRIVÉ Core; se usará el catálogo heredado.", error);
    return [];
  }
}

let catalogDockFrame = 0;
function updateCatalogSearchDock() {
  catalogDockFrame = 0;
  if (!elements.catalogSearchDock) return;
  const catalogSection = document.getElementById("catalogo");
  const catalogGrid = elements.catalog;
  if (!catalogSection || !catalogGrid) return;
  updateCatalogSearchVisualViewport();
  const gridRect = catalogGrid.getBoundingClientRect();
  const sectionRect = catalogSection.getBoundingClientRect();
  const dialogOpen = document.body.classList.contains("dialog-open");
  const searchFocused = document.activeElement === elements.catalogSearch;
  const catalogThreshold = Math.min(window.innerHeight * .58, 520);
  const inCatalogZone = gridRect.top <= catalogThreshold && sectionRect.bottom > 96;

  // Solo abandonamos el modo de búsqueda cuando el usuario realmente volvió al Home.
  // No lo apagamos por pequeños saltos de layout, re-render, teclado o cierre de ficha.
  if (!dialogOpen && !searchFocused && !catalogSearchPositioning && sectionRect.top > catalogThreshold + 80) {
    catalogSearchEngaged = false;
  }

  const shouldShow = !dialogOpen && (searchFocused || catalogSearchPositioning || catalogSearchEngaged || inCatalogZone);
  elements.catalogSearchDock.classList.toggle("is-visible", shouldShow);
  elements.catalogSearchDock.setAttribute("aria-hidden", String(!shouldShow));
}
function scheduleCatalogSearchDockUpdate() {
  if (catalogDockFrame) return;
  catalogDockFrame = requestAnimationFrame(updateCatalogSearchDock);
}

async function init(){
  if (!location.hash.startsWith("#perfume=")) {
    history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
  try{
    const [legacyPerfumes, corePerfumes] = await Promise.all([
      fetchJson("data/perfumes.json"),
      loadCorePerfumes()
    ]);
    state.perfumes = window.PriveCoreAdapter
      ? window.PriveCoreAdapter.mergeCatalogs(legacyPerfumes, corePerfumes)
      : legacyPerfumes;
    console.info(`PRIVÉ: ${state.perfumes.length} fragancias cargadas (${corePerfumes.length} desde Core).`);
    populateFilters(); render(); syncSearchInputs(state.query); renderAdvisorOptions(); startSearchPlaceholderRotation(); openFromHash(); scheduleCatalogSearchDockUpdate();
  }catch(error){
    elements.catalog.innerHTML='<p class="load-error">No se pudo cargar el catálogo. Intenta actualizar la página.</p>';
    console.error(error);
  }
}

window.addEventListener("scroll", () => {
  scheduleCatalogSearchDockUpdate();
  const now = performance.now();
  const deltaY = Math.abs(window.scrollY - lastCatalogScrollY);
  const deltaT = Math.max(1, now - lastCatalogScrollTime);
  const velocity = deltaY / deltaT;
  lastCatalogScrollY = window.scrollY;
  lastCatalogScrollTime = now;
  if (velocity > 1.25 || deltaY > 320) catalogScrollBusy = true;
  queueNearbyCatalogImages();
  // Nunca descargamos imágenes durante el desplazamiento: hacerlo provoca
  // parpadeo visible cuando Safari alterna entre liberar y volver a pedir recursos.
  clearTimeout(catalogScrollIdleTimer);
  catalogScrollIdleTimer = window.setTimeout(() => {
    catalogScrollBusy = false;
    releaseFarCatalogImages();
    pumpCatalogImageQueue();
  }, CATALOG_IDLE_DELAY);
}, { passive: true });

window.addEventListener("pageshow", event => {
  // No alteramos el scroll restaurado por Safari al volver desde memoria/bfcache.
  if (!event.persisted && !location.hash.startsWith("#perfume=") && window.scrollY < 2) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
});
init();

if (typeof ResizeObserver !== "undefined" && elements.detailBottleStage) {
  const detailStageObserver = new ResizeObserver(() => layoutDetailBottle());
  detailStageObserver.observe(elements.detailBottleStage);
}
window.addEventListener("resize", () => { layoutDetailBottle(); updateCatalogSearchVisualViewport(); scheduleCatalogSearchDockUpdate(); }, { passive: true });
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => { updateCatalogSearchVisualViewport(); scheduleCatalogSearchDockUpdate(); }, { passive: true });
  window.visualViewport.addEventListener("scroll", () => { updateCatalogSearchVisualViewport(); scheduleCatalogSearchDockUpdate(); }, { passive: true });
}
