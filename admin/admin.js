(() => {
  'use strict';

  const CONFIG_KEY = 'prive-admin-supabase-config-v1';
  const DEFAULT_CONFIG = Object.freeze({
    url: 'https://uqjrotqqquorsagwiara.supabase.co',
    publishableKey: 'sb_publishable_KV6_5XskGXe8mCg-6vfkiA_vNMKDZNP'
  });
  const SESSION_KEY = 'prive-admin-session-v1';
  const state = {
    cycles: [],
    history: [],
    filter: 'orders',
    cycleSearch: '',
    historySearch: '',
    selectedCycle: null,
    selectedOrder: null,
    detailOrigin: 'orders',
    session: null,
    config: null
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
    metricOrders: $('#metricOrders'), metricPerfumes: $('#metricPerfumes'), metricSamples: $('#metricSamples'), toast: $('#toast'), loadingLayer: $('#loadingLayer')
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
    if (!state.session) return false;
    if (await refreshSessionIfNeeded()) return true;
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
        showView('login');
      }
      throw new Error(message);
    }
    return data;
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
    els.detailTableBody.innerHTML = rows.map(row => `<tr><td>${Number(row.quantity)||0}</td><td>${esc(row.perfume_name)}</td><td>${esc(row.perfume_code)}</td><td>${Number(row.sample_quantity)||0}</td><td>${esc(row.customer_note || '—')}</td></tr>`).join('');
    els.detailDownloadActions.innerHTML = `<button class="btn btn-primary" data-detail-download="xlsx">Excel individual</button><button class="btn btn-ghost" data-detail-download="pdf">PDF individual</button>`;
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

  els.logoutBtn.addEventListener('click', () => {
    state.session = null;
    state.history = [];
    clearStored(SESSION_KEY);
    showView('login');
  });

  if (els.changeConfigBtn) {
    els.changeConfigBtn.addEventListener('click', () => {
      clearStored(SESSION_KEY);
      state.session = null;
      showView('login');
    });
  }

  els.refreshBtn.addEventListener('click', () => loadCycles().catch(error => toast(friendlyNetworkError(error).message, true)));
  els.historyRefreshBtn.addEventListener('click', () => loadHistory(true).catch(error => toast(friendlyNetworkError(error).message, true)));

  document.querySelectorAll('[data-panel-view]').forEach(button => button.addEventListener('click', async () => {
    const view = button.dataset.panelView;
    if (view === 'history') {
      showPanelSection('history');
      try { await loadHistory(); } catch (error) { toast(friendlyNetworkError(error).message, true); }
    } else {
      showPanelSection('cycles');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }));

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

  els.detailDownloadActions.addEventListener('click', event => {
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
    // La Project URL y la Publishable key son configuración pública del cliente.
    // La seguridad real permanece en Supabase Auth, RLS, RPC y Edge Functions.
    state.config = { ...DEFAULT_CONFIG };
    saveStored(CONFIG_KEY, state.config);
    state.session = readStored(SESSION_KEY);

    if (state.session && await ensureSession()) {
      try {
        await verifyAdminProfile();
        els.sessionBadge.textContent = state.session.user?.email || 'Admin';
        showView('app');
        showPanelSection('cycles');
        await loadCycles();
      } catch (error) {
        const friendly = friendlyNetworkError(error);
        toast(friendly.message, true);
        if (/admin|autentic|sesión/i.test(friendly.message)) {
          state.session = null;
          clearStored(SESSION_KEY);
          showView('login');
        }
      }
      return;
    }

    showView('login');
  }

  init();
})();
