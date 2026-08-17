(() => {
  'use strict';

  const CONFIG_KEY = 'prive-admin-supabase-config-v1';
  const DEFAULT_CONFIG = Object.freeze({
    url: 'https://uqjrotqqquorsagwiara.supabase.co',
    publishableKey: 'sb_publishable_KV6_5XskGXe8mCg-6vfkiA_vNMKDZNP'
  });
  const SESSION_KEY = 'prive-portal-session-v1';
  const state = {
    cycles: [],
    history: [],
    catalog: [],
    catalogSearch: '',
    catalogFilter: 'all',
    filter: 'orders',
    cycleSearch: '',
    historySearch: '',
    selectedCycle: null,
    selectedOrder: null,
    detailOrigin: 'orders',
    session: null,
    config: null,
    pendingPerfumeImage: null,
    pendingPerfumePreviewUrl: null,
    pendingPerfumeImageSource: null,
    removeExistingPerfumeImage: false,
    lastFragranticaImageUrl: null,
    categoryManuallyEdited: false,
    lastAutoCategoryPrefix: null,
    users: [],
    usersSearch: '',
    usersFilter: 'all'
  };

  const $ = selector => document.querySelector(selector);
  const els = {
    setupView: $('#setupView'), loginView: $('#loginView'), appView: $('#appView'), setupForm: $('#setupForm'),
    setupError: $('#setupError'), projectUrlInput: $('#projectUrlInput'), publishableKeyInput: $('#publishableKeyInput'), loginForm: $('#loginForm'),
    emailInput: $('#emailInput'), passwordInput: $('#passwordInput'), loginBtn: $('#loginBtn'), loginError: $('#loginError'),
    changeConfigBtn: $('#changeConfigBtn'), logoutBtn: $('#logoutBtn'), sessionBadge: $('#sessionBadge'), refreshBtn: $('#refreshBtn'),
    cyclesList: $('#cyclesList'), cyclesCount: $('#cyclesCount'), cycleSearchInput: $('#cycleSearchInput'),
    ordersSection: $('#ordersSection'), cyclesSection: $('#cyclesSection'), historySection: $('#historySection'), detailSection: $('#detailSection'),
    historyRefreshBtn: $('#historyRefreshBtn'), historySearchInput: $('#historySearchInput'), historyList: $('#historyList'), historyCount: $('#historyCount'),
    ordersCycleTitle: $('#ordersCycleTitle'), ordersCycleMeta: $('#ordersCycleMeta'), cycleDownloadActions: $('#cycleDownloadActions'),
    ordersList: $('#ordersList'), backToCycles: $('#backToCycles'), backToOrders: $('#backToOrders'), detailTitle: $('#detailTitle'),
    detailMeta: $('#detailMeta'), detailDownloadActions: $('#detailDownloadActions'), detailSummary: $('#detailSummary'),
    detailTableBody: $('#detailTableBody'), nextCycleName: $('#nextCycleName'), nextCycleCutoff: $('#nextCycleCutoff'),
    metricOrders: $('#metricOrders'), metricPerfumes: $('#metricPerfumes'), metricSamples: $('#metricSamples'), toast: $('#toast'), loadingLayer: $('#loadingLayer'),
    catalogSection: $('#catalogSection'), catalogAdminSearchInput: $('#catalogAdminSearchInput'), catalogAvailabilityFilters: $('#catalogAvailabilityFilters'),
    catalogAdminCount: $('#catalogAdminCount'), catalogAdminList: $('#catalogAdminList'), newPerfumeBtn: $('#newPerfumeBtn'),
    perfumeAdminModal: $('#perfumeAdminModal'), closePerfumeAdminModal: $('#closePerfumeAdminModal'), perfumeAdminForm: $('#perfumeAdminForm'), perfumeAdminId: $('#perfumeAdminId'),
    perfumeSourceUrlInput: $('#perfumeSourceUrlInput'), perfumeSourceStatus: $('#perfumeSourceStatus'), fragranticaAutofillBtn: $('#fragranticaAutofillBtn'),
    perfumeDesignerInput: $('#perfumeDesignerInput'), perfumeNameInput: $('#perfumeNameInput'), perfumeCodeInput: $('#perfumeCodeInput'), perfumeCategoryInput: $('#perfumeCategoryInput'),
    perfumeImageInput: $('#perfumeImageInput'), perfumeImagePasteZone: $('#perfumeImagePasteZone'), perfumeImagePasteTitle: $('#perfumeImagePasteTitle'),
    perfumeImagePasteHint: $('#perfumeImagePasteHint'), perfumeImageFilename: $('#perfumeImageFilename'), perfumeImagePreviewWrap: $('#perfumeImagePreviewWrap'),
    perfumeImagePreview: $('#perfumeImagePreview'), perfumeImagePreviewTitle: $('#perfumeImagePreviewTitle'), perfumeImagePreviewHint: $('#perfumeImagePreviewHint'),
    restoreFragranticaImageBtn: $('#restoreFragranticaImageBtn'), removePerfumeImageBtn: $('#removePerfumeImageBtn'),
    perfumeAdminModalTitle: $('#perfumeAdminModalTitle'), perfumeAdminError: $('#perfumeAdminError'), savePerfumeAdminBtn: $('#savePerfumeAdminBtn'),
    usersSection: $('#usersSection'), usersSearchInput: $('#usersSearchInput'), usersRoleFilters: $('#usersRoleFilters'), usersCount: $('#usersCount'), usersList: $('#usersList'), newUserBtn: $('#newUserBtn'),
    userAdminModal: $('#userAdminModal'), closeUserAdminModal: $('#closeUserAdminModal'), userAdminForm: $('#userAdminForm'), userAdminId: $('#userAdminId'), userAdminModalTitle: $('#userAdminModalTitle'),
    userFullNameInput: $('#userFullNameInput'), userAliasInput: $('#userAliasInput'), userEmailInput: $('#userEmailInput'), userPhoneInput: $('#userPhoneInput'), userRoleInput: $('#userRoleInput'), userStatusInput: $('#userStatusInput'),
    parentDistributorField: $('#parentDistributorField'), userParentDistributorInput: $('#userParentDistributorInput'), userCityInput: $('#userCityInput'), userInstagramInput: $('#userInstagramInput'), createPasswordField: $('#createPasswordField'), userPasswordInput: $('#userPasswordInput'), userAdminError: $('#userAdminError'), saveUserAdminBtn: $('#saveUserAdminBtn'),
    passwordAdminModal: $('#passwordAdminModal'), closePasswordAdminModal: $('#closePasswordAdminModal'), passwordAdminForm: $('#passwordAdminForm'), passwordUserId: $('#passwordUserId'), passwordUserLabel: $('#passwordUserLabel'), passwordNewInput: $('#passwordNewInput'), passwordConfirmInput: $('#passwordConfirmInput'), passwordAdminError: $('#passwordAdminError')
  };

  const safeJson = value => { try { return JSON.parse(value); } catch { return null; } };
  const readStored = key => safeJson(localStorage.getItem(key));
  const saveStored = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const clearStored = key => localStorage.removeItem(key);
  const configReady = config => Boolean(config?.url && config?.publishableKey);

  function setLoading(on, text = 'Procesando…') {
    els.loadingLayer.hidden = !on;
    els.loadingLayer.querySelector('span').textContent = text;
  }

  function toast(message, isError = false) {
    els.toast.textContent = message;
    els.toast.classList.toggle('is-error', isError);
    els.toast.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { els.toast.hidden = true; }, 3500);
  }

  function normalizeProjectUrl(value) {
    const raw = String(value || '').trim().replace(/^['"]|['"]$/g, '');
    if (!raw) throw new Error('Ingresa la Project URL de Supabase.');
    let parsed;
    try { parsed = new URL(raw); } catch { throw new Error('La Project URL no tiene un formato válido.'); }
    if (parsed.protocol !== 'https:') throw new Error('La Project URL debe comenzar con https://');
    if (!parsed.hostname.endsWith('.supabase.co')) throw new Error('Usa la Project URL del proyecto, con dominio .supabase.co.');
    if (parsed.username || parsed.password || parsed.port) throw new Error('La Project URL contiene datos adicionales no válidos.');
    return parsed.origin;
  }

  function validatePublishableKey(value) {
    const key = String(value || '').trim();
    if (!key) throw new Error('Ingresa la Publishable key.');
    if (/service_role|secret/i.test(key)) throw new Error('No uses una Secret key ni service_role en el navegador.');
    if (!(key.startsWith('sb_publishable_') || key.startsWith('eyJ'))) {
      throw new Error('La clave no parece una Publishable key válida.');
    }
    return key;
  }

  function friendlyNetworkError(error) {
    const message = String(error?.message || error || '');
    if (/failed to fetch|networkerror|load failed/i.test(message)) {
      return new Error('No se pudo conectar con Supabase. Revisa la Project URL, tu conexión a internet y vuelve a intentar.');
    }
    if (/invalid path specified|invalid url/i.test(message)) {
      return new Error('La Project URL no es válida. Usa únicamente https://TU-PROYECTO.supabase.co');
    }
    return error instanceof Error ? error : new Error(message || 'Ocurrió un error inesperado.');
  }

  function authHeaders(token = state.session?.access_token) {
    return { apikey: state.config.publishableKey, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City', day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
  }

  async function request(path, { method = 'GET', body, token = state.session?.access_token, headers = {} } = {}) {
    try {
      return await fetch(`${state.config.url}${path}`, {
        method,
        headers: { ...authHeaders(token), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
      });
    } catch (error) {
      throw friendlyNetworkError(error);
    }
  }

  async function refreshSessionIfNeeded() {
    if (!state.session?.refresh_token) return false;
    const expiresAt = Number(state.session.expires_at || 0) * 1000;
    if (state.session.access_token && expiresAt - Date.now() > 60_000) return true;
    try {
      const res = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', token: null, body: { refresh_token: state.session.refresh_token } });
      if (!res.ok) return false;
      const data = await res.json();
      state.session = { ...data, expires_at: data.expires_at || Math.floor(Date.now()/1000) + Number(data.expires_in || 3600) };
      saveStored(SESSION_KEY, state.session);
      return true;
    } catch { return false; }
  }

  async function ensureSession() {
    if (!state.session?.access_token) return false;

    try {
      let res = await request('/auth/v1/user', {
        method: 'GET',
        token: state.session.access_token
      });

      if (res.ok) {
        const user = await res.json().catch(() => null);
        if (user) state.session.user = user;
        saveStored(SESSION_KEY, state.session);
        return true;
      }

      if (res.status === 401 && state.session?.refresh_token) {
        const refreshed = await refreshSessionIfNeeded();
        if (refreshed) {
          res = await request('/auth/v1/user', {
            method: 'GET',
            token: state.session.access_token
          });
          if (res.ok) {
            const user = await res.json().catch(() => null);
            if (user) state.session.user = user;
            saveStored(SESSION_KEY, state.session);
            return true;
          }
        }
      }
    } catch {}

    state.session = null;
    clearStored(SESSION_KEY);
    return false;
  }

  function showView(name) {
    if (els.setupView) els.setupView.hidden = name !== 'setup';
    els.loginView.hidden = name !== 'login';
    els.appView.hidden = name !== 'app';
    els.logoutBtn.hidden = name !== 'app';
    els.sessionBadge.hidden = name !== 'app';
  }

  function showPanelSection(name) {
    els.cyclesSection.hidden = name !== 'cycles';
    els.historySection.hidden = name !== 'history';
    els.catalogSection.hidden = name !== 'catalog';
    els.usersSection.hidden = name !== 'users';
    els.ordersSection.hidden = name !== 'orders';
    els.detailSection.hidden = name !== 'detail';
    document.querySelectorAll('[data-panel-view]').forEach(button => {
      button.classList.toggle('is-active', button.dataset.panelView === name);
    });
  }

  async function login(email, password) {
    try {
      const res = await request('/auth/v1/token?grant_type=password', { method: 'POST', token: null, body: { email, password } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 400 && /invalid login credentials/i.test(data?.msg || data?.message || '')) {
          throw new Error('Correo o contraseña incorrectos.');
        }
        throw new Error(data?.msg || data?.message || 'No fue posible iniciar sesión.');
      }
      state.session = { ...data, expires_at: data.expires_at || Math.floor(Date.now()/1000) + Number(data.expires_in || 3600) };
      saveStored(SESSION_KEY, state.session);
      return data;
    } catch (error) {
      throw friendlyNetworkError(error);
    }
  }

  async function verifyAdminProfile() {
    if (!state.session?.user?.id) throw new Error('No se pudo identificar la cuenta administrativa.');
    const userId = encodeURIComponent(state.session.user.id);
    const res = await request(`/rest/v1/profiles?id=eq.${userId}&select=role,status`, { method: 'GET' });
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data?.message || 'No fue posible verificar el perfil administrativo.');
    const profile = Array.isArray(data) ? data[0] : null;
    if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
      throw new Error('Esta cuenta no tiene acceso administrativo activo.');
    }
    return true;
  }

  async function rpc(name, args = {}) {
    if (!(await ensureSession())) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    const res = await request(`/rest/v1/rpc/${name}`, { method: 'POST', body: args });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.message || data?.hint || `Error ${res.status}`;
      if (res.status === 401) {
        state.session = null;
        clearStored(SESSION_KEY);
        window.location.replace('../portal/');
      }
      throw new Error(message);
    }
    return data;
  }


  async function edgeFunction(name, payload, { expect = 'json' } = {}) {
    if (!(await ensureSession())) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    let res;
    try {
      res = await fetch(`${state.config.url}/functions/v1/${name}`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {})
      });
    } catch (error) {
      throw friendlyNetworkError(error);
    }
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || data?.message || `Error ${res.status} en ${name}`);
    }
    if (expect === 'blob') return await res.blob();
    return await res.json();
  }

  function sourceUrlValue() {
    return String(els.perfumeSourceUrlInput?.value || '').trim();
  }

  function updateSourceStatus(mode = null) {
    if (!els.perfumeSourceStatus) return;
    const hasUrl = Boolean(sourceUrlValue());
    els.perfumeSourceStatus.classList.toggle('is-linked', hasUrl && mode !== 'loading');
    els.perfumeSourceStatus.classList.toggle('is-loading', mode === 'loading');
    els.perfumeSourceStatus.textContent = mode === 'loading' ? 'LEYENDO…' : (hasUrl ? 'URL VINCULADA' : 'SIN URL');
    if (els.restoreFragranticaImageBtn) els.restoreFragranticaImageBtn.hidden = !hasUrl;
  }

  function catalogImageUrl(row) {
    const raw = String(row?.image_url || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    return new URL(`../${raw.replace(/^\/+/, '')}`, window.location.href).href;
  }

  function catalogStatusLabel(value) {
    return value === 'out_of_stock' ? 'AGOTADO' : 'DISPONIBLE';
  }

  function normalizeSearch(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  function searchTokens(value) {
    return normalizeSearch(value).split(/\s+/).filter(Boolean);
  }

  function catalogSearchScore(item) {
    const tokens = searchTokens(state.catalogSearch);
    if (!tokens.length) return 0;
    const name = normalizeSearch(item.name);
    const designer = normalizeSearch(item.designer);
    const code = normalizeSearch(item.code);
    const category = normalizeSearch(item.category);
    const haystack = `${designer} ${name} ${code} ${category}`;
    if (!tokens.every(token => haystack.includes(token))) return -1;
    let score = 0;
    for (const token of tokens) {
      if (name === token || designer === token || code === token) score += 12;
      else if (name.startsWith(token) || designer.startsWith(token) || code.startsWith(token)) score += 8;
      else if (name.includes(token)) score += 5;
      else if (designer.includes(token)) score += 4;
      else if (code.includes(token)) score += 3;
      else score += 1;
    }
    return score;
  }

  function catalogMatches(item) {
    if (state.catalogFilter === 'available' && item.availability_status !== 'available') return false;
    if (state.catalogFilter === 'out_of_stock' && item.availability_status !== 'out_of_stock') return false;
    if (state.catalogFilter === 'basic' && item.profile_status !== 'basic') return false;
    if (state.catalogFilter === 'basic_missing_source' && !(item.profile_status === 'basic' && !item.source_url)) return false;
    return catalogSearchScore(item) >= 0;
  }

  function renderAdminCatalog() {
    const hasSearch = searchTokens(state.catalogSearch).length > 0;
    const list = state.catalog.filter(catalogMatches).sort((a, b) => {
      if (hasSearch) {
        const diff = catalogSearchScore(b) - catalogSearchScore(a);
        if (diff) return diff;
      }
      return String(a.designer || '').localeCompare(String(b.designer || ''), 'es') || String(a.name || '').localeCompare(String(b.name || ''), 'es');
    });
    els.catalogAdminCount.textContent = `${list.length} de ${state.catalog.length} perfumes`;
    if (!list.length) {
      els.catalogAdminList.innerHTML = '<div class="empty-state">No hay perfumes que coincidan con la búsqueda o filtro.</div>';
      return;
    }
    els.catalogAdminList.innerHTML = list.map(item => {
      const image = catalogImageUrl(item);
      const available = item.availability_status !== 'out_of_stock';
      return `
        <article class="catalog-admin-card" data-catalog-id="${esc(item.id)}">
          <div class="catalog-admin-image">${image ? `<img src="${esc(image)}" alt="${esc(item.name)}" loading="lazy" onerror="this.remove();">` : '<span>PRIVÉ</span>'}</div>
          <div class="catalog-admin-main">
            <h3>${esc(item.name || 'Sin nombre')}</h3>
            <p class="catalog-admin-meta">${esc(item.designer || 'Sin diseñador')} · ${esc(item.category || 'Sin categoría')}<br><span class="catalog-admin-code">${esc(item.code || 'Sin clave')}</span></p>
            <div class="catalog-admin-badges">
              <span class="status-pill ${available ? 'status-stock' : 'status-out'}">${catalogStatusLabel(item.availability_status)}</span>
              <span class="status-pill ${item.profile_status === 'basic' ? 'status-basic' : 'status-enriched'}">${item.profile_status === 'basic' ? 'FICHA BÁSICA' : 'ENRIQUECIDA'}</span>
              ${item.profile_status === 'basic' ? `<span class="status-pill ${item.source_url ? 'status-source-linked' : 'status-source-missing'}">${item.source_url ? 'URL VINCULADA' : 'SIN URL'}</span>` : ''}
            </div>
            <div class="catalog-admin-actions">
              <button class="btn btn-ghost" type="button" data-catalog-action="edit">Editar</button>
              <button class="btn ${available ? 'btn-warning' : 'btn-primary'}" type="button" data-catalog-action="availability" data-next-status="${available ? 'out_of_stock' : 'available'}">${available ? 'Marcar agotado' : 'Marcar disponible'}</button>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  async function loadAdminCatalog({ quiet = false } = {}) {
    if (!quiet) setLoading(true, 'Cargando catálogo…');
    try {
      const rows = await rpc('admin_get_catalog_perfumes');
      state.catalog = Array.isArray(rows) ? rows : [];
      renderAdminCatalog();
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  function normalizePerfumeText(value) {
    return String(value || '').toLocaleUpperCase('es-MX');
  }

  function normalizePerfumeCode(value) {
    return normalizePerfumeText(value).trim().replace(/[^A-Z0-9_-]/g, '');
  }

  function normalizeDesignerKey(value, { dropGeneric = false } = {}) {
    const generic = new Set(['PERFUME', 'PERFUMES', 'PARFUM', 'PARFUMS', 'FRAGRANCE', 'FRAGRANCES']);
    const tokens = normalizePerfumeText(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const filtered = dropGeneric ? tokens.filter(token => !generic.has(token)) : tokens;
    return filtered.join(' ');
  }

  function canonicalDesignerFromCatalog(value) {
    const source = normalizePerfumeText(value).trim();
    if (!source) return '';

    const designers = [...new Set(
      state.catalog
        .map(item => normalizePerfumeText(item?.designer).trim())
        .filter(Boolean)
    )];

    const exactKey = normalizeDesignerKey(source);
    const exact = designers.find(designer => normalizeDesignerKey(designer) === exactKey);
    if (exact) return exact;

    const simplified = normalizeDesignerKey(source, { dropGeneric: true });
    if (!simplified) return source;

    const matches = designers.filter(
      designer => normalizeDesignerKey(designer, { dropGeneric: true }) === simplified
    );

    // Solo normalizamos cuando la coincidencia es inequívoca.
    if (matches.length === 1) return matches[0];

    return source;
  }

  function categoryFromCode(codeValue) {
    const code = normalizePerfumeCode(codeValue);
    if (code.startsWith('CP')) return { prefix: 'CP', category: 'Caballero' };
    if (code.startsWith('DP')) return { prefix: 'DP', category: 'Dama' };
    if (code.startsWith('UP')) return { prefix: 'UP', category: 'Unisex' };
    return null;
  }

  function syncCategoryFromCode({ force = false } = {}) {
    const inferred = categoryFromCode(els.perfumeCodeInput.value);
    if (!inferred) {
      state.lastAutoCategoryPrefix = null;
      return;
    }

    const prefixChanged = state.lastAutoCategoryPrefix !== inferred.prefix;

    if (force || prefixChanged || !state.categoryManuallyEdited) {
      els.perfumeCategoryInput.value = inferred.category;
      state.categoryManuallyEdited = false;
      state.lastAutoCategoryPrefix = inferred.prefix;
    }
  }

  function releasePendingPreview() {
    if (state.pendingPerfumePreviewUrl) URL.revokeObjectURL(state.pendingPerfumePreviewUrl);
    state.pendingPerfumePreviewUrl = null;
  }

  function clearPendingPerfumeImage() {
    releasePendingPreview();
    state.pendingPerfumeImage = null;
    state.pendingPerfumeImageSource = null;
  }

  function updateImagePasteState() {
    const code = normalizePerfumeCode(els.perfumeCodeInput.value);
    const enabled = Boolean(code);
    els.perfumeImagePasteZone.classList.toggle('is-disabled', !enabled);
    els.perfumeImagePasteZone.setAttribute('aria-disabled', String(!enabled));
    els.perfumeImageInput.disabled = !enabled;
    els.perfumeImageFilename.textContent = enabled ? `${code}.webp` : '';
    if (!enabled) {
      els.perfumeImagePasteTitle.textContent = 'Primero escribe la clave privada';
      els.perfumeImagePasteHint.textContent = 'Después copia la imagen en el navegador y pégala aquí con Ctrl+V.';
    } else if (state.pendingPerfumeImage) {
      els.perfumeImagePasteTitle.textContent = 'Imagen lista para guardar';
      els.perfumeImagePasteHint.textContent = 'Puedes pegar otra imagen para reemplazarla antes de guardar.';
    } else {
      els.perfumeImagePasteTitle.textContent = 'Pega aquí la imagen del perfume';
      els.perfumeImagePasteHint.textContent = 'Cópiala en el navegador y presiona Ctrl+V. También puedes usar el selector de archivo.';
    }
  }

  function openPerfumeModal(item = null) {
    els.perfumeAdminError.textContent = '';
    els.perfumeAdminForm.reset();
    clearPendingPerfumeImage();
    state.removeExistingPerfumeImage = false;
    state.lastFragranticaImageUrl = null;
    state.categoryManuallyEdited = false;
    state.lastAutoCategoryPrefix = categoryFromCode(item?.code || '')?.prefix || null;
    els.perfumeAdminId.value = item?.id || '';
    els.perfumeAdminModalTitle.textContent = item ? 'Editar perfume' : 'Nuevo perfume';
    els.perfumeSourceUrlInput.value = item?.source_url || '';
    els.perfumeDesignerInput.value = item?.designer || '';
    els.perfumeNameInput.value = item?.name || '';
    els.perfumeCodeInput.value = item?.code || '';
    els.perfumeCategoryInput.value = item?.category || 'Caballero';
    if (!item) syncCategoryFromCode({ force: true });
    els.perfumeImageInput.value = '';
    const image = catalogImageUrl(item);
    els.perfumeImagePreviewWrap.hidden = !image;
    if (image) {
      els.perfumeImagePreview.src = image;
      els.perfumeImagePreviewTitle.textContent = 'Imagen actual';
      const source = item?.image_source === 'fragrantica' ? 'Fragrantica' : item?.image_source === 'manual' ? 'Manual' : 'Histórica';
      els.perfumeImagePreviewHint.textContent = `Origen: ${source} · puedes reemplazarla o eliminarla sin afectar los demás datos.`;
    }
    els.removePerfumeImageBtn.hidden = !image;
    els.perfumeImagePasteZone.classList.remove('has-image');
    updateImagePasteState();
    updateSourceStatus();
    els.perfumeAdminModal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => (item ? els.perfumeDesignerInput : els.perfumeSourceUrlInput).focus({ preventScroll: true }), 50);
  }

  function closePerfumeModal() {
    els.perfumeAdminModal.hidden = true;
    els.perfumeAdminError.textContent = '';
    els.perfumeImageInput.value = '';
    clearPendingPerfumeImage();
    state.removeExistingPerfumeImage = false;
    state.lastFragranticaImageUrl = null;
    state.categoryManuallyEdited = false;
    state.lastAutoCategoryPrefix = null;
    els.perfumeImagePasteZone.classList.remove('has-image');
    document.body.style.overflow = '';
  }

  function storageObjectPath(path) {
    return String(path || '').split('/').map(encodeURIComponent).join('/');
  }

  async function decodeImageSource(blob) {
    if ('createImageBitmap' in window) return await createImageBitmap(blob);
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function clearConnectedLightBackground(ctx, width, height) {
    // S13 / V6: matte cleanup de precisión.
    // 1) identifica SOLO el fondo claro conectado físicamente al borde;
    // 2) limpia el fringe JPEG/antialias en una banda muy corta;
    // 3) descontamina el blanco residual usando color real del interior.
    // No se aplica chroma-key global, por lo que las piezas blancas reales
    // del frasco quedan protegidas si su interior también es blanco.
    const image = ctx.getImageData(0, 0, width, height);
    const data = image.data;
    const total = width * height;
    const background = new Uint8Array(total);
    const queue = new Int32Array(total);
    let head = 0;
    let tail = 0;

    const stats = index => {
      const o = index * 4;
      const r = data[o], g = data[o + 1], b = data[o + 2], a = data[o + 3];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      return { r, g, b, a, min, max, chroma: max - min, light: (r + g + b) / 3 };
    };

    const isStrictBackground = index => {
      const { a, min, chroma, light } = stats(index);
      if (a === 0) return true;
      return min >= 236 && light >= 240 && chroma <= 24;
    };

    let borderSamples = 0;
    let lightBorder = 0;
    const inspect = idx => {
      borderSamples++;
      if (isStrictBackground(idx)) lightBorder++;
    };

    for (let x = 0; x < width; x++) {
      inspect(x);
      if (height > 1) inspect((height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y++) {
      inspect(y * width);
      if (width > 1) inspect(y * width + width - 1);
    }

    // Una fuente con transparencia nativa o fondo artístico no se altera.
    if (!borderSamples || lightBorder / borderSamples < 0.55) return false;

    const enqueue = idx => {
      if (idx < 0 || idx >= total || background[idx] || !isStrictBackground(idx)) return;
      background[idx] = 1;
      queue[tail++] = idx;
    };

    for (let x = 0; x < width; x++) {
      enqueue(x);
      enqueue((height - 1) * width + x);
    }
    for (let y = 1; y < height - 1; y++) {
      enqueue(y * width);
      enqueue(y * width + width - 1);
    }

    while (head < tail) {
      const idx = queue[head++];
      const x = idx % width;
      const y = Math.floor(idx / width);
      if (x > 0) enqueue(idx - 1);
      if (x + 1 < width) enqueue(idx + 1);
      if (y > 0) enqueue(idx - width);
      if (y + 1 < height) enqueue(idx + width);
    }

    // El fondo confirmado queda transparente.
    for (let idx = 0; idx < total; idx++) {
      if (background[idx]) data[idx * 4 + 3] = 0;
    }

    // Distancia desde el fondo, limitada a 4 px. Es suficiente para halos de
    // JPEG/antialias sin entrar en detalles reales de la botella.
    const distance = new Uint8Array(total);
    const fringeQueue = new Int32Array(total);
    let fHead = 0, fTail = 0;
    for (let idx = 0; idx < total; idx++) {
      if (!background[idx]) continue;
      fringeQueue[fTail++] = idx;
    }

    const visitFringe = (from, idx) => {
      if (idx < 0 || idx >= total || background[idx] || distance[idx]) return;
      const d = (distance[from] || 0) + 1;
      if (d > 4) return;
      distance[idx] = d;
      fringeQueue[fTail++] = idx;
    };

    while (fHead < fTail) {
      const idx = fringeQueue[fHead++];
      const d = distance[idx] || 0;
      if (d >= 4) continue;
      const x = idx % width;
      const y = Math.floor(idx / width);
      if (x > 0) visitFringe(idx, idx - 1);
      if (x + 1 < width) visitFringe(idx, idx + 1);
      if (y > 0) visitFringe(idx, idx - width);
      if (y + 1 < height) visitFringe(idx, idx + width);
    }

    const original = new Uint8ClampedArray(data);

    const nearby = (idx, radius) => {
      const x = idx % width;
      const y = Math.floor(idx / width);
      const out = [];
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (!dx && !dy) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          out.push(ny * width + nx);
        }
      }
      return out;
    };

    for (let idx = 0; idx < total; idx++) {
      const d = distance[idx];
      if (!d || d > 4) continue;
      const o = idx * 4;
      if (data[o + 3] === 0) continue;

      const { r, g, b, light, chroma } = stats(idx);

      // Primer anillo: los restos prácticamente blancos pegados al fondo son
      // matte, no detalle. El segundo anillo solo se retira si es aún más neutro.
      if (
        (d === 1 && light >= 218 && chroma <= 46) ||
        (d === 2 && light >= 236 && chroma <= 28)
      ) {
        data[o + 3] = 0;
        continue;
      }

      if (light < 125 || chroma > 72) continue;

      // Buscar color real hacia dentro. Si todo lo cercano también es blanco,
      // tratamos esa zona como parte legítima del frasco y no la tocamos.
      const inner = nearby(idx, 4)
        .filter(n => {
          const no = n * 4;
          if (data[no + 3] < 220 || background[n]) return false;
          const nr = original[no], ng = original[no + 1], nb = original[no + 2];
          const nLight = (nr + ng + nb) / 3;
          const nChroma = Math.max(nr, ng, nb) - Math.min(nr, ng, nb);
          return nLight < 218 || nChroma > 34;
        })
        .map(n => {
          const no = n * 4;
          return [original[no], original[no + 1], original[no + 2]];
        });

      if (!inner.length) continue;

      let ir = 0, ig = 0, ib = 0;
      for (const [nr, ng, nb] of inner) {
        ir += nr; ig += ng; ib += nb;
      }
      ir /= inner.length; ig /= inner.length; ib /= inner.length;

      const whiteness = Math.max(0, Math.min(1, (light - 125) / 130));
      const neutrality = Math.max(0, 1 - chroma / 75);
      const proximity = (5 - d) / 4;
      const strength = Math.min(0.96, whiteness * neutrality * (0.58 + 0.38 * proximity));
      if (strength <= 0.05) continue;

      // Descontaminación de matte: sustituye el blanco mezclado por una
      // estimación del color de la botella, conservando el antialias.
      data[o] = Math.round(r * (1 - strength) + ir * strength);
      data[o + 1] = Math.round(g * (1 - strength) + ig * strength);
      data[o + 2] = Math.round(b * (1 - strength) + ib * strength);

      // Solo reducimos alfa de forma fuerte en el borde inmediato y neutro.
      // En anillos interiores prima la corrección de color para conservar detalle.
      if (d === 1 && chroma <= 34) {
        data[o + 3] = Math.round(data[o + 3] * Math.max(0.08, 1 - strength * 0.90));
      } else if (d === 2 && chroma <= 26) {
        data[o + 3] = Math.round(data[o + 3] * Math.max(0.42, 1 - strength * 0.42));
      }
    }

    // V6.1: segunda pasada ADAPTATIVA para fuentes difíciles (p. ej. algunos
    // JPG de Fragrantica con matte blanco ya horneado en el antialias).
    // Solo actúa cuando detecta un píxel claro/neutro pegado al fondo Y existe
    // evidencia de color real más oscuro o cromático hacia el interior.
    // Esto evita volver más agresivo el recorte global que ya funciona bien
    // en botellas como Yara/Valentino.
    const residualDistance = new Uint8Array(total);
    const residualQueue = new Int32Array(total);
    let rHead = 0, rTail = 0;
    for (let idx = 0; idx < total; idx++) {
      if (!background[idx]) continue;
      residualQueue[rTail++] = idx;
    }

    const visitResidual = (from, idx) => {
      if (idx < 0 || idx >= total || background[idx] || residualDistance[idx]) return;
      const d = (residualDistance[from] || 0) + 1;
      if (d > 7) return;
      residualDistance[idx] = d;
      residualQueue[rTail++] = idx;
    };

    while (rHead < rTail) {
      const idx = residualQueue[rHead++];
      const d = residualDistance[idx] || 0;
      if (d >= 7) continue;
      const x = idx % width;
      const y = Math.floor(idx / width);
      if (x > 0) visitResidual(idx, idx - 1);
      if (x + 1 < width) visitResidual(idx, idx + 1);
      if (y > 0) visitResidual(idx, idx - width);
      if (y + 1 < height) visitResidual(idx, idx + width);
    }

    const robustInnerColor = idx => {
      const x = idx % width;
      const y = Math.floor(idx / width);
      const colors = [];
      // Radio algo mayor que la primera pasada para atravesar halos gruesos.
      for (let radius = 2; radius <= 9 && colors.length < 10; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
            const nx = x + dx, ny = y + dy;
            if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
            const n = ny * width + nx;
            const no = n * 4;
            if (background[n] || data[no + 3] < 210) continue;
            const nr = data[no], ng = data[no + 1], nb = data[no + 2];
            const nMax = Math.max(nr, ng, nb);
            const nMin = Math.min(nr, ng, nb);
            const nLight = (nr + ng + nb) / 3;
            const nChroma = nMax - nMin;
            // Buscamos señal real del objeto, no más matte blanco.
            if (nLight <= 205 || nChroma >= 38) colors.push([nr, ng, nb, nLight]);
          }
        }
      }
      if (!colors.length) return null;
      // Mediana por luminancia: más robusta que un promedio ante reflejos blancos.
      colors.sort((a, b) => a[3] - b[3]);
      const mid = colors[Math.floor(colors.length / 2)];
      return { r: mid[0], g: mid[1], b: mid[2], light: mid[3] };
    };

    let residualCandidates = 0;
    let residualScore = 0;
    for (let idx = 0; idx < total; idx++) {
      const d = residualDistance[idx];
      if (!d || d > 7) continue;
      const o = idx * 4;
      if (data[o + 3] < 18) continue;
      const r = data[o], g = data[o + 1], b = data[o + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const light = (r + g + b) / 3, chroma = max - min;
      if (light < 168 || chroma > 58) continue;
      const innerColor = robustInnerColor(idx);
      if (!innerColor) continue;
      const contrast = light - innerColor.light;
      if (contrast < 28) continue;
      residualCandidates++;
      residualScore += Math.min(1, contrast / 95) * Math.min(1, (235 - Math.min(235, chroma * 2)) / 180);
    }

    // No activamos la segunda pasada por unos pocos reflejos aislados.
    const adaptiveHalo = residualCandidates >= Math.max(6, Math.round(Math.min(width, height) * 0.008)) && residualScore >= 3.5;

    if (adaptiveHalo) {
      for (let idx = 0; idx < total; idx++) {
        const d = residualDistance[idx];
        if (!d || d > 7) continue;
        const o = idx * 4;
        const alpha = data[o + 3];
        if (alpha < 18) continue;

        const r = data[o], g = data[o + 1], b = data[o + 2];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const light = (r + g + b) / 3, chroma = max - min;
        if (light < 155 || chroma > 68) continue;

        const innerColor = robustInnerColor(idx);
        if (!innerColor) continue;
        const contrast = light - innerColor.light;
        if (contrast < 22) continue;

        const neutrality = Math.max(0, 1 - chroma / 72);
        const brightness = Math.max(0, Math.min(1, (light - 150) / 100));
        const contrastFactor = Math.max(0, Math.min(1, (contrast - 18) / 90));
        const proximity = Math.max(0, (8 - d) / 7);
        const strength = Math.min(0.985, neutrality * brightness * contrastFactor * (0.62 + 0.38 * proximity));
        if (strength < 0.08) continue;

        // Reconstrucción aproximada del foreground tras un matte blanco:
        // mezclamos hacia el color interior y reducimos alfa solo donde la
        // contaminación es más probable. El color se corrige más que el alfa
        // para conservar bordes finos y transparencias naturales.
        const colorStrength = Math.min(0.97, strength * 1.18);
        data[o] = Math.round(r * (1 - colorStrength) + innerColor.r * colorStrength);
        data[o + 1] = Math.round(g * (1 - colorStrength) + innerColor.g * colorStrength);
        data[o + 2] = Math.round(b * (1 - colorStrength) + innerColor.b * colorStrength);

        if (d <= 2 && neutrality > 0.60) {
          data[o + 3] = Math.round(alpha * Math.max(0.06, 1 - strength * 0.82));
        } else if (d <= 4 && neutrality > 0.72) {
          data[o + 3] = Math.round(alpha * Math.max(0.48, 1 - strength * 0.34));
        }
      }
    }

    ctx.putImageData(image, 0, 0);
    return true;
  }

  async function convertImageToWebp(blob) {
    if (!blob || !String(blob.type || '').startsWith('image/')) throw new Error('El portapapeles no contiene una imagen válida.');
    if (blob.size > 16 * 1024 * 1024) throw new Error('La imagen original es demasiado grande. Usa una imagen menor a 16 MB.');
    const source = await decodeImageSource(blob);
    const sourceWidth = source.width || source.naturalWidth;
    const sourceHeight = source.height || source.naturalHeight;
    if (!sourceWidth || !sourceHeight) throw new Error('No se pudo leer el tamaño de la imagen.');

    // S13 / V6: conservar mucho más detalle del archivo original. Antes el
    // navegador limitaba a 1400 px y WEBP 0.90; ahora preservamos hasta 2400 px
    // y exportamos a calidad alta. No hacemos "upscale" artificial: si la fuente
    // ya es pequeña, la prioridad es conseguir una fuente HD desde la Edge Function.
    const maxSide = 2400;
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });
    if (!ctx) throw new Error('Tu navegador no pudo preparar la imagen.');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
    if (typeof source.close === 'function') source.close();

    // Conserva transparencia nativa y, cuando la fuente viene sobre blanco,
    // elimina únicamente el fondo conectado al borde y descontamina el fringe.
    clearConnectedLightBackground(ctx, width, height);

    const webp = await new Promise((resolve, reject) => {
      canvas.toBlob(result => result ? resolve(result) : reject(new Error('No se pudo convertir la imagen a WEBP.')), 'image/webp', 0.97);
    });
    return webp;
  }

  async function setPendingPerfumeImage(blob, sourceLabel = 'pegada', sourceType = 'manual') {
    const code = normalizePerfumeCode(els.perfumeCodeInput.value);
    const webp = await convertImageToWebp(blob);
    releasePendingPreview();
    state.pendingPerfumeImage = webp;
    state.pendingPerfumeImageSource = sourceType;
    state.removeExistingPerfumeImage = false;
    state.pendingPerfumePreviewUrl = URL.createObjectURL(webp);
    els.perfumeImagePreview.src = state.pendingPerfumePreviewUrl;
    els.perfumeImagePreviewWrap.hidden = false;
    els.removePerfumeImageBtn.hidden = false;
    els.perfumeImagePreviewTitle.textContent = code ? 'Imagen lista' : 'Vista previa de la botella';
    const originText = sourceType === 'fragrantica' ? 'Traída de Fragrantica' : (sourceLabel === 'pegada' ? 'Pegada manualmente' : 'Seleccionada manualmente');
    els.perfumeImagePreviewHint.textContent = code
      ? `${originText} y convertida a WEBP · se guardará como ${code}.webp`
      : `${originText} y convertida a WEBP · escribe la clave privada para definir el nombre del archivo`;
    els.perfumeImagePasteZone.classList.add('has-image');
    updateImagePasteState();
  }

  async function uploadPerfumeImage(blob, codeValue, { upsert = false } = {}) {
    if (!blob) return null;
    const code = normalizePerfumeCode(codeValue);
    if (!code) throw new Error('Falta la clave privada para nombrar la imagen.');
    if (!(await ensureSession())) throw new Error('Tu sesión expiró.');
    const path = `catalog/${code}.webp`;
    const res = await fetch(`${state.config.url}/storage/v1/object/perfume-images/${storageObjectPath(path)}`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'image/webp', 'x-upsert': upsert ? 'true' : 'false' },
      body: blob
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message = data?.message || data?.error || 'No se pudo subir la imagen.';
      if (/row level security|rls/i.test(message)) {
        throw new Error('Supabase bloqueó la actualización de la imagen por permisos de Storage. Ejecuta el parche S11 V4 de RLS y vuelve a intentar.');
      }
      throw new Error(message);
    }
    return {
      path,
      url: `${state.config.url}/storage/v1/object/public/perfume-images/${storageObjectPath(path)}`
    };
  }

  async function deletePerfumeImage(path) {
    if (!path) return;
    try {
      await fetch(`${state.config.url}/storage/v1/object/perfume-images/${storageObjectPath(path)}`, {
        method: 'DELETE', headers: authHeaders()
      });
    } catch {}
  }


  function normalizeFragranticaUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    let parsed;
    try { parsed = new URL(raw); } catch { throw new Error('La URL de Fragrantica no tiene un formato válido.'); }
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if (parsed.protocol !== 'https:' || !['fragrantica.com', 'fragrantica.es'].includes(hostname) || !/\/perfume\//i.test(parsed.pathname)) {
      throw new Error('Pega una URL de la ficha de un perfume en Fragrantica.');
    }
    return parsed.href;
  }

  async function fetchFragranticaPreview({ applyText = true, loadImage = true } = {}) {
    const url = normalizeFragranticaUrl(sourceUrlValue());
    if (!url) throw new Error('Pega primero la URL de Fragrantica.');
    els.perfumeSourceUrlInput.value = url;
    updateSourceStatus('loading');
    const data = await edgeFunction('fragrantica-autofill', { url });
    const canonical = String(data?.source_url || url).trim();
    els.perfumeSourceUrlInput.value = canonical;
    if (applyText) {
      if (data?.designer) {
        els.perfumeDesignerInput.value = canonicalDesignerFromCatalog(data.designer);
      }
      if (data?.name) {
        els.perfumeNameInput.value = normalizePerfumeText(data.name).trim();
      }
    }
    state.lastFragranticaImageUrl = String(data?.image_url || '').trim() || null;
    updateSourceStatus();

    if (loadImage && state.lastFragranticaImageUrl) {
      try {
        const blob = await edgeFunction('fragrantica-autofill', { action: 'image', url }, { expect: 'blob' });
        await setPendingPerfumeImage(blob, 'fragrantica', 'fragrantica');
        els.perfumeAdminError.textContent = '';
      } catch (imageError) {
        els.perfumeAdminError.textContent = `Datos encontrados, pero no se pudo traer la botella principal automáticamente: ${friendlyNetworkError(imageError).message}. Puedes pegarla o elegirla manualmente.`;
      }
    }
    return data;
  }

  async function removePerfumeImageFromForm() {
    clearPendingPerfumeImage();
    const id = els.perfumeAdminId.value || null;
    const current = id ? state.catalog.find(item => item.id === id) : null;
    state.removeExistingPerfumeImage = Boolean(current && catalogImageUrl(current));
    els.perfumeImagePreviewWrap.hidden = true;
    els.removePerfumeImageBtn.hidden = true;
    els.perfumeImagePasteZone.classList.remove('has-image');
    updateImagePasteState();
    toast('Imagen retirada del formulario. Los demás datos no cambian.');
  }

  async function savePerfume(event) {
    event.preventDefault();
    els.perfumeAdminError.textContent = '';
    els.savePerfumeAdminBtn.disabled = true;
    const id = els.perfumeAdminId.value || null;
    const current = id ? state.catalog.find(item => item.id === id) : null;
    let uploaded = null;
    let newId = null;
    try {
      setLoading(true, id ? 'Guardando cambios…' : 'Creando perfume…');
      const code = normalizePerfumeCode(els.perfumeCodeInput.value);
      if (!code) throw new Error('La clave privada es obligatoria.');
      const sourceUrl = sourceUrlValue() ? normalizeFragranticaUrl(sourceUrlValue()) : null;
      const previousCode = normalizePerfumeCode(current?.code || '');
      const codeChanged = Boolean(id && previousCode && previousCode !== code);

      // Si se cambia la clave y se conserva imagen, necesitamos una nueva copia
      // para respetar la regla CLAVE.webp. Eliminar la imagen sí permite cambiar clave.
      if (codeChanged && catalogImageUrl(current) && !state.pendingPerfumeImage && !state.removeExistingPerfumeImage) {
        throw new Error(`Cambiaste la clave de ${previousCode} a ${code}. Pega/restaura la imagen o elimínala antes de guardar para mantener ${code}.webp.`);
      }

      if (id) {
        await rpc('admin_update_perfume_v2', {
          p_perfume_id: id,
          p_name: normalizePerfumeText(els.perfumeNameInput.value).trim(),
          p_designer: normalizePerfumeText(els.perfumeDesignerInput.value).trim(),
          p_category: els.perfumeCategoryInput.value,
          p_code: code,
          p_source_url: sourceUrl
        });

        if (state.pendingPerfumeImage) {
          uploaded = await uploadPerfumeImage(state.pendingPerfumeImage, code, { upsert: !codeChanged });
          await rpc('admin_set_perfume_image_v2', {
            p_perfume_id: id,
            p_image_url: uploaded.url,
            p_image_storage_path: uploaded.path,
            p_image_source: state.pendingPerfumeImageSource || 'manual'
          });
          if (current?.image_storage_path && current.image_storage_path !== uploaded.path) {
            await deletePerfumeImage(current.image_storage_path);
          }
        } else if (state.removeExistingPerfumeImage) {
          await rpc('admin_clear_perfume_image', { p_perfume_id: id });
          if (current?.image_storage_path) await deletePerfumeImage(current.image_storage_path);
        }
        toast('Perfume actualizado correctamente.');
      } else {
        // El archivo se sube primero porque el RPC guarda la URL final en la misma
        // transacción que perfume + clave + URL fuente. Si el RPC falla, limpiamos
        // únicamente el archivo recién creado.
        if (state.pendingPerfumeImage) {
          uploaded = await uploadPerfumeImage(state.pendingPerfumeImage, code, { upsert: false });
        }
        newId = await rpc('admin_create_perfume_v2', {
          p_name: normalizePerfumeText(els.perfumeNameInput.value).trim(),
          p_designer: normalizePerfumeText(els.perfumeDesignerInput.value).trim(),
          p_category: els.perfumeCategoryInput.value,
          p_code: code,
          p_source_url: sourceUrl,
          p_image_url: uploaded?.url || null,
          p_image_storage_path: uploaded?.path || null,
          p_image_source: uploaded ? (state.pendingPerfumeImageSource || 'manual') : null
        });
        if (!newId) throw new Error('Supabase no devolvió el ID del perfume creado.');
        toast('Perfume creado · URL fuente guardada para enriquecimiento futuro.');
      }
      closePerfumeModal();
      await loadAdminCatalog({ quiet: true });
    } catch (error) {
      if (!id && uploaded && !newId) await deletePerfumeImage(uploaded.path);
      els.perfumeAdminError.textContent = friendlyNetworkError(error).message;
      toast(els.perfumeAdminError.textContent, true);
    } finally {
      setLoading(false);
      els.savePerfumeAdminBtn.disabled = false;
    }
  }

  async function changePerfumeAvailability(item, nextStatus) {
    const label = nextStatus === 'out_of_stock' ? 'agotado temporalmente' : 'disponible';
    if (!window.confirm(`¿Marcar ${item.name} como ${label}?`)) return;
    setLoading(true, 'Actualizando disponibilidad…');
    try {
      await rpc('admin_set_perfume_availability', { p_perfume_id: item.id, p_status: nextStatus });
      item.availability_status = nextStatus;
      renderAdminCatalog();
      toast(nextStatus === 'out_of_stock' ? 'Perfume marcado como agotado.' : 'Perfume disponible nuevamente.');
    } catch (error) {
      toast(friendlyNetworkError(error).message, true);
    } finally { setLoading(false); }
  }


  function roleLabel(role) {
    if (role === 'admin') return 'ADMIN';
    if (role === 'distributor') return 'DISTRIBUIDOR';
    return 'REVENDEDOR';
  }

  function userStatusLabel(status) { return status === 'active' ? 'ACTIVO' : 'INACTIVO'; }

  function userMatches(item) {
    const query = normalizeSearch(state.usersSearch);
    if (state.usersFilter === 'inactive' && item.status === 'active') return false;
    if (['reseller','distributor'].includes(state.usersFilter) && item.role !== state.usersFilter) return false;
    if (!query) return true;
    const haystack = normalizeSearch(`${item.full_name || ''} ${item.alias || ''} ${item.email || ''} ${item.phone || ''} ${item.city || ''}`);
    return searchTokens(query).every(token => haystack.includes(token));
  }

  function renderUsers() {
    const rows = state.users.filter(userMatches);
    els.usersCount.textContent = `${rows.length} ${rows.length === 1 ? 'usuario' : 'usuarios'}`;
    if (!rows.length) {
      els.usersList.innerHTML = '<div class="empty-state">No hay usuarios que coincidan con este filtro.</div>';
      return;
    }
    const distributors = new Map(state.users.filter(u => u.role === 'distributor').map(u => [u.id, u.alias || u.full_name || 'Distribuidor']));
    els.usersList.innerHTML = rows.map(item => `
      <article class="user-admin-card" data-user-id="${esc(item.id)}">
        <div class="user-admin-head">
          <div><h3>${esc(item.alias || item.full_name || 'Usuario')}</h3><p class="user-admin-email">${esc(item.email || 'Sin correo Auth')}</p></div>
          <div class="catalog-admin-badges"><span class="status-pill status-role-${esc(item.role)}">${roleLabel(item.role)}</span><span class="status-pill ${item.status === 'active' ? 'status-user-active' : 'status-user-inactive'}">${userStatusLabel(item.status)}</span></div>
        </div>
        <div class="user-admin-meta">
          <div><span>Nombre</span><strong>${esc(item.full_name || '—')}</strong></div>
          <div><span>Teléfono</span><strong>${esc(item.phone || '—')}</strong></div>
          <div><span>Ciudad</span><strong>${esc(item.city || '—')}</strong></div>
          <div><span>Distribuidor</span><strong>${esc(item.parent_distributor_id ? (distributors.get(item.parent_distributor_id) || 'Asignado') : '—')}</strong></div>
          <div><span>Último acceso</span><strong>${esc(formatDateTime(item.last_sign_in_at))}</strong></div>
          <div><span>Alta</span><strong>${esc(formatDate(item.created_at || item.auth_created_at))}</strong></div>
        </div>
        <div class="user-admin-actions">
          <button class="btn btn-primary" type="button" data-user-action="edit">Editar</button>
          <button class="btn btn-ghost" type="button" data-user-action="password">Contraseña</button>
        </div>
      </article>`).join('');
  }

  async function loadUsers({ quiet = false } = {}) {
    if (!quiet) setLoading(true, 'Cargando usuarios…');
    try {
      const response = await edgeFunction('admin-users', { action: 'list' });
      state.users = Array.isArray(response?.data) ? response.data : [];
      renderUsers();
    } finally { if (!quiet) setLoading(false); }
  }

  function populateDistributorOptions(selected = '') {
    const distributors = state.users.filter(u => u.role === 'distributor' && u.status === 'active');
    els.userParentDistributorInput.innerHTML = '<option value="">Sin distribuidor</option>' + distributors.map(u => `<option value="${esc(u.id)}">${esc(u.alias || u.full_name || u.email || 'Distribuidor')}</option>`).join('');
    els.userParentDistributorInput.value = selected || '';
  }

  function syncParentDistributorField() {
    const reseller = els.userRoleInput.value === 'reseller';
    els.parentDistributorField.hidden = !reseller;
    if (!reseller) els.userParentDistributorInput.value = '';
  }

  function closeUserModal() { els.userAdminModal.hidden = true; els.userAdminForm.reset(); els.userAdminError.textContent = ''; }

  function openUserModal(item = null) {
    els.userAdminForm.reset();
    els.userAdminError.textContent = '';
    const editing = Boolean(item);
    els.userAdminId.value = item?.id || '';
    els.userAdminModalTitle.textContent = editing ? 'Editar usuario' : 'Nueva cuenta';
    els.saveUserAdminBtn.textContent = editing ? 'Guardar cambios' : 'Crear cuenta';
    els.createPasswordField.hidden = editing;
    els.userPasswordInput.required = !editing;
    els.userFullNameInput.value = item?.full_name || '';
    els.userAliasInput.value = item?.alias || '';
    els.userEmailInput.value = item?.email || '';
    els.userPhoneInput.value = item?.phone || '';
    els.userRoleInput.value = item?.role || 'reseller';
    els.userStatusInput.value = item?.status || 'active';
    els.userCityInput.value = item?.city || '';
    els.userInstagramInput.value = item?.instagram_url || '';
    populateDistributorOptions(item?.parent_distributor_id || '');
    syncParentDistributorField();
    els.userAdminModal.hidden = false;
    setTimeout(() => els.userFullNameInput.focus(), 50);
  }

  function userFormPayload() {
    return {
      id: els.userAdminId.value || undefined,
      full_name: els.userFullNameInput.value,
      alias: els.userAliasInput.value,
      email: els.userEmailInput.value,
      phone: els.userPhoneInput.value,
      role: els.userRoleInput.value,
      status: els.userStatusInput.value,
      parent_distributor_id: els.userRoleInput.value === 'reseller' ? els.userParentDistributorInput.value : null,
      city: els.userCityInput.value,
      instagram_url: els.userInstagramInput.value,
      password: els.userAdminId.value ? undefined : els.userPasswordInput.value
    };
  }

  async function saveUser(event) {
    event.preventDefault();
    els.userAdminError.textContent = '';
    const editing = Boolean(els.userAdminId.value);
    const payload = userFormPayload();
    if (payload.role === 'admin' && !window.confirm('Estás asignando acceso de ADMINISTRADOR. ¿Confirmas este rol?')) return;
    setLoading(true, editing ? 'Guardando usuario…' : 'Creando cuenta…');
    try {
      await edgeFunction('admin-users', { action: editing ? 'update' : 'create', ...payload });
      closeUserModal();
      await loadUsers({ quiet: true });
      toast(editing ? 'Usuario actualizado.' : 'Cuenta creada correctamente.');
    } catch (error) {
      els.userAdminError.textContent = friendlyNetworkError(error).message;
      toast(els.userAdminError.textContent, true);
    } finally { setLoading(false); }
  }

  function closePasswordModal() { els.passwordAdminModal.hidden = true; els.passwordAdminForm.reset(); els.passwordAdminError.textContent = ''; }

  function openPasswordModal(item) {
    els.passwordAdminForm.reset();
    els.passwordAdminError.textContent = '';
    els.passwordUserId.value = item.id;
    els.passwordUserLabel.textContent = `${item.alias || item.full_name || 'Usuario'} · ${item.email || ''}`;
    els.passwordAdminModal.hidden = false;
    setTimeout(() => els.passwordNewInput.focus(), 50);
  }

  async function savePassword(event) {
    event.preventDefault();
    els.passwordAdminError.textContent = '';
    if (els.passwordNewInput.value !== els.passwordConfirmInput.value) {
      els.passwordAdminError.textContent = 'Las contraseñas no coinciden.';
      return;
    }
    if (els.passwordNewInput.value.length < 8) {
      els.passwordAdminError.textContent = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }
    if (!window.confirm('¿Actualizar la contraseña de esta cuenta?')) return;
    setLoading(true, 'Actualizando contraseña…');
    try {
      await edgeFunction('admin-users', { action: 'reset_password', id: els.passwordUserId.value, password: els.passwordNewInput.value });
      closePasswordModal();
      toast('Contraseña actualizada correctamente.');
    } catch (error) {
      els.passwordAdminError.textContent = friendlyNetworkError(error).message;
      toast(els.passwordAdminError.textContent, true);
    } finally { setLoading(false); }
  }

  function orderedCycles() {
    return [...state.cycles].sort((a, b) => new Date(a.cutoff_at) - new Date(b.cutoff_at));
  }

  function getNextCycle() {
    const now = Date.now();
    return orderedCycles().find(c => new Date(c.cutoff_at).getTime() >= now) || null;
  }

  function renderOverview() {
    const next = getNextCycle();
    if (!next) {
      els.nextCycleName.textContent = 'Sin próximo corte';
      els.nextCycleCutoff.textContent = '—';
      els.metricOrders.textContent = '0';
      els.metricPerfumes.textContent = '0';
      els.metricSamples.textContent = '0';
      return;
    }
    els.nextCycleName.textContent = next.cycle_name || '—';
    els.nextCycleCutoff.textContent = `Corte: ${formatDateTime(next.cutoff_at)}`;
    els.metricOrders.textContent = next.confirmed_orders ?? 0;
    els.metricPerfumes.textContent = next.total_perfumes ?? 0;
    els.metricSamples.textContent = next.total_samples ?? 0;
  }

  function cycleStatus(cycle) {
    const nextId = getNextCycle()?.cycle_id;
    const cutoff = new Date(cycle.cutoff_at).getTime();
    if (cycle.cycle_id === nextId) return { label: 'PRÓXIMO', className: 'status-next' };
    if (cycle.is_open && cutoff >= Date.now()) return { label: 'ABIERTO', className: 'status-open' };
    return { label: 'CERRADO', className: 'status-closed' };
  }

  function cycleMatches(cycle) {
    const now = Date.now();
    const cutoff = new Date(cycle.cutoff_at).getTime();
    if (state.filter === 'orders' && Number(cycle.confirmed_orders) <= 0) return false;
    if (state.filter === 'upcoming' && cutoff < now) return false;
    if (state.filter === 'closed' && cutoff >= now) return false;
    const query = state.cycleSearch.trim().toLowerCase();
    if (!query) return true;
    const haystack = `${cycle.cycle_name || ''} ${formatDate(cycle.order_day)} ${formatDateTime(cycle.cutoff_at)}`.toLowerCase();
    return haystack.includes(query);
  }

  function renderCycles() {
    const list = state.cycles.filter(cycleMatches);
    els.cyclesCount.textContent = `${list.length} ${list.length === 1 ? 'corte' : 'cortes'}`;
    const visible = list.slice(0, state.filter === 'all' ? 120 : 40);
    if (!visible.length) {
      els.cyclesList.innerHTML = '<div class="empty-state">No hay cortes que coincidan con este filtro.</div>';
      return;
    }
    els.cyclesList.innerHTML = visible.map(cycle => {
      const status = cycleStatus(cycle);
      return `
      <article class="cycle-card" data-cycle-id="${esc(cycle.cycle_id)}">
        <div class="card-top">
          <div><h3 class="card-title">${esc(cycle.cycle_name)}</h3><p class="card-sub">Pedido: ${esc(formatDate(cycle.order_day))}<br>Corte: ${esc(formatDateTime(cycle.cutoff_at))}</p></div>
          <span class="status-pill ${status.className}">${status.label}</span>
        </div>
        <div class="stats-row">
          <div class="stat"><strong>${Number(cycle.confirmed_orders)||0}</strong><span>PEDIDOS</span></div>
          <div class="stat"><strong>${Number(cycle.reseller_count)||0}</strong><span>USUARIOS</span></div>
          <div class="stat"><strong>${Number(cycle.total_perfumes)||0}</strong><span>PERFUMES</span></div>
          <div class="stat"><strong>${Number(cycle.total_samples)||0}</strong><span>MUESTRAS</span></div>
        </div>
        <div class="card-actions"><button class="btn btn-primary" type="button" data-action="open-cycle">Ver pedidos</button></div>
      </article>`;
    }).join('');
  }

  async function loadCycles() {
    setLoading(true, 'Cargando cortes…');
    try {
      state.cycles = await rpc('get_admin_cycles_dashboard');
      state.cycles.sort((a, b) => new Date(a.order_day) - new Date(b.order_day));
      renderOverview();
      renderCycles();
    } finally { setLoading(false); }
  }

  function historyMatches(order) {
    const query = state.historySearch.trim().toLowerCase();
    if (!query) return true;
    const visibleName = order.user_alias || order.user_name || '';
    const haystack = `${order.folio || ''} ${visibleName} ${order.cycle_name || ''} ${formatDateTime(order.confirmed_at)}`.toLowerCase();
    return haystack.includes(query);
  }

  function renderHistory() {
    const list = state.history.filter(historyMatches);
    els.historyCount.textContent = `${list.length} ${list.length === 1 ? 'pedido confirmado' : 'pedidos confirmados'}`;
    if (!list.length) {
      els.historyList.innerHTML = '<div class="empty-state">No hay pedidos que coincidan con la búsqueda.</div>';
      return;
    }
    els.historyList.innerHTML = list.map(order => `
      <article class="order-card" data-order-id="${esc(order.order_id)}">
        <div class="card-top">
          <div><h3 class="card-title">${esc(order.user_alias || order.user_name || 'Usuario')}</h3><p class="card-sub">${esc(order.folio || 'Sin folio')}<br>${esc(order.cycle_name || 'Sin corte')}<br>${esc(formatDateTime(order.confirmed_at))}</p></div>
          <span class="status-pill status-confirmed">CONFIRMADO</span>
        </div>
        <div class="stats-row stats-row-two">
          <div class="stat"><strong>${Number(order.total_perfumes)||0}</strong><span>PERFUMES</span></div>
          <div class="stat"><strong>${Number(order.total_samples)||0}</strong><span>MUESTRAS</span></div>
        </div>
        <div class="card-actions">
          <button class="btn btn-primary" data-action="detail" type="button">Ver detalle</button>
          <button class="btn btn-ghost" data-action="user-xlsx" type="button">Excel</button>
          <button class="btn btn-ghost" data-action="user-pdf" type="button">PDF</button>
        </div>
      </article>`).join('');
  }

  async function loadHistory(force = false) {
    if (state.history.length && !force) { renderHistory(); return; }
    setLoading(true, 'Cargando historial…');
    try {
      state.history = await rpc('get_confirmed_order_history');
      renderHistory();
    } finally { setLoading(false); }
  }

  function renderOrders(orders) {
    if (!orders.length) {
      els.ordersList.innerHTML = '<div class="empty-state">Este corte todavía no tiene pedidos confirmados.</div>';
      return;
    }
    els.ordersList.innerHTML = orders.map(order => `
      <article class="order-card" data-order-id="${esc(order.order_id)}">
        <div class="card-top"><div><h3 class="card-title">${esc(order.user_alias || order.user_name || 'Usuario')}</h3><p class="card-sub">${esc(order.folio || 'Sin folio')}<br>${esc(formatDateTime(order.confirmed_at))}</p></div></div>
        <div class="stats-row stats-row-two">
          <div class="stat"><strong>${Number(order.total_perfumes)||0}</strong><span>PERFUMES</span></div>
          <div class="stat"><strong>${Number(order.total_samples)||0}</strong><span>MUESTRAS</span></div>
        </div>
        <div class="card-actions"><button class="btn btn-primary" data-action="detail" type="button">Ver detalle</button><button class="btn btn-ghost" data-action="user-xlsx" type="button">Excel</button><button class="btn btn-ghost" data-action="user-pdf" type="button">PDF</button></div>
      </article>`).join('');
  }

  async function openCycle(cycle) {
    state.selectedCycle = cycle;
    state.detailOrigin = 'orders';
    showPanelSection('orders');
    els.ordersCycleTitle.textContent = cycle.cycle_name;
    els.ordersCycleMeta.textContent = `${Number(cycle.confirmed_orders)||0} pedidos · ${Number(cycle.total_perfumes)||0} perfumes · ${Number(cycle.total_samples)||0} muestras`;
    const disabled = Number(cycle.confirmed_orders) <= 0 ? 'disabled' : '';
    els.cycleDownloadActions.innerHTML = `<button class="btn btn-primary" data-cycle-download="xlsx" ${disabled}>Excel proveedor</button><button class="btn btn-ghost" data-cycle-download="pdf" ${disabled}>PDF proveedor</button>`;
    setLoading(true, 'Cargando pedidos…');
    try { renderOrders(await rpc('get_admin_cycle_orders', { p_cycle_id: cycle.cycle_id })); }
    catch (error) { toast(error.message, true); }
    finally { setLoading(false); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderDetail(rows) {
    const first = rows[0];
    const totalPerfumes = rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
    const totalSamples = rows.reduce((sum, row) => sum + Number(row.sample_quantity || 0), 0);
    els.detailTitle.textContent = first?.folio || 'Detalle del pedido';
    els.detailMeta.textContent = `${first?.user_alias || first?.user_name || 'Usuario'} · ${first?.cycle_name || ''}`;
    els.detailSummary.innerHTML = [
      ['Revendedor', first?.user_alias || first?.user_name || '—'],
      ['Confirmado', formatDateTime(first?.confirmed_at)],
      ['Perfumes', totalPerfumes],
      ['Muestras', totalSamples]
    ].map(([label, value]) => `<div class="summary-box"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('');
    els.detailTableBody.innerHTML = rows.map(row => `<tr><td>${Number(row.quantity)||0}</td><td>${esc(row.perfume_name)}</td><td>${esc(row.perfume_code)}</td><td>${esc(row.presentation === 'dama' ? 'Dama' : (row.presentation === 'caballero' ? 'Caballero' : '—'))}</td><td>${Number(row.sample_quantity)||0}</td><td>${esc(row.customer_note || '—')}</td></tr>`).join('');
    els.detailDownloadActions.innerHTML = `
      <button class="btn btn-primary" data-detail-download="xlsx">Excel individual</button>
      <button class="btn btn-ghost" data-detail-download="pdf">PDF individual</button>
      <button class="btn btn-warning" data-detail-action="reopen" type="button">Reabrir pedido</button>
    `;
  }

  async function openOrder(orderId, origin = 'orders') {
    state.selectedOrder = orderId;
    state.detailOrigin = origin;
    showPanelSection('detail');
    els.backToOrders.textContent = origin === 'history' ? '← Historial' : '← Pedidos';
    setLoading(true, 'Cargando detalle…');
    try {
      const rows = await rpc('get_admin_order_detail', { p_order_id: orderId });
      if (!rows.length) throw new Error('El pedido no tiene líneas disponibles.');
      renderDetail(rows);
    } catch (error) {
      toast(error.message, true);
      showPanelSection(origin === 'history' ? 'history' : 'orders');
    } finally { setLoading(false); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function filenameFromDisposition(header, fallback) {
    const match = String(header || '').match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i);
    return decodeURIComponent(match?.[1] || fallback).replace(/^"|"$/g, '');
  }

  async function downloadEdge(functionName, payload, fallbackName) {
    if (!(await ensureSession())) throw new Error('Tu sesión expiró.');
    setLoading(true, 'Generando archivo…');
    try {
      const res = await request(`/functions/v1/${functionName}`, { method: 'POST', body: payload });
      if (!res.ok) {
        const text = await res.text();
        let message = text;
        try { const json = JSON.parse(text); message = json.error || json.detail || text; } catch {}
        throw new Error(message || `Error ${res.status}`);
      }
      const blob = await res.blob();
      if (!blob.size) throw new Error('El archivo generado llegó vacío.');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filenameFromDisposition(res.headers.get('content-disposition'), fallbackName);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('Archivo generado correctamente.');
    } finally { setLoading(false); }
  }

  function handleOrderCardAction(event, origin) {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const orderId = btn.closest('[data-order-id]')?.dataset.orderId;
    if (!orderId) return;
    const action = btn.dataset.action;
    if (action === 'detail') openOrder(orderId, origin);
    if (action === 'user-xlsx') downloadEdge('generate-user-order-excel', { order_id: orderId }, 'PRIVE-PEDIDO-INDIVIDUAL.xlsx').catch(e => toast(e.message, true));
    if (action === 'user-pdf') downloadEdge('generate-user-order-pdf', { order_id: orderId }, 'PRIVE-PEDIDO-INDIVIDUAL.pdf').catch(e => toast(e.message, true));
  }

  if (els.setupForm) {
    els.setupForm.addEventListener('submit', event => {
      event.preventDefault();
      els.setupError.textContent = '';
      try {
        const url = normalizeProjectUrl(els.projectUrlInput.value);
        const publishableKey = validatePublishableKey(els.publishableKeyInput.value);
        state.config = { url, publishableKey };
        saveStored(CONFIG_KEY, state.config);
        els.projectUrlInput.value = url;
        els.publishableKeyInput.value = '';
        showView('login');
      } catch (error) {
        els.setupError.textContent = error.message;
      }
    });
  }

  els.loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    els.loginError.textContent = '';
    els.loginBtn.disabled = true;
    try {
      const data = await login(els.emailInput.value.trim(), els.passwordInput.value);
      await verifyAdminProfile();
      els.passwordInput.value = '';
      els.sessionBadge.textContent = data.user?.email || 'Admin';
      showView('app');
      showPanelSection('cycles');
      await loadCycles();
    } catch (error) {
      const friendly = friendlyNetworkError(error);
      if (/acceso administrativo/i.test(friendly.message)) {
        state.session = null;
        clearStored(SESSION_KEY);
      }
      els.loginError.textContent = friendly.message;
    } finally { els.loginBtn.disabled = false; }
  });

  els.logoutBtn.addEventListener('click', async () => {
    setLoading(true, 'Cerrando sesión…');
    try {
      if (state.session?.access_token) {
        await request('/auth/v1/logout', { method: 'POST' }).catch(() => {});
      }
    } finally {
      state.session = null;
      state.history = [];
      clearStored(SESSION_KEY);
      clearStored('prive-admin-session-v1');
      window.location.replace('../portal/');
    }
  });

  if (els.changeConfigBtn) {
    els.changeConfigBtn.addEventListener('click', () => {
      window.location.replace('../portal/');
    });
  }

  els.refreshBtn.addEventListener('click', () => loadCycles().catch(error => toast(friendlyNetworkError(error).message, true)));
  els.historyRefreshBtn.addEventListener('click', () => loadHistory(true).catch(error => toast(friendlyNetworkError(error).message, true)));

  document.querySelectorAll('[data-panel-view]').forEach(button => button.addEventListener('click', async () => {
    const view = button.dataset.panelView;
    if (view === 'history') {
      showPanelSection('history');
      try { await loadHistory(); } catch (error) { toast(friendlyNetworkError(error).message, true); }
    } else if (view === 'catalog') {
      showPanelSection('catalog');
      try { await loadAdminCatalog(); } catch (error) { toast(friendlyNetworkError(error).message, true); }
    } else if (view === 'users') {
      showPanelSection('users');
      try { await loadUsers(); } catch (error) { toast(friendlyNetworkError(error).message, true); }
    } else {
      showPanelSection('cycles');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }));

  els.newPerfumeBtn.addEventListener('click', () => openPerfumeModal());
  els.closePerfumeAdminModal.addEventListener('click', closePerfumeModal);
  els.perfumeAdminModal.querySelectorAll('[data-close-perfume-modal]').forEach(node => node.addEventListener('click', closePerfumeModal));
  els.perfumeAdminForm.addEventListener('submit', savePerfume);
  els.perfumeSourceUrlInput.addEventListener('input', () => {
    state.lastFragranticaImageUrl = null;
    updateSourceStatus();
  });
  els.fragranticaAutofillBtn.addEventListener('click', async () => {
    els.perfumeAdminError.textContent = '';
    els.fragranticaAutofillBtn.disabled = true;
    try {
      setLoading(true, 'Leyendo ficha de Fragrantica…');
      await fetchFragranticaPreview({ applyText: true, loadImage: true });
      toast(state.pendingPerfumeImage ? 'Ficha e imagen encontradas. Revisa los datos antes de guardar.' : 'Ficha encontrada. Revisa los datos y completa la imagen si hace falta.');
    } catch (error) {
      els.perfumeAdminError.textContent = friendlyNetworkError(error).message;
      toast(els.perfumeAdminError.textContent, true);
      updateSourceStatus();
    } finally {
      setLoading(false);
      els.fragranticaAutofillBtn.disabled = false;
    }
  });
  els.restoreFragranticaImageBtn.addEventListener('click', async () => {
    els.perfumeAdminError.textContent = '';
    try {
      setLoading(true, 'Recuperando imagen de Fragrantica…');
      await fetchFragranticaPreview({ applyText: false, loadImage: true });
      if (!state.pendingPerfumeImage) throw new Error('La ficha no devolvió una imagen. Usa pegado o archivo manual.');
      toast('Imagen de Fragrantica restaurada.');
    } catch (error) {
      els.perfumeAdminError.textContent = friendlyNetworkError(error).message;
      toast(els.perfumeAdminError.textContent, true);
    } finally {
      setLoading(false);
    }
  });
  els.removePerfumeImageBtn.addEventListener('click', removePerfumeImageFromForm);
  [els.perfumeDesignerInput, els.perfumeNameInput].forEach(input => input.addEventListener('input', () => {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const normalized = normalizePerfumeText(input.value);
    if (input.value !== normalized) {
      input.value = normalized;
      if (start !== null && end !== null) input.setSelectionRange(start, end);
    }
  }));
  els.perfumeCodeInput.addEventListener('input', () => {
    const normalized = normalizePerfumeCode(els.perfumeCodeInput.value);
    if (els.perfumeCodeInput.value !== normalized) els.perfumeCodeInput.value = normalized;

    syncCategoryFromCode();

    const code = normalizePerfumeCode(els.perfumeCodeInput.value);
    if (state.pendingPerfumeImage) {
      const originText = state.pendingPerfumeImageSource === 'fragrantica' ? 'Traída de Fragrantica' : 'Imagen manual';
      els.perfumeImagePreviewTitle.textContent = code ? 'Imagen lista' : 'Vista previa de la botella';
      els.perfumeImagePreviewHint.textContent = code
        ? `${originText} y convertida a WEBP · se guardará como ${code}.webp`
        : `${originText} y convertida a WEBP · escribe la clave privada para definir el nombre del archivo`;
    }
    updateImagePasteState();
  });

  els.perfumeCategoryInput.addEventListener('change', () => {
    state.categoryManuallyEdited = true;
  });
  els.perfumeImagePasteZone.addEventListener('click', () => {
    if (!normalizePerfumeCode(els.perfumeCodeInput.value)) {
      els.perfumeAdminError.textContent = 'Primero escribe la clave privada.';
      els.perfumeCodeInput.focus();
      return;
    }
    els.perfumeImagePasteZone.focus();
  });
  els.perfumeImagePasteZone.addEventListener('beforeinput', event => event.preventDefault());
  els.perfumeImagePasteZone.addEventListener('keydown', event => {
    const pasteShortcut = (event.ctrlKey || event.metaKey) && String(event.key).toLowerCase() === 'v';
    if (!pasteShortcut && event.key !== 'Tab') event.preventDefault();
  });
  els.perfumeAdminModal.addEventListener('paste', async event => {
    if (els.perfumeAdminModal.hidden) return;
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find(item => item.kind === 'file' && String(item.type || '').startsWith('image/'));
    if (!imageItem) {
      if (event.target === els.perfumeImagePasteZone || els.perfumeImagePasteZone.contains(event.target)) {
        event.preventDefault();
        els.perfumeAdminError.textContent = 'Copia la imagen del perfume, no texto ni una dirección web.';
      }
      return;
    }
    event.preventDefault();
    els.perfumeAdminError.textContent = '';
    try {
      setLoading(true, 'Preparando imagen…');
      await setPendingPerfumeImage(imageItem.getAsFile(), 'pegada', 'manual');
      toast(`Imagen lista · ${normalizePerfumeCode(els.perfumeCodeInput.value)}.webp`);
    } catch (error) {
      els.perfumeAdminError.textContent = friendlyNetworkError(error).message;
      toast(els.perfumeAdminError.textContent, true);
    } finally {
      setLoading(false);
    }
  });
  els.perfumeImageInput.addEventListener('change', async () => {
    const file = els.perfumeImageInput.files?.[0];
    if (!file) return;
    els.perfumeAdminError.textContent = '';
    try {
      setLoading(true, 'Preparando imagen…');
      await setPendingPerfumeImage(file, 'archivo', 'manual');
    } catch (error) {
      els.perfumeAdminError.textContent = friendlyNetworkError(error).message;
      toast(els.perfumeAdminError.textContent, true);
      els.perfumeImageInput.value = '';
    } finally {
      setLoading(false);
    }
  });
  els.catalogAdminSearchInput.addEventListener('input', () => {
    state.catalogSearch = els.catalogAdminSearchInput.value;
    renderAdminCatalog();
  });
  els.catalogAvailabilityFilters.addEventListener('click', event => {
    const btn = event.target.closest('[data-catalog-filter]');
    if (!btn) return;
    state.catalogFilter = btn.dataset.catalogFilter || 'all';
    els.catalogAvailabilityFilters.querySelectorAll('[data-catalog-filter]').forEach(node => node.classList.toggle('is-active', node === btn));
    renderAdminCatalog();
  });
  els.catalogAdminList.addEventListener('click', event => {
    const btn = event.target.closest('[data-catalog-action]');
    if (!btn) return;
    const card = btn.closest('[data-catalog-id]');
    const item = state.catalog.find(row => row.id === card?.dataset.catalogId);
    if (!item) return;
    if (btn.dataset.catalogAction === 'edit') openPerfumeModal(item);
    if (btn.dataset.catalogAction === 'availability') changePerfumeAvailability(item, btn.dataset.nextStatus);
  });


  els.newUserBtn.addEventListener('click', () => openUserModal());
  els.closeUserAdminModal.addEventListener('click', closeUserModal);
  els.userAdminModal.querySelectorAll('[data-close-user-modal]').forEach(node => node.addEventListener('click', closeUserModal));
  els.userAdminForm.addEventListener('submit', saveUser);
  els.userRoleInput.addEventListener('change', syncParentDistributorField);
  els.usersSearchInput.addEventListener('input', () => { state.usersSearch = els.usersSearchInput.value; renderUsers(); });
  els.usersRoleFilters.addEventListener('click', event => {
    const btn = event.target.closest('[data-users-filter]');
    if (!btn) return;
    state.usersFilter = btn.dataset.usersFilter || 'all';
    els.usersRoleFilters.querySelectorAll('[data-users-filter]').forEach(node => node.classList.toggle('is-active', node === btn));
    renderUsers();
  });
  els.usersList.addEventListener('click', event => {
    const btn = event.target.closest('[data-user-action]');
    if (!btn) return;
    const card = btn.closest('[data-user-id]');
    const item = state.users.find(row => row.id === card?.dataset.userId);
    if (!item) return;
    if (btn.dataset.userAction === 'edit') openUserModal(item);
    if (btn.dataset.userAction === 'password') openPasswordModal(item);
  });
  els.closePasswordAdminModal.addEventListener('click', closePasswordModal);
  els.passwordAdminModal.querySelectorAll('[data-close-password-modal]').forEach(node => node.addEventListener('click', closePasswordModal));
  els.passwordAdminForm.addEventListener('submit', savePassword);

  document.querySelectorAll('[data-cycle-filter]').forEach(button => button.addEventListener('click', () => {
    state.filter = button.dataset.cycleFilter;
    document.querySelectorAll('[data-cycle-filter]').forEach(b => b.classList.toggle('is-active', b === button));
    renderCycles();
  }));

  els.cycleSearchInput.addEventListener('input', () => {
    state.cycleSearch = els.cycleSearchInput.value;
    renderCycles();
  });

  els.historySearchInput.addEventListener('input', () => {
    state.historySearch = els.historySearchInput.value;
    renderHistory();
  });

  els.cyclesList.addEventListener('click', event => {
    const btn = event.target.closest('[data-action="open-cycle"]');
    if (!btn) return;
    const card = btn.closest('[data-cycle-id]');
    const cycle = state.cycles.find(c => c.cycle_id === card.dataset.cycleId);
    if (cycle) openCycle(cycle);
  });

  els.ordersList.addEventListener('click', event => handleOrderCardAction(event, 'orders'));
  els.historyList.addEventListener('click', event => handleOrderCardAction(event, 'history'));

  els.cycleDownloadActions.addEventListener('click', event => {
    const btn = event.target.closest('[data-cycle-download]');
    if (!btn || !state.selectedCycle) return;
    if (btn.dataset.cycleDownload === 'xlsx') downloadEdge('generate-order-excel', { cycle_id: state.selectedCycle.cycle_id }, 'PRIVE-PEDIDO-PROVEEDOR.xlsx').catch(e => toast(e.message, true));
    if (btn.dataset.cycleDownload === 'pdf') downloadEdge('generate-order-pdf', { cycle_id: state.selectedCycle.cycle_id }, 'PRIVE-PEDIDO-PROVEEDOR.pdf').catch(e => toast(e.message, true));
  });


  async function reopenSelectedOrder() {
    if (!state.selectedOrder) return;

    const reason = window.prompt(
      'Motivo de reapertura (opcional). Escribe una nota para el historial o déjalo vacío:',
      ''
    );

    if (reason === null) return;

    const confirmed = window.confirm(
      '¿Reabrir este pedido?\n\nEl revendedor volverá a poder editar cantidades, muestras y notas, y deberá confirmarlo nuevamente.'
    );

    if (!confirmed) return;

    setLoading(true, 'Reabriendo pedido…');

    try {
      await rpc('admin_reopen_order', {
        p_order_id: state.selectedOrder,
        p_reason: reason.trim() || null
      });

      toast('Pedido reabierto correctamente.');

      state.history = [];
      state.cycles = [];

      if (state.detailOrigin === 'history') {
        showPanelSection('history');
        await loadHistory(true);
      } else if (state.selectedCycle) {
        const refreshedCycles = await rpc('get_admin_cycles_dashboard');
        state.cycles = Array.isArray(refreshedCycles) ? refreshedCycles : [];
        renderOverview();

        const refreshedCycle =
          state.cycles.find(c => c.cycle_id === state.selectedCycle.cycle_id) ||
          state.selectedCycle;

        state.selectedCycle = refreshedCycle;
        showPanelSection('orders');
        els.ordersCycleTitle.textContent = refreshedCycle.cycle_name || 'Pedidos';
        els.ordersCycleMeta.textContent =
          `${Number(refreshedCycle.confirmed_orders)||0} pedidos · ` +
          `${Number(refreshedCycle.total_perfumes)||0} perfumes · ` +
          `${Number(refreshedCycle.total_samples)||0} muestras`;

        const orders = await rpc('get_admin_cycle_orders', {
          p_cycle_id: refreshedCycle.cycle_id
        });
        renderOrders(orders);
      } else {
        showPanelSection('cycles');
        await loadCycles();
      }

      state.selectedOrder = null;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast(friendlyNetworkError(error).message, true);
    } finally {
      setLoading(false);
    }
  }

  els.detailDownloadActions.addEventListener('click', event => {
    const reopenBtn = event.target.closest('[data-detail-action="reopen"]');
    if (reopenBtn) {
      reopenSelectedOrder();
      return;
    }

    const btn = event.target.closest('[data-detail-download]');
    if (!btn || !state.selectedOrder) return;
    if (btn.dataset.detailDownload === 'xlsx') downloadEdge('generate-user-order-excel', { order_id: state.selectedOrder }, 'PRIVE-PEDIDO-INDIVIDUAL.xlsx').catch(e => toast(e.message, true));
    if (btn.dataset.detailDownload === 'pdf') downloadEdge('generate-user-order-pdf', { order_id: state.selectedOrder }, 'PRIVE-PEDIDO-INDIVIDUAL.pdf').catch(e => toast(e.message, true));
  });

  els.backToCycles.addEventListener('click', () => {
    showPanelSection('cycles');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  els.backToOrders.addEventListener('click', () => {
    showPanelSection(state.detailOrigin === 'history' ? 'history' : 'orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  async function init() {
    // El panel administrativo comparte la misma sesión del Portal PRIVÉ.
    // No existe un segundo inicio de sesión.
    state.config = { ...DEFAULT_CONFIG };
    saveStored(CONFIG_KEY, state.config);
    state.session = readStored(SESSION_KEY);

    if (!state.session || !await ensureSession()) {
      window.location.replace('../portal/');
      return;
    }

    try {
      await verifyAdminProfile();
      els.sessionBadge.textContent = state.session.user?.email || 'Admin';
      showView('app');
      showPanelSection('cycles');
      await loadCycles();
    } catch (error) {
      const friendly = friendlyNetworkError(error);
      // Si la cuenta no es admin, vuelve al portal con la misma sesión.
      if (/administrativo|admin|acceso/i.test(friendly.message)) {
        window.location.replace('../portal/');
        return;
      }
      toast(friendly.message, true);
      window.location.replace('../portal/');
    }
  }

  init();
})();
