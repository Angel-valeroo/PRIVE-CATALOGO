(() => {
  'use strict';

  const SUPABASE_URL = 'https://uqjrotqqquorsagwiara.supabase.co';
  const PUBLISHABLE_KEY = 'sb_publishable_KV6_5XskGXe8mCg-6vfkiA_vNMKDZNP';
  const SESSION_KEY = 'prive-portal-session-v1';
  const PAGE_SIZE = 48;
  const DISCOUNT_GOAL = 15;

  const state = {
    session: null,
    profile: null,
    perfumes: [],
    filtered: [],
    category: 'all',
    search: '',
    visibleCount: PAGE_SIZE,
    order: null,
    orderItems: [],
    editorMode: 'add',
    selectedPerfume: null,
    editingItem: null,
    history: [],
    historyDetailOrderId: null,
    lastConfirmedOrderId: null
  };

  const $ = selector => document.querySelector(selector);
  const els = {
    loginView: $('#loginView'), appView: $('#appView'), loginForm: $('#loginForm'), emailInput: $('#emailInput'),
    passwordInput: $('#passwordInput'), loginBtn: $('#loginBtn'), loginError: $('#loginError'), sessionActions: $('#sessionActions'),
    sessionBadge: $('#sessionBadge'), adminPanelLink: $('#adminPanelLink'), logoutBtn: $('#logoutBtn'), welcomeTitle: $('#welcomeTitle'), welcomeMeta: $('#welcomeMeta'),
    accountStatus: $('#accountStatus'), searchInput: $('#searchInput'), categoryFilters: $('#categoryFilters'), catalogCount: $('#catalogCount'),
    catalogGrid: $('#catalogGrid'), emptyState: $('#emptyState'), loadMoreBtn: $('#loadMoreBtn'), refreshBtn: $('#refreshBtn'),
    loadingLayer: $('#loadingLayer'), toast: $('#toast'),
    orderStateBadge: $('#orderStateBadge'), orderCycleLabel: $('#orderCycleLabel'), orderCutoffLabel: $('#orderCutoffLabel'),
    discountMessage: $('#discountMessage'), discountCounter: $('#discountCounter'), discountProgress: $('#discountProgress'),
    floatingOrderBtn: $('#floatingOrderBtn'), floatingOrderState: $('#floatingOrderState'), floatingPerfumes: $('#floatingPerfumes'), floatingSamples: $('#floatingSamples'),
    cartBackdrop: $('#cartBackdrop'), cartSheet: $('#cartSheet'), closeCartBtn: $('#closeCartBtn'), cartStateBadge: $('#cartStateBadge'), cartCycleText: $('#cartCycleText'),
    cartDiscountMessage: $('#cartDiscountMessage'), cartDiscountCounter: $('#cartDiscountCounter'), cartDiscountProgress: $('#cartDiscountProgress'), cartItems: $('#cartItems'), cartEmpty: $('#cartEmpty'),
    cartPerfumeTotal: $('#cartPerfumeTotal'), cartSampleTotal: $('#cartSampleTotal'), closedOrderMessage: $('#closedOrderMessage'), confirmOrderBtn: $('#confirmOrderBtn'),
    editorModal: $('#editorModal'), closeEditorBtn: $('#closeEditorBtn'), editorImage: $('#editorImage'), editorImageFallback: $('#editorImageFallback'), editorDesigner: $('#editorDesigner'),
    editorTitle: $('#editorTitle'), editorPerfume: $('#editorPerfume'), itemEditorForm: $('#itemEditorForm'), itemQuantity: $('#itemQuantity'), itemSamples: $('#itemSamples'), itemNote: $('#itemNote'), saveItemBtn: $('#saveItemBtn'),
    presentationField: $('#presentationField'), presentationCaballero: $('#presentationCaballero'), presentationDama: $('#presentationDama'),
    confirmModal: $('#confirmModal'), confirmPerfumes: $('#confirmPerfumes'), confirmSamples: $('#confirmSamples'), confirmAcknowledge: $('#confirmAcknowledge'), cancelConfirmBtn: $('#cancelConfirmBtn'), finalConfirmBtn: $('#finalConfirmBtn'),
    confirmDiscountNotice: $('#confirmDiscountNotice'),
    historyBtn: $('#historyBtn'), historyBackdrop: $('#historyBackdrop'), historySheet: $('#historySheet'), closeHistoryBtn: $('#closeHistoryBtn'), historyList: $('#historyList'), historyEmpty: $('#historyEmpty'),
    historyDetailModal: $('#historyDetailModal'), closeHistoryDetailBtn: $('#closeHistoryDetailBtn'), historyDetailTitle: $('#historyDetailTitle'), historyDetailMeta: $('#historyDetailMeta'),
    historyDetailSummary: $('#historyDetailSummary'), historyDetailItems: $('#historyDetailItems'), historyDetailExcelBtn: $('#historyDetailExcelBtn'), historyDetailPdfBtn: $('#historyDetailPdfBtn'),
    closedOrderExcelBtn: $('#closedOrderExcelBtn'), closedOrderPdfBtn: $('#closedOrderPdfBtn'),
    successModal: $('#successModal'), successFolio: $('#successFolio'), successDiscountNotice: $('#successDiscountNotice'), successExcelBtn: $('#successExcelBtn'), successPdfBtn: $('#successPdfBtn'), successCloseBtn: $('#successCloseBtn')
  };

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[char]));
  const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const saveSession = session => localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  const clearSession = () => localStorage.removeItem(SESSION_KEY);
  const readSession = () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } };

  function setLoading(on, text = 'Procesando…') {
    els.loadingLayer.hidden = !on;
    els.loadingLayer.querySelector('span').textContent = text;
  }

  function toast(message, isError = false) {
    els.toast.textContent = message;
    els.toast.classList.toggle('is-error', isError);
    els.toast.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { els.toast.hidden = true; }, 3600);
  }

  function headers(token = state.session?.access_token) {
    return { apikey: PUBLISHABLE_KEY, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  async function api(path, options = {}) {
    return fetch(`${SUPABASE_URL}${path}`, {
      ...options,
      headers: {
        ...headers(options.token),
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      },
      ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {})
    });
  }

  async function parseError(response) {
    let data = null;
    try { data = await response.json(); } catch { try { data = await response.text(); } catch {} }
    const message = data?.msg || data?.message || data?.error_description || data?.error || data?.hint || (typeof data === 'string' ? data : '') || `Error ${response.status}`;
    return new Error(message);
  }

  async function refreshSession() {
    if (!state.session?.refresh_token) return false;
    const response = await api('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: state.session.refresh_token } });
    if (!response.ok) return false;
    state.session = await response.json();
    saveSession(state.session);
    return true;
  }

  async function authedRequest(path, options = {}, retry = true) {
    let response = await api(path, { ...options, token: state.session?.access_token });
    if (response.status === 401 && retry && await refreshSession()) response = await api(path, { ...options, token: state.session?.access_token });
    return response;
  }

  async function rpc(name, body = {}) {
    const response = await authedRequest(`/rest/v1/rpc/${name}`, { method: 'POST', body });
    if (!response.ok) throw await parseError(response);
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }


  async function downloadEdge(functionName, body, fallbackName) {
    if (!state.session?.access_token) throw new Error('Tu sesión no está disponible.');
    const response = await authedRequest(`/functions/v1/${functionName}`, {
      method: 'POST',
      body
    });
    if (!response.ok) throw await parseError(response);
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const filename = match?.[1] || fallbackName;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).format(date);
  }

  function presentationLabel(value) {
    if (value === 'dama') return 'Dama';
    if (value === 'caballero') return 'Caballero';
    return '';
  }

  function displayRole(role) {
    if (role === 'distributor') return 'Distribuidor';
    if (role === 'admin') return 'Administrador';
    return role || 'Usuario';
  }

  function displayName() {
    return state.profile?.alias || state.profile?.full_name || state.session?.user?.email || 'Usuario PRIVÉ';
  }

  function resolveImageUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;

    // Las rutas guardadas en Supabase son canónicas, por ejemplo:
    // IMAGES/Caballero/CP02446.avif
    // El portal vive en /portal/, por lo que ../ mantiene la ruta correcta
    // tanto en Live Server, GitHub Pages como en perfumeriaprive.com.
    return new URL(`../${raw.replace(/^\/+/, '')}`, window.location.href).href;
  }

  function formatCutoff(value) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
    } catch { return ''; }
  }

  function totalsFromItems() {
    return state.orderItems.reduce((acc, item) => {
      acc.perfumes += Number(item.quantity || 0);
      acc.samples += Number(item.sample_quantity || 0);
      return acc;
    }, { perfumes: 0, samples: 0 });
  }


  function orderIsEditable(order = state.order) {
    const dbStatus = String(order?.db_status || '').toLowerCase();
    if (dbStatus) return dbStatus === 'draft' || dbStatus === 'reopened';
    return order?.editable === true;
  }

  function normalizedOrderStatus(order = state.order) {
    const dbStatus = String(order?.db_status || '').toLowerCase();
    if (dbStatus === 'confirmed') return 'Pedido cerrado';
    if (dbStatus === 'reopened') return 'Pedido reabierto';
    if (dbStatus === 'draft') return 'Pedido abierto';
    return order?.ui_status || (orderIsEditable(order) ? 'Pedido abierto' : 'Pedido cerrado');
  }

  function orderStatusClass() {
    const label = normalizedOrderStatus();
    if (label === 'Pedido cerrado') return 'is-closed';
    if (label === 'Pedido reabierto') return 'is-reopened';
    return 'is-open';
  }

  function applyStateBadge(el) {
    el.classList.remove('is-open', 'is-closed', 'is-reopened');
    el.classList.add(orderStatusClass());
    el.textContent = normalizedOrderStatus();
  }

  function progressCopy(total) {
    const remaining = Math.max(0, DISCOUNT_GOAL - total);
    if (total >= DISCOUNT_GOAL) {
      return {
        message: '¡Meta completada! Has alcanzado el pedido mínimo para descuento adicional. Consulta con tu vendedor.',
        counter: `${total} / ${DISCOUNT_GOAL}`,
        percent: 100,
        complete: true
      };
    }
    return {
      message: total === 0 ? `Te faltan ${DISCOUNT_GOAL} perfumes para acceder al descuento adicional.` : `Llevas ${total} perfumes. Te faltan ${remaining} para acceder al descuento adicional.`,
      counter: `${total} / ${DISCOUNT_GOAL}`,
      percent: Math.min(100, (total / DISCOUNT_GOAL) * 100),
      complete: false
    };
  }

  async function loadProfile() {
    const userId = state.session?.user?.id;
    if (!userId) throw new Error('No se pudo identificar la cuenta.');
    const response = await authedRequest(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,full_name,alias,role,status`);
    if (!response.ok) throw await parseError(response);
    const rows = await response.json();
    const profile = rows?.[0];
    if (!profile) throw new Error('Tu cuenta todavía no tiene un perfil operativo en PRIVÉ.');
    if (profile.status !== 'active') throw new Error('Tu cuenta no está activa. Comunícate con PRIVÉ para revisar tu acceso.');
    if (!['distributor', 'admin'].includes(profile.role)) throw new Error('Esta cuenta no tiene acceso al portal de pedidos.');
    state.profile = profile;
  }

  async function loadPerfumes({ quiet = false } = {}) {
    if (!quiet) setLoading(true, 'Cargando catálogo…');
    try {
      const response = await authedRequest('/rest/v1/perfumes?active=eq.true&select=id,name,designer,category,image_url,availability_status,profile_status&order=designer.asc,name.asc');
      if (!response.ok) throw await parseError(response);
      const rows = await response.json();
      state.perfumes = (Array.isArray(rows) ? rows : []).sort((a, b) => {
        const byDesigner = String(a.designer || '').localeCompare(String(b.designer || ''), 'es', { sensitivity: 'base' });
        if (byDesigner !== 0) return byDesigner;
        return String(a.name || '').localeCompare(String(b.name || ''), 'es', { sensitivity: 'base', numeric: true });
      });
      state.visibleCount = PAGE_SIZE;
      applyFilters();
      if (state.perfumes.length === 0) toast('No se encontraron perfumes activos.', true);
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  async function loadOrder({ quiet = false } = {}) {
    if (!quiet) setLoading(true, 'Cargando tu pedido…');
    try {
      const orderRows = await rpc('get_portal_current_order');
      state.order = Array.isArray(orderRows) ? orderRows[0] : orderRows;
      if (!state.order?.order_id) throw new Error('No fue posible preparar tu pedido.');

      if (state.order.db_status === 'confirmed') {
        const confirmedRows = await rpc('get_confirmed_order_report', { p_order_id: state.order.order_id });
        state.orderItems = (Array.isArray(confirmedRows) ? confirmedRows : []).map(row => ({
          item_id: row.item_id,
          perfume_id: row.perfume_id,
          perfume_name: row.perfume_name,
          perfume_code: row.perfume_code,
          designer: row.designer,
          category: row.category,
          image_url: row.image_url,
          quantity: row.quantity,
          sample_quantity: row.sample_quantity,
          customer_note: row.customer_note,
          presentation: row.presentation
        }));
      } else {
        const itemRows = await rpc('get_portal_order_items', { p_order_id: state.order.order_id });
        state.orderItems = Array.isArray(itemRows) ? itemRows : [];
      }

      renderOrderUI();
      renderCatalog();
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  function searchTokens(value) {
    return norm(value).split(/\s+/).filter(Boolean);
  }

  function perfumeSearchScore(item, tokens) {
    if (!tokens.length) return 0;
    const name = norm(item.name);
    const designer = norm(item.designer);
    const haystack = `${designer} ${name}`;
    if (!tokens.every(token => haystack.includes(token))) return -1;
    let score = 0;
    for (const token of tokens) {
      if (name === token || designer === token) score += 12;
      else if (name.startsWith(token) || designer.startsWith(token)) score += 8;
      else if (name.includes(token)) score += 5;
      else score += 4;
    }
    return score;
  }

  function applyFilters() {
    const tokens = searchTokens(state.search);
    state.filtered = state.perfumes
      .filter(item => {
        const categoryOk = state.category === 'all' || item.category === state.category;
        return categoryOk && perfumeSearchScore(item, tokens) >= 0;
      })
      .sort((a, b) => {
        if (tokens.length) {
          const diff = perfumeSearchScore(b, tokens) - perfumeSearchScore(a, tokens);
          if (diff) return diff;
        }
        return String(a.designer || '').localeCompare(String(b.designer || ''), 'es') || String(a.name || '').localeCompare(String(b.name || ''), 'es');
      });
    renderCatalog();
  }

  function renderCatalog() {
    const total = state.filtered.length;
    const visible = state.filtered.slice(0, state.visibleCount);
    const editable = orderIsEditable();
    els.catalogCount.textContent = `${total} ${total === 1 ? 'perfume' : 'perfumes'}`;
    els.emptyState.hidden = total !== 0;
    els.loadMoreBtn.hidden = state.visibleCount >= total;

    els.catalogGrid.innerHTML = visible.map(item => {
      const image = resolveImageUrl(item.image_url);
      const outOfStock = item.availability_status === 'out_of_stock';
      const canAdd = editable && !outOfStock;
      return `
        <article class="perfume-card ${outOfStock ? 'is-out-of-stock' : ''}">
          <div class="perfume-image-wrap">
            ${image ? `<img class="perfume-image" src="${esc(image)}" alt="${esc(item.name)}" loading="lazy" decoding="async" onerror="this.classList.add('is-missing')">` : `<img class="perfume-image is-missing" alt="">`}
            <span class="image-fallback">PRIVÉ</span>
          </div>
          <div class="perfume-copy">
            <span class="perfume-category">${esc(item.category || '')}</span>
            <h2>${esc(item.name || '')}</h2>
            <p class="perfume-designer">${esc(item.designer || '')}</p>
            ${outOfStock ? '<p class="stock-notice">Agotado temporalmente · Pronto estará disponible</p>' : ''}
            <button class="add-order-btn" type="button" data-perfume-id="${esc(item.id)}" ${canAdd ? '' : 'disabled'}>${outOfStock ? 'Agotado temporalmente' : (editable ? 'Agregar al pedido' : 'Pedido cerrado')}</button>
          </div>
        </article>`;
    }).join('');
  }

  function renderOrderUI() {
    if (!state.order) return;
    const totals = totalsFromItems();
    const progress = progressCopy(totals.perfumes);
    const cutoff = formatCutoff(state.order.cutoff_at);
    const cycle = state.order.cycle_name || 'Próximo corte PRIVÉ';
    const editable = orderIsEditable();

    applyStateBadge(els.orderStateBadge);
    applyStateBadge(els.cartStateBadge);
    els.orderCycleLabel.textContent = cycle;
    const uiStatus = normalizedOrderStatus();
    els.orderCutoffLabel.textContent = uiStatus === 'Pedido cerrado'
      ? `Pedido enviado${state.order.folio ? ` · ${state.order.folio}` : ''}. Solo PRIVÉ puede reabrirlo antes del cierre del corte.`
      : `${cutoff ? `Corte: ${cutoff}. ` : ''}Tus cambios se guardan automáticamente.`;

    els.discountMessage.textContent = progress.message;
    els.discountCounter.textContent = progress.counter;
    els.discountProgress.style.width = `${progress.percent}%`;
    els.discountProgress.classList.toggle('is-complete', progress.complete);

    els.floatingOrderBtn.hidden = false;
    els.floatingOrderState.textContent = uiStatus;
    els.floatingPerfumes.textContent = totals.perfumes;
    els.floatingSamples.textContent = totals.samples;

    els.cartCycleText.textContent = `${cycle}${cutoff ? ` · Corte ${cutoff}` : ''}`;
    els.cartDiscountMessage.textContent = progress.message;
    els.cartDiscountCounter.textContent = progress.counter;
    els.cartDiscountProgress.style.width = `${progress.percent}%`;
    els.cartDiscountProgress.classList.toggle('is-complete', progress.complete);
    els.cartPerfumeTotal.textContent = totals.perfumes;
    els.cartSampleTotal.textContent = totals.samples;
    els.cartEmpty.hidden = state.orderItems.length !== 0;
    els.closedOrderMessage.hidden = editable;
    els.confirmOrderBtn.hidden = !editable;
    els.confirmOrderBtn.disabled = !editable || state.orderItems.length === 0;
    els.confirmOrderBtn.textContent = uiStatus === 'Pedido reabierto' ? 'Revisar y volver a confirmar' : 'Revisar y confirmar pedido';

    renderCartItems();
  }

  function renderCartItems() {
    const editable = orderIsEditable();
    els.cartItems.innerHTML = state.orderItems.map(item => {
      const image = resolveImageUrl(item.image_url);
      const note = item.customer_note ? `<span class="cart-note">Cliente: <strong>${esc(item.customer_note)}</strong></span>` : '<span class="cart-note is-empty">Sin nota de cliente</span>';
      const presentation = item.presentation
        ? `<span class="cart-presentation">Presentación: <strong>${item.presentation === 'dama' ? 'Dama' : 'Caballero'}</strong></span>`
        : '';
      return `
        <article class="cart-item" data-item-id="${esc(item.item_id)}">
          <div class="cart-item-image">${image ? `<img src="${esc(image)}" alt="${esc(item.perfume_name)}">` : '<span>PRIVÉ</span>'}</div>
          <div class="cart-item-main">
            <small>${esc(item.designer || '')}</small>
            <h3>${esc(item.perfume_name || '')}</h3>
            ${item.perfume_code ? `<span class="cart-code">Clave: <strong>${esc(item.perfume_code)}</strong></span>` : ''}
            <div class="cart-item-stats"><span><b>${Number(item.quantity || 0)}</b> perfume${Number(item.quantity || 0) === 1 ? '' : 's'}</span><span><b>${Number(item.sample_quantity || 0)}</b> muestra${Number(item.sample_quantity || 0) === 1 ? '' : 's'}</span></div>
            ${presentation}
            ${note}
            ${editable ? `<div class="cart-item-actions"><button type="button" data-edit-item="${esc(item.item_id)}">Editar</button><button type="button" data-duplicate-item="${esc(item.item_id)}">Otra asignación</button><button class="is-danger" type="button" data-delete-item="${esc(item.item_id)}">Eliminar</button></div>` : ''}
          </div>
        </article>`;
    }).join('');
  }

  function showLogin(message = '') {
    state.profile = null;
    state.order = null;
    state.orderItems = [];
    els.appView.hidden = true;
    els.sessionActions.hidden = true;
    if (els.adminPanelLink) els.adminPanelLink.hidden = true;
    els.floatingOrderBtn.hidden = true;
    closeCart();
    closeHistory();
    closeHistoryDetail();
    closeEditor();
    closeConfirmModal();
    closeSuccessModal();
    els.loginView.hidden = false;
    els.loginError.textContent = message;
    requestAnimationFrame(() => els.emailInput?.focus({ preventScroll: true }));
  }

  function showApp() {
    els.loginView.hidden = true;
    els.appView.hidden = false;
    els.sessionActions.hidden = false;
    if (els.adminPanelLink) els.adminPanelLink.hidden = state.profile?.role !== 'admin';
    const name = displayName();
    els.sessionBadge.textContent = state.session?.user?.email || name;
    els.welcomeTitle.textContent = `Hola, ${name}`;
    els.welcomeMeta.textContent = `${displayRole(state.profile?.role)} · Catálogo operativo PRIVÉ`;
    els.accountStatus.textContent = state.profile?.status === 'active' ? 'Activa' : String(state.profile?.status || '—');
  }

  async function validateStoredSession() {
    state.session = readSession();
    if (!state.session?.access_token) return false;
    let response = await api('/auth/v1/user', { token: state.session.access_token });
    if (response.status === 401 && await refreshSession()) response = await api('/auth/v1/user', { token: state.session.access_token });
    if (!response.ok) return false;
    state.session.user = await response.json();
    saveSession(state.session);
    return true;
  }

  async function initializeSession() {
    setLoading(true, 'Validando sesión…');
    try {
      if (!await validateStoredSession()) {
        clearSession(); state.session = null; showLogin(); return;
      }
      await loadProfile();
      showApp();
      await Promise.all([loadPerfumes({ quiet: true }), loadOrder({ quiet: true })]);
    } catch (error) {
      clearSession(); state.session = null; showLogin(error.message || 'No fue posible restaurar la sesión.');
    } finally { setLoading(false); }
  }

  function openCart() {
    if (!state.order) return;
    renderOrderUI();
    els.cartBackdrop.hidden = false;
    els.cartSheet.hidden = false;
    document.body.classList.add('sheet-open');
  }

  function closeCart() {
    els.cartBackdrop.hidden = true;
    els.cartSheet.hidden = true;
    document.body.classList.remove('sheet-open');
  }

  function openEditorForPerfume(perfume, { quantity = 1, samples = 0, note = '', presentation = null, item = null } = {}) {
    if (perfume?.availability_status === 'out_of_stock' && !item) { toast('Este perfume está agotado temporalmente y no puede agregarse.', true); return; }
    if (!orderIsEditable()) { toast('Este pedido está cerrado y no puede editarse.', true); return; }
    state.selectedPerfume = perfume;
    state.editingItem = item;
    state.editorMode = item ? 'edit' : 'add';
    const image = resolveImageUrl(perfume.image_url);
    els.editorDesigner.textContent = perfume.designer || '';
    els.editorTitle.textContent = item ? 'Editar asignación' : 'Agregar al pedido';
    els.editorPerfume.textContent = perfume.name || '';
    els.itemQuantity.value = Math.max(1, Number(quantity || 1));
    els.itemSamples.value = Math.max(0, Number(samples || 0));
    els.itemNote.value = note || '';

    const isUnisex = norm(perfume.category) === 'unisex';
    els.presentationField.hidden = !isUnisex;
    els.presentationCaballero.checked = isUnisex && presentation === 'caballero';
    els.presentationDama.checked = isUnisex && presentation === 'dama';

    if (isUnisex && !presentation) {
      els.presentationCaballero.checked = false;
      els.presentationDama.checked = false;
    }

    els.saveItemBtn.textContent = item ? 'Guardar cambios' : 'Agregar al pedido';
    if (image) {
      els.editorImage.src = image; els.editorImage.alt = perfume.name || ''; els.editorImage.hidden = false; els.editorImageFallback.hidden = true;
      els.editorImage.onerror = () => { els.editorImage.hidden = true; els.editorImageFallback.hidden = false; };
    } else {
      els.editorImage.hidden = true; els.editorImageFallback.hidden = false;
    }
    els.editorModal.hidden = false;
    document.body.classList.add('modal-open');
    setTimeout(() => els.itemNote.focus({ preventScroll: true }), 80);
  }

  function closeEditor() {
    els.editorModal.hidden = true;
    state.selectedPerfume = null;
    state.editingItem = null;
    els.presentationCaballero.checked = false;
    els.presentationDama.checked = false;
    els.presentationField.hidden = true;
    document.body.classList.remove('modal-open');
  }

  function openConfirmModal() {
    if (!orderIsEditable() || state.orderItems.length === 0) return;
    const totals = totalsFromItems();
    els.confirmPerfumes.textContent = totals.perfumes;
    els.confirmSamples.textContent = totals.samples;
    const progress = progressCopy(totals.perfumes);
    els.confirmDiscountNotice.classList.toggle('is-complete', progress.complete);
    els.confirmDiscountNotice.innerHTML = progress.complete
      ? `<strong>¡Meta alcanzada!</strong><span>Completaste ${totals.perfumes} perfumes en este pedido. Consulta con tu vendedor para que te apliquen el descuento adicional.</span>`
      : `<strong>Antes de enviarlo:</strong><span>${esc(progress.message)} ¿Deseas agregar más perfumes o enviar tu pedido así?</span>`;
    els.confirmAcknowledge.checked = false;
    els.finalConfirmBtn.disabled = true;
    els.confirmModal.hidden = false;
    document.body.classList.add('modal-open');
  }

  function closeConfirmModal() {
    els.confirmModal.hidden = true;
    els.confirmAcknowledge.checked = false;
    els.finalConfirmBtn.disabled = true;
    document.body.classList.remove('modal-open');
  }

  async function saveEditorItem() {
    const quantity = Math.max(1, Number.parseInt(els.itemQuantity.value, 10) || 1);
    const samples = Math.max(0, Number.parseInt(els.itemSamples.value, 10) || 0);
    const note = els.itemNote.value.trim();
    const isUnisex = norm(state.selectedPerfume?.category) === 'unisex';
    const selectedPresentation = isUnisex
      ? (els.presentationCaballero.checked ? 'caballero' : (els.presentationDama.checked ? 'dama' : null))
      : null;

    if (!state.order?.order_id || !state.selectedPerfume?.id) throw new Error('No fue posible identificar el pedido o perfume.');
    if (isUnisex && !selectedPresentation) throw new Error('Este perfume es unisex. Selecciona Caballero o Dama.');

    if (state.editorMode === 'edit' && state.editingItem?.item_id) {
      await rpc('portal_update_order_item', {
        p_item_id: state.editingItem.item_id,
        p_quantity: quantity,
        p_sample_quantity: samples,
        p_customer_note: note || null,
        p_presentation: selectedPresentation
      });
      toast('Cambios guardados.');
    } else {
      await rpc('portal_add_order_item', {
        p_order_id: state.order.order_id,
        p_perfume_id: state.selectedPerfume.id,
        p_quantity: quantity,
        p_sample_quantity: samples,
        p_customer_note: note || null,
        p_presentation: selectedPresentation
      });
      toast('Perfume agregado al pedido.');
    }
    closeEditor();
    await loadOrder({ quiet: true });
  }

  async function deleteItem(itemId) {
    const item = state.orderItems.find(x => x.item_id === itemId);
    if (!item) return;
    if (!window.confirm(`¿Eliminar ${item.perfume_name} de tu pedido?`)) return;
    setLoading(true, 'Eliminando…');
    try {
      await rpc('portal_delete_order_item', { p_item_id: itemId });
      await loadOrder({ quiet: true });
      toast('Producto eliminado del pedido.');
    } catch (error) { toast(error.message || 'No se pudo eliminar el producto.', true); }
    finally { setLoading(false); }
  }

  async function confirmOrder() {
    if (!state.order?.order_id) return;
    const confirmedOrderId = state.order.order_id;
    const totalsBefore = totalsFromItems();
    setLoading(true, 'Confirmando pedido…');
    try {
      const result = await rpc('confirm_order', { p_order_id: confirmedOrderId });
      const row = Array.isArray(result) ? result[0] : result;
      state.lastConfirmedOrderId = confirmedOrderId;
      state.history = [];
      closeConfirmModal();
      await loadOrder({ quiet: true });

      const progress = progressCopy(totalsBefore.perfumes);
      els.successFolio.textContent = row?.folio ? `Folio ${row.folio}` : 'Pedido confirmado';
      els.successDiscountNotice.classList.toggle('is-complete', progress.complete);
      els.successDiscountNotice.innerHTML = progress.complete
        ? `<strong>¡Felicidades!</strong><span>Completaste el mínimo de 15 perfumes para el descuento adicional. Consulta con tu vendedor.</span>`
        : `<strong>Pedido registrado.</strong><span>${esc(progress.message)}</span>`;
      els.successModal.hidden = false;
      document.body.classList.add('modal-open');
      toast(`Pedido confirmado${row?.folio ? ` · ${row.folio}` : ''}.`);
    } catch (error) { toast(error.message || 'No fue posible confirmar el pedido.', true); }
    finally { setLoading(false); }
  }


  async function loadHistory({ force = false } = {}) {
    if (state.history.length && !force) {
      renderHistory();
      return;
    }
    const rows = await rpc('get_my_confirmed_order_history');
    state.history = Array.isArray(rows) ? rows : [];
    renderHistory();
  }

  function renderHistory() {
    els.historyEmpty.hidden = state.history.length !== 0;
    els.historyList.innerHTML = state.history.map(order => `
      <article class="portal-history-card" data-history-order="${esc(order.order_id)}">
        <div class="history-card-top">
          <div>
            <small>${esc(order.cycle_name || 'Pedido confirmado')}</small>
            <h3>${esc(order.folio || 'Sin folio')}</h3>
            <span>${esc(formatDateTime(order.confirmed_at))}</span>
          </div>
          <span class="order-state-badge is-closed">Pedido cerrado</span>
        </div>
        <div class="history-card-totals">
          <span><strong>${Number(order.total_perfumes || 0)}</strong> perfumes</span>
          <span><strong>${Number(order.total_samples || 0)}</strong> muestras</span>
        </div>
        <div class="history-card-actions">
          <button class="secondary-btn" type="button" data-history-action="detail">Ver pedido</button>
          <button class="text-btn" type="button" data-history-action="xlsx">Excel</button>
          <button class="text-btn" type="button" data-history-action="pdf">PDF</button>
        </div>
      </article>
    `).join('');
  }

  async function openHistory() {
    els.historyBackdrop.hidden = false;
    els.historySheet.hidden = false;
    document.body.classList.add('sheet-open');
    setLoading(true, 'Cargando tus pedidos…');
    try {
      await loadHistory();
    } catch (error) {
      toast(error.message || 'No fue posible cargar tu historial.', true);
    } finally {
      setLoading(false);
    }
  }

  function closeHistory() {
    els.historyBackdrop.hidden = true;
    els.historySheet.hidden = true;
    document.body.classList.remove('sheet-open');
  }

  async function openHistoryDetail(orderId) {
    state.historyDetailOrderId = orderId;
    setLoading(true, 'Cargando pedido…');
    try {
      const rows = await rpc('get_confirmed_order_report', { p_order_id: orderId });
      if (!Array.isArray(rows) || !rows.length) throw new Error('No se encontró el detalle de este pedido.');
      const first = rows[0];
      const totalPerfumes = rows.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
      const totalSamples = rows.reduce((sum, row) => sum + Number(row.sample_quantity || 0), 0);
      els.historyDetailTitle.textContent = first.folio || 'Pedido confirmado';
      els.historyDetailMeta.textContent = `${first.cycle_name || ''} · ${formatDateTime(first.confirmed_at)}`;
      els.historyDetailSummary.innerHTML = `
        <div><small>Perfumes</small><strong>${totalPerfumes}</strong></div>
        <div><small>Muestras</small><strong>${totalSamples}</strong></div>
      `;
      els.historyDetailItems.innerHTML = rows.map(row => `
        <article class="history-detail-item">
          <div>
            <small>${esc(row.designer || '')}</small>
            <h3>${esc(row.perfume_name || '')}</h3>
            <span class="history-code">Clave: <strong>${esc(row.perfume_code || '—')}</strong></span>
            ${row.presentation ? `<span>Presentación: <strong>${esc(presentationLabel(row.presentation))}</strong></span>` : ''}
            ${row.customer_note ? `<span>Cliente: <strong>${esc(row.customer_note)}</strong></span>` : ''}
          </div>
          <div class="history-line-totals">
            <span><b>${Number(row.quantity || 0)}</b> perfumes</span>
            <span><b>${Number(row.sample_quantity || 0)}</b> muestras</span>
          </div>
        </article>
      `).join('');
      els.historyDetailModal.hidden = false;
      document.body.classList.add('modal-open');
    } catch (error) {
      toast(error.message || 'No fue posible abrir el pedido.', true);
    } finally {
      setLoading(false);
    }
  }

  function closeHistoryDetail() {
    els.historyDetailModal.hidden = true;
    state.historyDetailOrderId = null;
    document.body.classList.remove('modal-open');
  }

  function closeSuccessModal() {
    els.successModal.hidden = true;
    document.body.classList.remove('modal-open');
  }

  async function downloadIndividual(orderId, type) {
    if (!orderId) throw new Error('No se pudo identificar el pedido.');
    const isPdf = type === 'pdf';
    await downloadEdge(
      isPdf ? 'generate-user-order-pdf' : 'generate-user-order-excel',
      { order_id: orderId },
      isPdf ? 'PRIVE-PEDIDO-INDIVIDUAL.pdf' : 'PRIVE-PEDIDO-INDIVIDUAL.xlsx'
    );
  }

  els.loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    els.loginError.textContent = '';
    els.loginBtn.disabled = true;
    setLoading(true, 'Iniciando sesión…');
    try {
      const email = els.emailInput.value.trim();
      const password = els.passwordInput.value;
      const response = await api('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
      if (!response.ok) {
        const error = await parseError(response);
        if (/invalid login credentials/i.test(error.message)) throw new Error('Correo o contraseña incorrectos.');
        throw error;
      }
      state.session = await response.json();
      saveSession(state.session);
      await loadProfile();
      showApp();
      await Promise.all([loadPerfumes({ quiet: true }), loadOrder({ quiet: true })]);
      els.passwordInput.value = '';
    } catch (error) {
      clearSession(); state.session = null;
      els.loginError.textContent = /failed to fetch/i.test(String(error?.message)) ? 'No se pudo conectar con PRIVÉ Sistema. Revisa tu conexión e inténtalo de nuevo.' : (error.message || 'No fue posible iniciar sesión.');
    } finally { setLoading(false); els.loginBtn.disabled = false; }
  });


  if (els.adminPanelLink) {
    els.adminPanelLink.addEventListener('click', event => {
      if (state.profile?.role !== 'admin') return;
      event.preventDefault();
      if (state.session) saveSession(state.session);
      window.location.assign('../admin/index.html');
    });
  }

  els.logoutBtn.addEventListener('click', async () => {
    setLoading(true, 'Cerrando sesión…');
    try { if (state.session?.access_token) await api('/auth/v1/logout', { method: 'POST', token: state.session.access_token }).catch(() => {}); }
    finally {
      clearSession();
      localStorage.removeItem('prive-admin-session-v1');
      state.session = null;
      state.profile = null;
      state.perfumes = [];
      state.filtered = [];
      state.order = null;
      state.orderItems = [];
      state.selectedPerfume = null;
      state.editingItem = null;
      els.catalogGrid.innerHTML = '';
      window.location.reload();
    }
  });


  els.historyBtn.addEventListener('click', openHistory);
  els.closeHistoryBtn.addEventListener('click', closeHistory);
  els.historyBackdrop.addEventListener('click', closeHistory);

  els.historyList.addEventListener('click', async event => {
    const card = event.target.closest('[data-history-order]');
    const action = event.target.closest('[data-history-action]');
    if (!card || !action) return;
    const orderId = card.dataset.historyOrder;
    try {
      if (action.dataset.historyAction === 'detail') await openHistoryDetail(orderId);
      if (action.dataset.historyAction === 'xlsx') await downloadIndividual(orderId, 'xlsx');
      if (action.dataset.historyAction === 'pdf') await downloadIndividual(orderId, 'pdf');
    } catch (error) {
      toast(error.message || 'No fue posible completar la acción.', true);
    }
  });

  els.closeHistoryDetailBtn.addEventListener('click', closeHistoryDetail);
  els.historyDetailModal.addEventListener('click', event => { if (event.target === els.historyDetailModal) closeHistoryDetail(); });
  els.historyDetailExcelBtn.addEventListener('click', () => downloadIndividual(state.historyDetailOrderId, 'xlsx').catch(error => toast(error.message, true)));
  els.historyDetailPdfBtn.addEventListener('click', () => downloadIndividual(state.historyDetailOrderId, 'pdf').catch(error => toast(error.message, true)));

  els.closedOrderExcelBtn.addEventListener('click', () => downloadIndividual(state.order?.order_id, 'xlsx').catch(error => toast(error.message, true)));
  els.closedOrderPdfBtn.addEventListener('click', () => downloadIndividual(state.order?.order_id, 'pdf').catch(error => toast(error.message, true)));

  els.successExcelBtn.addEventListener('click', () => downloadIndividual(state.lastConfirmedOrderId, 'xlsx').catch(error => toast(error.message, true)));
  els.successPdfBtn.addEventListener('click', () => downloadIndividual(state.lastConfirmedOrderId, 'pdf').catch(error => toast(error.message, true)));
  els.successCloseBtn.addEventListener('click', closeSuccessModal);
  els.successModal.addEventListener('click', event => { if (event.target === els.successModal) closeSuccessModal(); });

  els.searchInput.addEventListener('input', () => { state.search = els.searchInput.value; state.visibleCount = PAGE_SIZE; applyFilters(); });
  els.categoryFilters.addEventListener('click', event => {
    const btn = event.target.closest('[data-category]'); if (!btn) return;
    state.category = btn.dataset.category || 'all'; state.visibleCount = PAGE_SIZE;
    els.categoryFilters.querySelectorAll('.filter-pill').forEach(node => node.classList.toggle('is-active', node === btn)); applyFilters();
  });
  els.loadMoreBtn.addEventListener('click', () => { state.visibleCount += PAGE_SIZE; renderCatalog(); });
  els.refreshBtn.addEventListener('click', async () => {
    setLoading(true, 'Actualizando catálogo…');
    try { await Promise.all([loadPerfumes({ quiet: true }), loadOrder({ quiet: true })]); toast('Catálogo y pedido actualizados.'); }
    catch (error) { toast(error.message || 'No se pudo actualizar.', true); }
    finally { setLoading(false); }
  });

  els.catalogGrid.addEventListener('click', event => {
    const btn = event.target.closest('[data-perfume-id]'); if (!btn || btn.disabled) return;
    const perfume = state.perfumes.find(item => item.id === btn.dataset.perfumeId); if (perfume) openEditorForPerfume(perfume);
  });

  els.floatingOrderBtn.addEventListener('click', openCart);
  els.closeCartBtn.addEventListener('click', closeCart);
  els.cartBackdrop.addEventListener('click', closeCart);

  els.cartItems.addEventListener('click', event => {
    const editBtn = event.target.closest('[data-edit-item]');
    if (editBtn) {
      const item = state.orderItems.find(x => x.item_id === editBtn.dataset.editItem); if (!item) return;
      const perfume = state.perfumes.find(x => x.id === item.perfume_id) || {
        id: item.perfume_id,
        name: item.perfume_name,
        designer: item.designer,
        category: item.category,
        image_url: item.image_url
      };
      openEditorForPerfume(perfume, {
        quantity: item.quantity,
        samples: item.sample_quantity,
        note: item.customer_note,
        presentation: item.presentation || null,
        item
      }); return;
    }
    const duplicateBtn = event.target.closest('[data-duplicate-item]');
    if (duplicateBtn) {
      const item = state.orderItems.find(x => x.item_id === duplicateBtn.dataset.duplicateItem); if (!item) return;
      const perfume = state.perfumes.find(x => x.id === item.perfume_id) || {
        id: item.perfume_id,
        name: item.perfume_name,
        designer: item.designer,
        category: item.category,
        image_url: item.image_url
      };
      openEditorForPerfume(perfume, {
        quantity: 1,
        samples: 0,
        note: '',
        presentation: item.presentation || null
      }); return;
    }
    const deleteBtn = event.target.closest('[data-delete-item]'); if (deleteBtn) deleteItem(deleteBtn.dataset.deleteItem);
  });

  els.closeEditorBtn.addEventListener('click', closeEditor);
  els.editorModal.addEventListener('click', event => { if (event.target === els.editorModal) closeEditor(); });
  els.itemEditorForm.addEventListener('click', event => {
    const btn = event.target.closest('[data-step]'); if (!btn) return;
    const input = btn.dataset.step === 'samples' ? els.itemSamples : els.itemQuantity;
    const min = btn.dataset.step === 'samples' ? 0 : 1;
    input.value = Math.max(min, (Number.parseInt(input.value, 10) || min) + Number(btn.dataset.delta || 0));
  });
  els.itemEditorForm.addEventListener('submit', async event => {
    event.preventDefault(); els.saveItemBtn.disabled = true; setLoading(true, state.editorMode === 'edit' ? 'Guardando cambios…' : 'Agregando al pedido…');
    try { await saveEditorItem(); }
    catch (error) { toast(error.message || 'No se pudo guardar el producto.', true); }
    finally { setLoading(false); els.saveItemBtn.disabled = false; }
  });

  els.confirmOrderBtn.addEventListener('click', openConfirmModal);
  els.cancelConfirmBtn.addEventListener('click', closeConfirmModal);
  els.confirmModal.addEventListener('click', event => { if (event.target === els.confirmModal) closeConfirmModal(); });
  els.confirmAcknowledge.addEventListener('change', () => { els.finalConfirmBtn.disabled = !els.confirmAcknowledge.checked; });
  els.finalConfirmBtn.addEventListener('click', confirmOrder);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!els.successModal.hidden) closeSuccessModal();
    else if (!els.historyDetailModal.hidden) closeHistoryDetail();
    else if (!els.confirmModal.hidden) closeConfirmModal();
    else if (!els.editorModal.hidden) closeEditor();
    else if (!els.historySheet.hidden) closeHistory();
    else if (!els.cartSheet.hidden) closeCart();
  });

  initializeSession();
})();
