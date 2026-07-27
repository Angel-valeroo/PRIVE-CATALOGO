const state = {
  perfumes: [],
  query: "",
  designer: "",
  selectedPerfume: null
};

const IMAGE_BASE_PATH = "IMAGES/Caballero";
const IMAGE_EXTENSIONS = ["avif", "webp", "jpg", "jpeg", "png"];

const elements = {
  catalog: document.querySelector("#catalog"),
  template: document.querySelector("#perfumeCardTemplate"),
  search: document.querySelector("#search"),
  clearSearch: document.querySelector("#clearSearch"),
  designerFilter: document.querySelector("#designerFilter"),
  resetFilters: document.querySelector("#resetFilters"),
  resultCount: document.querySelector("#resultCount"),
  resultLabel: document.querySelector("#resultLabel"),
  emptyState: document.querySelector("#emptyState"),
  activeFilter: document.querySelector("#activeFilter"),
  activeDesigner: document.querySelector("#activeDesigner"),
  removeDesignerFilter: document.querySelector("#removeDesignerFilter"),
  dialog: document.querySelector("#perfumeDialog"),
  closeDialog: document.querySelector("#closeDialog"),
  detailImage: document.querySelector("#detailImage"),
  detailFallback: document.querySelector("#detailFallback"),
  detailMonogram: document.querySelector("#detailMonogram"),
  detailDesigner: document.querySelector("#detailDesigner"),
  detailName: document.querySelector("#detailName"),
  detailCode: document.querySelector("#detailCode"),
  detailDescription: document.querySelector("#detailDescription"),
  detailFamily: document.querySelector("#detailFamily"),
  detailNotes: document.querySelector("#detailNotes"),
  relatedPerfumes: document.querySelector("#relatedPerfumes"),
  relatedSection: document.querySelector("#relatedSection"),
  viewDesigner: document.querySelector("#viewDesigner")
};

function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function initials(designer) {
  const words = String(designer || "PRIVÉ").split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map(word => word[0]).join("").toUpperCase() || "P";
}

function filteredPerfumes() {
  const query = normalize(state.query);
  return state.perfumes.filter(perfume => {
    const matchesDesigner = !state.designer || perfume.designer === state.designer;
    const searchable = normalize(`${perfume.name} ${perfume.designer} ${perfume.code}`);
    return matchesDesigner && (!query || searchable.includes(query));
  });
}

function loadImage(image, fallback, monogram, perfume) {
  let extensionIndex = 0;
  monogram.textContent = initials(perfume.designer);
  image.alt = `${perfume.name} de ${perfume.designer}`;
  image.hidden = true;
  fallback.hidden = false;

  const tryNextExtension = () => {
    if (extensionIndex >= IMAGE_EXTENSIONS.length) {
      image.removeAttribute("src");
      image.hidden = true;
      fallback.hidden = false;
      return;
    }
    image.src = `${IMAGE_BASE_PATH}/${encodeURIComponent(perfume.code)}.${IMAGE_EXTENSIONS[extensionIndex++]}`;
  };

  image.onload = () => {
    image.hidden = false;
    fallback.hidden = true;
  };
  image.onerror = tryNextExtension;
  tryNextExtension();
}

function configureImage(card, perfume) {
  loadImage(
    card.querySelector(".perfume-image"),
    card.querySelector(".image-fallback"),
    card.querySelector(".monogram"),
    perfume
  );
}

function setDesignerFilter(designer) {
  state.designer = designer;
  elements.designerFilter.value = designer;
  closePerfume(false);
  render();
  document.querySelector(".catalog-shell").scrollIntoView({ behavior: "smooth", block: "start" });
}

function createRelatedButton(perfume) {
  const button = document.createElement("button");
  button.className = "related-card";
  button.type = "button";
  button.innerHTML = `<span>${perfume.name}</span><small>${perfume.code}</small>`;
  button.addEventListener("click", () => openPerfume(perfume));
  return button;
}

