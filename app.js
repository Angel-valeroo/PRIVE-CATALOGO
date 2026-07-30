const state = {
  perfumes: [], query: "", designer: "", family: "", category: "",
  tags: new Set(), selectedPerfume: null,
  advisor: { step: 0, answers: { category: "", occasion: "", profile: "", climate: "" } }
};

const IMAGE_BASE_PATH = "IMAGES";
const IMAGE_EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png"];
const MIN_RECOMMENDATION_SCORE = 85;
const CORE_DATA_VERSION = "master-004-scrollfix-v46";
const IS_MOBILE_CATALOG = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;
const CATALOG_IMAGE_ROOT_MARGIN = IS_MOBILE_CATALOG ? "900px 0px" : "1600px 0px";
const CATALOG_IMAGE_CONCURRENCY = IS_MOBILE_CATALOG ? 3 : 6;
const CATALOG_VIRTUAL_OVERSCAN_ROWS = IS_MOBILE_CATALOG ? 5 : 4;
const CATALOG_VIRTUAL_MIN_ROWS = IS_MOBILE_CATALOG ? 12 : 10;

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
  { key: "occasion", values: ["Día", "Noche", "Diario", "Oficina", "Cita", "Fiesta", "Evento", "Playa", "Gimnasio", "Escuela", "Viaje"] },
  { key: "profile", values: ["Fresco", "Acuático", "Dulce", "Amaderado", "Aromático", "Cítrico", "Afrutado", "Floral", "Especiado"] },
  { key: "climate", values: ["Calor", "Templado", "Frío"] }
];

const ADVISOR_WEIGHTS = { category: 30, occasion: 25, profile: 30, climate: 15 };
const $ = selector => document.querySelector(selector);

const elements = {
  catalog: $("#catalog"), template: $("#perfumeCardTemplate"), search: $("#search"), submitSearch: $("#submitSearch"),
  clearSearch: $("#clearSearch"), designerFilter: $("#designerFilter"), familyFilter: $("#familyFilter"),
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
let catalogImageObserver = null;
let catalogImageActiveLoads = 0;
const catalogImageQueue = [];
const catalogImageQueued = new WeakSet();
let virtualCatalogResults = [];
let virtualCatalogStartRow = -1;
let virtualCatalogEndRow = -1;
let virtualCatalogColumns = 0;
let virtualCatalogRowPitch = 0;
let virtualCatalogFrame = 0;
let virtualCatalogResizeTimer = 0;

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
function loadImage(image, fallback, monogram, perfume) {
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
      return;
    }
    const extension = IMAGE_EXTENSIONS[extensionIndex++];
    image.src = `${IMAGE_BASE_PATH}/${encodeURIComponent(perfume.category)}/${encodeURIComponent(perfume.code)}.${extension}`;
  };

  image.onload = revealCurrentImage;
  image.onerror = tryNextExtension;
  tryNextExtension();
}
function pumpCatalogImageQueue() {
  while (catalogImageActiveLoads < CATALOG_IMAGE_CONCURRENCY && catalogImageQueue.length) {
    const task = catalogImageQueue.shift();
    if (!task?.image?.isConnected || task.image.dataset.loaded === "true") continue;
    const { image, card, perfume } = task;
    catalogImageActiveLoads += 1;
    image.dataset.loaded = "true";
    const finish = () => {
      catalogImageActiveLoads = Math.max(0, catalogImageActiveLoads - 1);
      pumpCatalogImageQueue();
    };
    image.addEventListener("load", finish, { once: true });
    image.addEventListener("error", finish, { once: true });
    loadImage(image, card.querySelector(".image-fallback"), card.querySelector(".monogram"), perfume);
  }
}

function queueCatalogImage(image) {
  if (!image || image.dataset.loaded === "true" || catalogImageQueued.has(image)) return;
  const card = image.closest(".perfume-card");
  const perfumeId = card?.dataset.perfumeId;
  const perfume = state.perfumes.find(item => item.id === perfumeId);
  if (!card || !perfume) return;
  catalogImageQueued.add(image);
  catalogImageQueue.push({ image, card, perfume });
  pumpCatalogImageQueue();
}

function ensureCatalogImageObserver() {
  if (catalogImageObserver || typeof IntersectionObserver === "undefined") return;
  catalogImageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) queueCatalogImage(entry.target);
    });
  }, { root: null, rootMargin: CATALOG_IMAGE_ROOT_MARGIN, threshold: 0.01 });
}

