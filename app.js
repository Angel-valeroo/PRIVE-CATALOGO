const state = {
  perfumes: [], query: "", designer: "", family: "", category: "",
  tags: new Set(), selectedPerfume: null,
  advisor: { step: 0, answers: { category: "", occasion: "", profile: "", climate: "" } }
};

const IMAGE_BASE_PATH = "IMAGES/Caballero";
const IMAGE_EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png"];
const MIN_RECOMMENDATION_SCORE = 85;

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
  catalog: $("#catalog"), template: $("#perfumeCardTemplate"), search: $("#search"),
  clearSearch: $("#clearSearch"), designerFilter: $("#designerFilter"), familyFilter: $("#familyFilter"),
  familyFilterField: $("#familyFilterField"), resetFilters: $("#resetFilters"),
  resultCount: $("#resultCount"), resultLabel: $("#resultLabel"), emptyState: $("#emptyState"),
  activeFilters: $("#activeFilters"),
  dialog: $("#perfumeDialog"), closeDialog: $("#closeDialog"),
  detailImage: $("#detailImage"), detailFallback: $("#detailFallback"), detailMonogram: $("#detailMonogram"),
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
  return [...new Set([...asList(perfume.contexts), ...asList(perfume.occasions), ...asList(perfume.climates), ...asList(perfume.seasons), ...asList(perfume.accords)])];
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
  monogram.textContent = initials(perfume.designer);
  image.alt = `${perfume.name} de ${perfume.designer}`;
  image.hidden = false; image.classList.add("is-loading"); fallback.hidden = false;
  const tryNextExtension = () => {
    if (extensionIndex >= IMAGE_EXTENSIONS.length) {
      image.onload = null; image.onerror = null; image.removeAttribute("src"); image.hidden = true;
      image.classList.remove("is-loading"); fallback.hidden = false; return;
    }
    image.src = `${IMAGE_BASE_PATH}/${encodeURIComponent(perfume.code)}.${IMAGE_EXTENSIONS[extensionIndex++]}`;
  };
  image.onload = () => { image.classList.remove("is-loading"); fallback.hidden = true; };
  image.onerror = tryNextExtension; tryNextExtension();
}
function configureImage(card, perfume) {
  loadImage(card.querySelector(".perfume-image"), card.querySelector(".image-fallback"), card.querySelector(".monogram"), perfume);
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
  return [...new Set([...asList(perfume.contexts), ...asList(perfume.climates), ...asList(perfume.seasons), ...asList(perfume.accords)])].slice(0, 12);
}
function similarityScore(reference, candidate) {
  if (reference.id === candidate.id) return -1;
  let score = 0;
  if (reference.family && reference.family === candidate.family) score += 8;
  const shared = (field, weight) => asList(reference[field]).filter(item => asList(candidate[field]).includes(item)).length * weight;
  score += shared("accords", 3) + shared("contexts", 3) + shared("climates", 2) + shared("occasions", 2) + shared("seasons", 1);
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
function openPerfume(perfume, updateHash = true) {
  state.selectedPerfume = perfume;
  elements.detailDesigner.textContent = perfume.designer; elements.detailName.textContent = perfume.name;
  elements.detailCode.textContent = `CLAVE ${perfume.code}`;
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
  elements.dialog.scrollTop = 0; document.body.classList.add("dialog-open");
  if (updateHash) history.pushState({ perfume: perfume.id }, "", `#perfume=${encodeURIComponent(perfume.id)}`);
}
function closePerfume(updateHash = true) {
  state.selectedPerfume = null;
  if (elements.dialog.open) elements.dialog.close();
  if (!elements.advisorDialog.open) document.body.classList.remove("dialog-open");
  if (updateHash && location.hash.startsWith("#perfume=")) history.pushState({}, "", location.pathname + location.search);
}
function render() {
  const results = filteredPerfumes(); const fragment = document.createDocumentFragment();
  results.forEach(perfume => {
    const card = elements.template.content.cloneNode(true); const article = card.querySelector(".perfume-card");
    const designer = card.querySelector(".designer"); const openButtons = card.querySelectorAll(".card-open, .name-button, .details-link");
    designer.textContent = perfume.designer; designer.addEventListener("click", () => setFilter("designer", perfume.designer));
    card.querySelector(".perfume-name").textContent = perfume.name;
    card.querySelector(".product-code").textContent = `CLAVE ${perfume.code}`; article.dataset.perfumeId = perfume.id;
    const meta = card.querySelector(".card-meta");
    const metaValues = [perfume.family, ...asList(perfume.contexts).slice(0,1), ...asList(perfume.accords).slice(0,1)].filter(Boolean);
    meta.textContent = metaValues.join(" · "); meta.hidden = metaValues.length === 0;
    openButtons.forEach(button => button.addEventListener("click", () => openPerfume(perfume)));
    configureImage(card, perfume); fragment.appendChild(card);
  });
  elements.catalog.replaceChildren(fragment); elements.resultCount.textContent = results.length.toLocaleString("es-MX");
  elements.resultLabel.textContent = results.length === 1 ? "fragancia" : "fragancias";
  elements.emptyState.hidden = results.length !== 0;
  elements.clearSearch.classList.toggle("visible", Boolean(state.query));
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

elements.search.addEventListener("input",event=>{state.query=event.target.value;render();});
elements.clearSearch.addEventListener("click",()=>{state.query="";elements.search.value="";elements.search.focus();render();});
elements.designerFilter.addEventListener("change",event=>setFilter("designer",event.target.value));
elements.familyFilter.addEventListener("change",event=>setFilter("family",event.target.value));
elements.resetFilters.addEventListener("click",()=>{state.query="";state.category="";state.designer="";state.family="";state.tags.clear();elements.search.value="";elements.designerFilter.value="";elements.familyFilter.value="";render();});
elements.closeDialog.addEventListener("click",()=>closePerfume());
elements.dialog.addEventListener("click",event=>{if(event.target===elements.dialog)closePerfume();});
elements.dialog.addEventListener("cancel",event=>{event.preventDefault();closePerfume();});
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

async function init(){
  try{
    const response=await fetch("data/perfumes.json");
    if(!response.ok) throw new Error("No fue posible cargar el catálogo.");
    state.perfumes=await response.json();
    populateFilters(); render(); renderAdvisorOptions(); openFromHash();
  }catch(error){
    elements.catalog.innerHTML='<p class="load-error">No se pudo cargar el catálogo. Intenta actualizar la página.</p>';
    console.error(error);
  }
}
init();