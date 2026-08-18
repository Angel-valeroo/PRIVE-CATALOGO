(() => {
  'use strict';

  const TRUST_NOTICE_KEY = 'prive-trust-notice-seen-v1';
  const ENTRY_MODE_KEY = 'prive-entry-mode-v1';
  const ROOT_PATHS = new Set(['/', '/index.html']);

  const bottles = [
    { src: '/IMAGES/Caballero/CP02515.avif', cls: 'b1', alt: 'VALENTINO UOMO BORN IN ROMA INTENSE' },
    { src: '/IMAGES/Caballero/CP01021.avif', cls: 'b2', alt: '1 MILLION' },
    { src: '/IMAGES/Caballero/CP01092.avif', cls: 'b3', alt: 'INVICTUS' },
    { src: '/IMAGES/Caballero/CP02498.avif', cls: 'b4', alt: 'IMAGINATION' },
    { src: '/IMAGES/Caballero/CP02158.avif', cls: 'b5', alt: 'SAUVAGE' },
    { src: '/IMAGES/Caballero/CP00879.avif', cls: 'b6', alt: 'LE MALE' },
    { src: '/IMAGES/Caballero/CP00725.avif', cls: 'b7', alt: 'ACQUA DI GIO' },
    { src: '/IMAGES/Caballero/CP01059.avif', cls: 'b8', alt: 'BLEU DE CHANEL' },

    { src: '/IMAGES/Dama/DP02404.avif', cls: 'b9', alt: 'GOOD GIRL' },
    { src: '/IMAGES/Dama/DP02522.avif', cls: 'b10', alt: 'CLOUD' },
    { src: '/IMAGES/Dama/DP02782.avif', cls: 'b11', alt: 'CLOUD PINK' },
    { src: '/IMAGES/Dama/DP02331.avif', cls: 'b12', alt: 'ARI' },
    { src: '/IMAGES/Dama/DP02632.avif', cls: 'b13', alt: 'SWEET LIKE CANDY' },
    { src: '/IMAGES/Dama/DP02757.avif', cls: 'b14', alt: 'VALENTINO DONNA BORN IN ROMA INTENSE' },
    { src: '/IMAGES/Dama/DP02791.avif', cls: 'b15', alt: 'YARA' },
    { src: '/IMAGES/Dama/DP02495.avif', cls: 'b16', alt: 'BURBERRY HER' },
    { src: '/IMAGES/Dama/DP02515.avif', cls: 'b17', alt: 'LIBRE' },
    { src: '/IMAGES/Dama/DP02261.avif', cls: 'b18', alt: 'LA VIE EST BELLE' },
    { src: '/IMAGES/Dama/DP02572.avif', cls: 'b19', alt: 'MY WAY' },
    { src: '/IMAGES/Dama/DP02802.avif', cls: 'b20', alt: 'PRADA PARADOXE' },
    { src: '/IMAGES/Dama/DP02843.avif', cls: 'b21', alt: 'DELINA EXCLUSIF' },

    { src: '/IMAGES/Unisex/UP01140.avif', cls: 'b22', alt: 'BACCARAT ROUGE 540 EXTRAIT' },
    { src: '/IMAGES/Unisex/UP01129.avif', cls: 'b23', alt: 'ERBA PURA' },
    { src: '/IMAGES/Unisex/UP01090.avif', cls: 'b24', alt: 'OMBRE NOMADE' },
    { src: '/IMAGES/Unisex/UP01147.avif', cls: 'b25', alt: 'ACCENTO' },
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

    if (entry === 'home') {
      cleanEntryParam();
      setEntryMode('');
      try {
        sessionStorage.removeItem(TRUST_NOTICE_KEY);
        sessionStorage.removeItem('prive-public-search-v1');
      } catch (_) {}
      const gate = createGate();
      document.body.appendChild(gate);
      gate.querySelector('#priveClientEntry')?.addEventListener('click', goToClientFlow);
      return;
    }

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
