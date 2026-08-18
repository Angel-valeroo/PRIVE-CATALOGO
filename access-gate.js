(() => {
  'use strict';

  const TRUST_NOTICE_KEY = 'prive-trust-notice-seen-v1';
  const ROOT_PATHS = new Set(['/', '/index.html']);

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
    try { sessionStorage.removeItem(TRUST_NOTICE_KEY); } catch (_) {}
    unlock();
    window.dispatchEvent(new CustomEvent('prive:client-entry'));
  };

  const goToClientFlow = () => {
    if (ROOT_PATHS.has(window.location.pathname)) {
      openClientFlow();
      return;
    }
    window.location.assign('/?entry=client');
  };

  const createGate = () => {
    const gate = document.createElement('section');
    gate.id = 'priveAccessGate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'priveGateTitle');
    gate.innerHTML = `
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
