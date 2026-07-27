const state = {
  perfumes: [],
  query: "",
  designer: ""
};

const elements = {
  catalog: document.querySelector("#catalog"),
  template: document.querySelector("#perfumeCardTemplate"),
  search: document.querySelector("#search"),
  clearSearch: document.querySelector("#clearSearch"),
  designerFilter: document.querySelector("#designerFilter"),
  resetFilters: document.querySelector("#resetFilters"),
  resultCount: document.querySelector("#resultCount"),
  resultLabel: document.querySelector("#resultLabel"),
  emptyState: document.querySelector("#emptyState")
};

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function initials(designer) {
  const words = designer.split(/\s+/).filter(Boolean);
  if (!words.length) return "P";
  return words.slice(0, 2).map(word => word[0]).join("").toUpperCase();
}

function filteredPerfumes() {
  const query = normalize(state.query);
  return state.perfumes.filter(perfume => {
    const matchesDesigner = !state.designer || perfume.designer === state.designer;
    const searchable = normalize(`${perfume.name} ${perfume.designer} ${perfume.code}`);
    return matchesDesigner && (!query || searchable.includes(query));
  });
}

function render() {
  const results = filteredPerfumes();
  const fragment = document.createDocumentFragment();
  elements.catalog.replaceChildren();

  results.forEach(perfume => {
    const card = elements.template.content.cloneNode(true);
    card.querySelector(".designer").textContent = perfume.designer;
    card.querySelector(".perfume-name").textContent = perfume.name;
    card.querySelector(".product-code").textContent = `Clave ${perfume.code}`;
    card.querySelector(".monogram").textContent = initials(perfume.designer);
    fragment.appendChild(card);
  });

  elements.catalog.appendChild(fragment);
  elements.resultCount.textContent = results.length.toLocaleString("es-MX");
  elements.resultLabel.textContent = results.length === 1 ? "fragancia" : "fragancias";
  elements.emptyState.hidden = results.length !== 0;
  elements.clearSearch.classList.toggle("visible", Boolean(state.query));
}

function populateDesigners() {
  const designers = [...new Set(state.perfumes.map(item => item.designer))]
    .sort((a, b) => a.localeCompare(b, "es"));
  designers.forEach(designer => {
    const option = document.createElement("option");
    option.value = designer;
    option.textContent = designer;
    elements.designerFilter.appendChild(option);
  });
}

elements.search.addEventListener("input", event => {
  state.query = event.target.value;
  render();
});

elements.clearSearch.addEventListener("click", () => {
  state.query = "";
  elements.search.value = "";
  elements.search.focus();
  render();
});

elements.designerFilter.addEventListener("change", event => {
  state.designer = event.target.value;
  render();
});

elements.resetFilters.addEventListener("click", () => {
  state.query = "";
  state.designer = "";
  elements.search.value = "";
  elements.designerFilter.value = "";
  render();
});

async function init() {
  try {
    const response = await fetch("data/perfumes.json");
    if (!response.ok) throw new Error("No fue posible cargar el catálogo.");
    state.perfumes = await response.json();
    populateDesigners();
    render();
  } catch (error) {
    elements.catalog.innerHTML = `<p>No se pudo cargar el catálogo. Abre el proyecto mediante un servidor local o GitHub Pages.</p>`;
    console.error(error);
  }
}

init();