function configureImage(card, perfume) {
  const image = card.querySelector(".perfume-image");
  const fallback = card.querySelector(".image-fallback");
  const monogram = card.querySelector(".monogram");
  image.removeAttribute("src");
  image.loading = "lazy";
  image.decoding = "async";
  image.fetchPriority = "low";
  image.dataset.loaded = "false";
  monogram.textContent = initials(perfume.designer);
  fallback.hidden = false;
  ensureCatalogImageObserver();
  if (catalogImageObserver) catalogImageObserver.observe(image);
  else loadImage(image, fallback, monogram, perfume);
}
function scrollToCatalog() { $("#catalogo").scrollIntoView({ behavior: "smooth", block: "start" }); }
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
  if (updateHash) history.pushState({ perfume: perfume.id }, "", `#perfume=${encodeURIComponent(perfume.id)}`);
}
function closePerfume(updateHash = true) {
  detailOpenSequence += 1;
  clearTimeout(detailCueTimer);
  state.selectedPerfume = null;
  elements.dialog.classList.remove("detail-resetting-scroll", "detail-switching");
  if (elements.dialog.open) elements.dialog.close();
  if (!elements.advisorDialog.open) document.body.classList.remove("dialog-open");
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

function resetCatalogImages() {
  if (catalogImageObserver) catalogImageObserver.disconnect();
  catalogImageObserver = null;
  catalogImageQueue.length = 0;
}

function catalogColumnCount() {
  const template = getComputedStyle(elements.catalog).gridTemplateColumns;
  const columns = template && template !== "none" ? template.split(/\s+/).filter(Boolean).length : 1;
  return Math.max(1, columns);
}

function catalogGridGap() {
  const styles = getComputedStyle(elements.catalog);
  return parseFloat(styles.rowGap || styles.gap || "0") || 0;
}

function createVirtualSpacer(height, position) {
  const spacer = document.createElement("div");
  spacer.className = `catalog-virtual-spacer catalog-virtual-spacer--${position}`;
  spacer.style.height = `${Math.max(0, height).toFixed(2)}px`;
  spacer.setAttribute("aria-hidden", "true");
  return spacer;
}

function measureVirtualRow() {
  const firstCard = elements.catalog.querySelector(".perfume-card");
  if (!firstCard) return;
  const height = firstCard.getBoundingClientRect().height;
  if (height > 100) virtualCatalogRowPitch = height + catalogGridGap();
}

function unobserveCurrentCatalogImages() {
  if (!catalogImageObserver) return;
  elements.catalog.querySelectorAll(".perfume-image").forEach(image => catalogImageObserver.unobserve(image));
}

function renderVirtualCatalogWindow(force = false) {
  cancelAnimationFrame(virtualCatalogFrame);
  virtualCatalogFrame = requestAnimationFrame(() => {
    const results = virtualCatalogResults;
    if (!results.length) {
      elements.catalog.replaceChildren();
      return;
    }

    const columns = catalogColumnCount();
    const catalogTop = elements.catalog.getBoundingClientRect().top + window.scrollY;
    const estimatedCardHeight = Math.max(360, elements.catalog.clientWidth / columns * 1.78);
    const rowPitch = virtualCatalogRowPitch || (estimatedCardHeight + catalogGridGap());
    const totalRows = Math.ceil(results.length / columns);
    const viewportTop = Math.max(0, window.scrollY - catalogTop);
    const visibleStartRow = Math.max(0, Math.floor(viewportTop / rowPitch));
    const visibleRows = Math.max(CATALOG_VIRTUAL_MIN_ROWS, Math.ceil(window.innerHeight / rowPitch) + 2);
    const startRow = Math.max(0, visibleStartRow - CATALOG_VIRTUAL_OVERSCAN_ROWS);
    const endRow = Math.min(totalRows, visibleStartRow + visibleRows + CATALOG_VIRTUAL_OVERSCAN_ROWS);

    if (!force && columns === virtualCatalogColumns && startRow === virtualCatalogStartRow && endRow === virtualCatalogEndRow) return;
    virtualCatalogColumns = columns;
    virtualCatalogStartRow = startRow;
    virtualCatalogEndRow = endRow;

    const gap = catalogGridGap();
    const fragment = document.createDocumentFragment();
    if (startRow > 0) fragment.appendChild(createVirtualSpacer(startRow * rowPitch - gap, "top"));
    const startIndex = startRow * columns;
    const endIndex = Math.min(results.length, endRow * columns);
    for (let index = startIndex; index < endIndex; index += 1) {
      fragment.appendChild(createCatalogCard(results[index], index));
    }
    if (endRow < totalRows) fragment.appendChild(createVirtualSpacer((totalRows - endRow) * rowPitch - gap, "bottom"));
    unobserveCurrentCatalogImages();
    elements.catalog.replaceChildren(fragment);

    requestAnimationFrame(() => {
      const previousPitch = virtualCatalogRowPitch;
      measureVirtualRow();
      if (!previousPitch && virtualCatalogRowPitch) renderVirtualCatalogWindow(true);
    });
  });
}

function render() {
  const results = filteredPerfumes();
  catalogRenderToken += 1;
  resetCatalogImages();
  virtualCatalogResults = results;
  virtualCatalogStartRow = -1;
  virtualCatalogEndRow = -1;
  virtualCatalogColumns = 0;
  virtualCatalogRowPitch = 0;
  elements.catalog.replaceChildren();
  renderVirtualCatalogWindow(true);
  elements.resultCount.textContent = results.length.toLocaleString("es-MX");
  elements.resultLabel.textContent = results.length === 1 ? "fragancia" : "fragancias";
  elements.emptyState.hidden = results.length !== 0;
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
  if (field === "category") return config.values;
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
      button.innerHTML = `<span aria-hidden="true">${TAG_ICONS[value] || "•"}</span><strong>${value}</strong>`;
      button.addEventListener("click", () => {
        state.advisor.answers[field] = state.advisor.answers[field] === value ? "" : value;
        renderAdvisorOptions(); updateAdvisorNavigation();
      });
      return button;
    });
    container.replaceChildren(...buttons);
  });
}
function openAdvisor() {
  state.advisor.step = 0;
  state.advisor.answers = { category: "", occasion: "", profile: "", climate: "" };
  elements.advisorResults.hidden = true; elements.advisorSteps.hidden = false;
  elements.advisorRestart.hidden = true; elements.advisorNext.hidden = false;
  elements.advisorBack.hidden = false; elements.advisorSkip.hidden = false;
  renderAdvisorOptions(); updateAdvisorStep();
  if (!elements.advisorDialog.open) elements.advisorDialog.showModal();
  document.body.classList.add("dialog-open");
}
function closeAdvisor() {
  if (elements.advisorDialog.open) elements.advisorDialog.close();
  if (!elements.dialog.open) document.body.classList.remove("dialog-open");
}
function updateAdvisorStep() {
  document.querySelectorAll(".advisor-step").forEach((step, index) => step.classList.toggle("is-active", index === state.advisor.step));
  const progress = ((state.advisor.step + 1) / ADVISOR_FIELDS.length) * 100;
  elements.advisorProgressBar.style.width = `${progress}%`;
  elements.advisorProgressText.textContent = `Paso ${state.advisor.step + 1} de ${ADVISOR_FIELDS.length}`;
  updateAdvisorNavigation();
}
function updateAdvisorNavigation() {
  elements.advisorBack.disabled = state.advisor.step === 0;
  const field = ADVISOR_FIELDS[state.advisor.step]?.key;
  const hasAnswer = Boolean(field && state.advisor.answers[field]);
  elements.advisorNext.textContent = state.advisor.step === ADVISOR_FIELDS.length - 1 ? "Ver recomendaciones" : "Continuar";
  elements.advisorSkip.textContent = hasAnswer ? "Quitar respuesta" : "Omitir";
}
function advisorMatch(perfume, field, value) {
  if (!value) return false;
  if (field === "category") {
    return normalize(perfume.category) === normalize(value)
      || normalize(perfume.category) === "unisex"
      || normalize(value) === "unisex";
  }
  if (field === "occasion") {
    return includesNormalized(perfume.occasions, value) || includesNormalized(perfume.contexts, value);
  }
  if (field === "profile") return includesNormalized(perfume.accords, value);
  if (field === "climate") return includesNormalized(perfume.climates, value);
  return false;
}
function scoreAdvisorPerfume(perfume) {
  const selected = Object.entries(state.advisor.answers).filter(([, value]) => value);
  if (!selected.length) return null;
  const maxWeight = selected.reduce((sum, [field]) => sum + ADVISOR_WEIGHTS[field], 0);
  let earned = 0; const reasons = [];
  selected.forEach(([field, value]) => {
    if (advisorMatch(perfume, field, value)) {
      earned += ADVISOR_WEIGHTS[field];
      const labels = {
        category: `Coincide con ${value}`,
        occasion: `Ideal para ${value.toLowerCase()}`,
        profile: `Perfil ${value.toLowerCase()}`,
        climate: `Funciona en clima ${value.toLowerCase()}`
      };
      reasons.push(labels[field]);
    }
  });
  const percentage = Math.round((earned / maxWeight) * 100);
  return { perfume, percentage, reasons, matched: reasons.length, criteria: selected.length };
}
function advisorRecommendations() {
  return state.perfumes.map(scoreAdvisorPerfume).filter(Boolean)
    .filter(item => item.percentage >= MIN_RECOMMENDATION_SCORE)
    .sort((a,b) => b.percentage - a.percentage || b.matched - a.matched || a.perfume.name.localeCompare(b.perfume.name,"es"))
    .slice(0,3);
}
function recommendationCard(result, index) {
  const card = document.createElement("article");
  card.className = "advisor-result-card";
  const medal = ["🥇","🥈","🥉"][index] || "✦";
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
    elements.advisorResultsIntro.textContent = `Calculado con ${selectedCount} ${selectedCount === 1 ? "criterio" : "criterios"} seleccionados. Solo mostramos coincidencias de ${MIN_RECOMMENDATION_SCORE}% o más.`;
  }
  const results = selectedCount ? advisorRecommendations() : [];
  elements.advisorRecommendations.replaceChildren(...results.map(recommendationCard));
  elements.advisorNoMatch.hidden = results.length > 0;
  elements.advisorSteps.hidden = true; elements.advisorResults.hidden = false;
  elements.advisorNext.hidden = true; elements.advisorBack.hidden = true; elements.advisorSkip.hidden = true;
  elements.advisorRestart.hidden = false;
  elements.advisorProgressBar.style.width = "100%";
  elements.advisorProgressText.textContent = "Recomendación lista";
}
function restartAdvisor() {
  state.advisor.step = 0;
  state.advisor.answers = { category: "", occasion: "", profile: "", climate: "" };
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
function executeSearch() {
  state.query = elements.search.value.trim();
  document.body.classList.toggle("search-has-query", Boolean(state.query));
  render();
  scrollToCatalog();
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
  state.query = event.target.value;
  document.body.classList.toggle("search-has-query", Boolean(state.query.trim()));
  render();
});
elements.search.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    executeSearch();
  }
});
elements.submitSearch.addEventListener("click", executeSearch);
elements.clearSearch.addEventListener("click", () => {
  state.query = "";
  elements.search.value = "";
  document.body.classList.remove("search-has-query");
  elements.search.focus();
  render();
});
elements.designerFilter.addEventListener("change",event=>setFilter("designer",event.target.value));
elements.familyFilter.addEventListener("change",event=>setFilter("family",event.target.value));
elements.resetFilters.addEventListener("click",()=>{state.query="";state.category="";state.designer="";state.family="";state.tags.clear();elements.search.value="";document.body.classList.remove("search-has-query");elements.designerFilter.value="";elements.familyFilter.value="";render();});
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
    populateFilters(); render(); renderAdvisorOptions(); startSearchPlaceholderRotation(); openFromHash();
  }catch(error){
    elements.catalog.innerHTML='<p class="load-error">No se pudo cargar el catálogo. Intenta actualizar la página.</p>';
    console.error(error);
  }
}

window.addEventListener("scroll", () => {
  renderVirtualCatalogWindow(false);
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
window.addEventListener("resize", () => {
  layoutDetailBottle();
  clearTimeout(virtualCatalogResizeTimer);
  virtualCatalogResizeTimer = window.setTimeout(() => {
    virtualCatalogStartRow = -1;
    virtualCatalogEndRow = -1;
    virtualCatalogColumns = 0;
    virtualCatalogRowPitch = 0;
    renderVirtualCatalogWindow(true);
  }, 160);
}, { passive: true });
