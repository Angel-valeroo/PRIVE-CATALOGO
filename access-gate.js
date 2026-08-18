(() => {
  'use strict';

  const TRUST_NOTICE_KEY = 'prive-trust-notice-seen-v1';
  const ENTRY_MODE_KEY = 'prive-entry-mode-v1';
  const ROOT_PATHS = new Set(['/', '/index.html']);

  const bottles = [
    { src: '/IMAGES/Caballero/CP02266.avif', cls: 'b1', alt: 'BAD BOY' },
    { src: '/IMAGES/Caballero/CP02513.avif', cls: 'b2', alt: 'VALENTINO UOMO BORN IN ROMA' },
    { src: '/IMAGES/Caballero/CP02158.avif', cls: 'b3', alt: 'SAUVAGE' },
    { src: '/IMAGES/Caballero/CP02498.avif', cls: 'b4', alt: 'IMAGINATION' },
    { src: '/IMAGES/Caballero/CP00879.avif', cls: 'b5', alt: 'LE MALE' },

    { src: '/IMAGES/Dama/DP02791.avif', cls: 'b6', alt: 'YARA' },
    { src: '/IMAGES/Dama/DP02404.avif', cls: 'b7', alt: 'GOOD GIRL' },
    { src: '/IMAGES/Dama/DP02522.avif', cls: 'b8', alt: 'CLOUD' },
    { src: '/IMAGES/Dama/DP02515.avif', cls: 'b9', alt: 'LIBRE' },
    { src: '/IMAGES/Dama/DP02753.avif', cls: 'b10', alt: 'VALENTINO DONNA BORN IN ROMA' },

    { src: '/IMAGES/Unisex/UP01140.avif', cls: 'b11', alt: 'BACCARAT ROUGE 540' },
    { src: '/IMAGES/Unisex/UP01129.avif', cls: 'b12', alt: 'ERBA PURA' },
    { src: '/IMAGES/Unisex/UP01090.avif', cls: 'b13', alt: 'OMBRE NOMADE' },
  ];

  const getEntryMode = () => {
    try { return sessionStorage.getItem(ENTRY_MODE_KEY) || ''; }
    catch (_) { return ''; }
  };

  const setEntryMode = mode => {
    try {
      if (mode) sessionStorage.setItem(ENTRY_MODE_KEY, mode);
      else sessionStorage.removeItem(ENTRY_MODE_KEY);
    } catch (_) {}
  };

  const cleanEntryParam = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('entry');
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  };

  const unlock = () => {
    document.documentElement.classList.remove('prive-access-locked');
    document.getElementById('priveAccessGate')?.remove();
  };

  const openClientFlow = () => {
    setEntryMode('client');
    try { sessionStorage.removeItem(TRUST_NOTICE_KEY); } catch (_) {}
    unlock();
    window.dispatchEvent(new CustomEvent('prive:client-entry'));
  };

  const openCatalogDirect = () => {
    setEntryMode('client');
    try { sessionStorage.setItem(TRUST_NOTICE_KEY, '1'); } catch (_) {}
    unlock();
  };

  const goToClientFlow = () => {
    if (ROOT_PATHS.has(window.location.pathname)) {
      openClientFlow();
      return;
    }
    window.location.assign('/?entry=client');
  };

  const bottleMarkup = () => bottles.map(item => `
    <img
      class="prive-gate-bottle ${item.cls}"
      src="${item.src}"
      alt=""
      aria-hidden="true"
      decoding="async"
      fetchpriority="low"
    >`).join('');

  const createGate = () => {
    const gate = document.createElement('section');
    gate.id = 'priveAccessGate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'priveGateTitle');
    gate.innerHTML = `
      <div class="prive-gate-bottles" aria-hidden="true">${bottleMarkup()}</div>
      <div class="prive-entry-shell">
        <div class="prive-entry-brand">
          <p class="prive-gate-overline">PERFUMERÍA PRIVÉ</p>
          <p class="prive-gate-logo" aria-hidden="true">PRIVÉ</p>
          <p class="prive-entry-slogan">Huelen mejor de lo que cuestan.</p>
        </div>

        <div class="prive-entry-copy">
          <p class="prive-entry-kicker">BIENVENIDO</p>
          <h1 id="priveGateTitle">¿Cómo deseas entrar?</h1>
          <p>Elige tu acceso para continuar a la experiencia PRIVÉ.</p>
        </div>

        <div class="prive-entry-options">
          <a class="prive-entry-option prive-entry-option--distributor" href="/portal/">
            <span class="prive-entry-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 20v-1.5A4.5 4.5 0 0 1 8.5 14h7a4.5 4.5 0 0 1 4.5 4.5V20M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>
            </span>
            <span class="prive-entry-option-copy">
              <small>ACCESO PRIVADO</small>
              <strong>Acceder como distribuidor</strong>
              <span>Inicia sesión para consultar el catálogo operativo y gestionar tus pedidos.</span>
            </span>
            <span class="prive-entry-arrow" aria-hidden="true">→</span>
          </a>

          <button id="priveClientEntry" class="prive-entry-option prive-entry-option--client" type="button">
            <span class="prive-entry-option-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>
            </span>
            <span class="prive-entry-option-copy">
              <small>CATÁLOGO DIGITAL</small>
              <strong>Continuar como cliente</strong>
              <span>Consulta el respaldo oficial PRIVÉ y explora nuestra colección pública.</span>
            </span>
            <span class="prive-entry-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        <p class="prive-entry-note">Las claves internas de los perfumes permanecen privadas y no se muestran en el catálogo público.</p>
      </div>`;
    return gate;
  };

  const init = () => {
    const url = new URL(window.location.href);
    const entry = url.searchParams.get('entry');

    if (entry === 'client') {
      cleanEntryParam();
      openClientFlow();
      return;
    }

    if (entry === 'catalog') {
      cleanEntryParam();
      openCatalogDirect();
      return;
    }

    // Si el cliente ya eligió su ruta en esta pestaña, una recarga NO debe
    // regresarlo a la pantalla de bienvenida.
    if (ROOT_PATHS.has(window.location.pathname) && getEntryMode() === 'client') {
      unlock();
      return;
    }

    const gate = createGate();
    document.body.appendChild(gate);
    gate.querySelector('#priveClientEntry')?.addEventListener('click', goToClientFlow);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