function openPerfume(perfume, updateHash = true) {
  state.selectedPerfume = perfume;
  elements.detailDesigner.textContent = perfume.designer;
  elements.detailName.textContent = perfume.name;
  elements.detailCode.textContent = `CLAVE ${perfume.code}`;
  elements.detailDescription.textContent = perfume.description || "Una fragancia de la colección PRIVÉ. La ficha olfativa detallada se incorporará progresivamente a la base de datos.";
  elements.detailFamily.textContent = perfume.family || "Información en preparación";

  const noteGroups = [perfume.topNotes, perfume.heartNotes, perfume.baseNotes].filter(Array.isArray).flat();
  elements.detailNotes.textContent = noteGroups.length ? noteGroups.join(" · ") : "Información en preparación";
  loadImage(elements.detailImage, elements.detailFallback, elements.detailMonogram, perfume);

  const related = state.perfumes
    .filter(item => item.designer === perfume.designer && item.id !== perfume.id)
    .slice(0, 4);

  elements.relatedPerfumes.replaceChildren(...related.map(createRelatedButton));
  elements.relatedSection.hidden = related.length === 0;
  elements.viewDesigner.onclick = () => setDesignerFilter(perfume.designer);
  elements.detailDesigner.onclick = () => setDesignerFilter(perfume.designer);

  if (!elements.dialog.open) elements.dialog.showModal();
  if (updateHash) history.pushState({ perfume: perfume.id }, "", `#perfume=${encodeURIComponent(perfume.id)}`);
}

function closePerfume(updateHash = true) {
  state.selectedPerfume = null;
  if (elements.dialog.open) elements.dialog.close();
  if (updateHash && location.hash.startsWith("#perfume=")) history.pushState({}, "", location.pathname + location.search);
}

function render() {
  const results = filteredPerfumes();
  const fragment = document.createDocumentFragment();
  elements.catalog.replaceChildren();

  results.forEach(perfume => {
    const card = elements.template.content.cloneNode(true);
    const article = card.querySelector(".perfume-card");
    const designer = card.querySelector(".designer");
    const openButtons = card.querySelectorAll(".card-open, .name-button, .details-link");

    designer.textContent = perfume.designer;
    designer.addEventListener("click", () => setDesignerFilter(perfume.designer));
    card.querySelector(".perfume-name").textContent = perfume.name;
    card.querySelector(".product-code").textContent = `CLAVE ${perfume.code}`;
    article.dataset.perfumeId = perfume.id;
    openButtons.forEach(button => button.addEventListener("click", () => openPerfume(perfume)));
    configureImage(card, perfume);
    fragment.appendChild(card);
  });

  elements.catalog.appendChild(fragment);
  elements.resultCount.textContent = results.length.toLocaleString("es-MX");
  elements.resultLabel.textContent = results.length === 1 ? "fragancia" : "fragancias";
  elements.emptyState.hidden = results.length !== 0;
  elements.clearSearch.classList.toggle("visible", Boolean(state.query));
  elements.activeFilter.hidden = !state.designer;
  elements.activeDesigner.textContent = state.designer;
}

function populateDesigners() {
  const designers = [...new Set(state.perfumes.map(item => item.designer))].sort((a, b) => a.localeCompare(b, "es"));
  designers.forEach(designer => {
    const option = document.createElement("option");
    option.value = designer;
    option.textContent = designer;
    elements.designerFilter.appendChild(option);
  });
}

function openFromHash() {
  if (!location.hash.startsWith("#perfume=")) return;
  const id = decodeURIComponent(location.hash.replace("#perfume=", ""));
  const perfume = state.perfumes.find(item => item.id === id);
  if (perfume) openPerfume(perfume, false);
}

elements.search.addEventListener("input", event => { state.query = event.target.value; render(); });
elements.clearSearch.addEventListener("click", () => { state.query = ""; elements.search.value = ""; elements.search.focus(); render(); });
elements.designerFilter.addEventListener("change", event => { state.designer = event.target.value; render(); });
elements.removeDesignerFilter.addEventListener("click", () => setDesignerFilter(""));
elements.resetFilters.addEventListener("click", () => {
  state.query = "";
  state.designer = "";
  elements.search.value = "";
  elements.designerFilter.value = "";
  render();
});
elements.closeDialog.addEventListener("click", () => closePerfume());
elements.dialog.addEventListener("click", event => {
  if (event.target === elements.dialog) closePerfume();
});
elements.dialog.addEventListener("cancel", event => {
  event.preventDefault();
  closePerfume();
});
window.addEventListener("popstate", () => {
  if (location.hash.startsWith("#perfume=")) openFromHash();
  else closePerfume(false);
});

async function init() {
  try {
    const response = await fetch("data/perfumes.json");
    if (!response.ok) throw new Error("No fue posible cargar el catálogo.");
    state.perfumes = await response.json();
    populateDesigners();
    render();
    openFromHash();
  } catch (error) {
    elements.catalog.innerHTML = `<p class="load-error">No se pudo cargar el catálogo. Intenta actualizar la página.</p>`;
    console.error(error);
  }
}

init();
