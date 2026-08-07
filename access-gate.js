(() => {
  'use strict';

  const STORAGE_KEY = 'prive-temporary-access-v2';
  const SESSION_VERSION = '2026-08-06-session-reset-1';
  const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
  const USER_HASH = 'a084b725dad07585b8c9f66036d409479304210734360e120141dc061b3d34f8';
  const PASSWORD_HASH = 'fc5cdcff45331834b9dc17a4de6514c5c23130a05cb2c6e3e3679ae94d1e883c';
  const INSTAGRAM_URL = 'https://www.instagram.com/prive_trc/';

  let expiryTimer = 0;

  const unlock = () => {
    document.documentElement.classList.remove('prive-access-locked');
    document.getElementById('priveAccessGate')?.remove();
  };

  const lockAndReload = () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
    window.location.reload();
  };

  const scheduleExpiry = grantedAt => {
    window.clearTimeout(expiryTimer);
    const remaining = SESSION_TTL_MS - (Date.now() - grantedAt);
    if (remaining <= 0) {
      lockAndReload();
      return;
    }
    expiryTimer = window.setTimeout(lockAndReload, Math.min(remaining, 2147483647));
  };

  const digest = async value => {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const readSession = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (session?.version !== SESSION_VERSION || !Number.isFinite(session?.grantedAt)) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      if (Date.now() - session.grantedAt >= SESSION_TTL_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch (_) {
      return null;
    }
  };

  const saveSession = () => {
    const session = {
      version: SESSION_VERSION,
      grantedAt: Date.now()
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (_) {
      /* El acceso sigue funcionando aunque el navegador bloquee storage. */
    }
    return session;
  };

  const createGate = () => {
    const gate = document.createElement('section');
    gate.id = 'priveAccessGate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'priveGateTitle');
    gate.innerHTML = `
      <div class="prive-gate-card">
        <div class="prive-gate-brand">
          <p class="prive-gate-overline">PERFUMERÍA PRIVÉ</p>
          <p class="prive-gate-logo" aria-hidden="true">PRIVÉ</p>
          <span class="prive-gate-status">Acceso temporal restringido</span>
        </div>
        <div class="prive-gate-copy">
          <h1 id="priveGateTitle">Acceso para distribuidores autorizados</h1>
          <p>El acceso al catálogo está disponible temporalmente únicamente para distribuidores autorizados de PRIVÉ. Ingresa tus credenciales para continuar.</p>
        </div>
        <form id="priveGateForm" class="prive-gate-form" novalidate>
          <label class="prive-gate-field">
            <span>Usuario</span>
            <input id="priveGateUser" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Usuario" required>
          </label>
          <label class="prive-gate-field">
            <span>Contraseña</span>
            <input id="priveGatePassword" name="password" type="password" autocomplete="current-password" placeholder="Contraseña" required>
          </label>
          <button id="priveGateSubmit" class="prive-gate-submit" type="submit">Entrar al catálogo</button>
          <p id="priveGateError" class="prive-gate-error" role="alert" aria-live="polite"></p>
        </form>
        <div class="prive-gate-client">
          <strong>¿Ya eres cliente de PRIVÉ o deseas conocer nuestra colección?</strong>
          <p>Visita nuestro Instagram oficial para consultar disponibilidad, recibir información personalizada o cotizar tus perfumes.</p>
          <a class="prive-gate-instagram" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer" aria-label="Abrir Instagram oficial de PRIVÉ">Instagram oficial · @prive_trc</a>
        </div>
        <p class="prive-gate-note">Si ya eres cliente, también puedes consultar directamente con tu vendedor la disponibilidad de tus fragancias.</p>
      </div>`;
    return gate;
  };

  const init = () => {
    const session = readSession();
    if (session) {
      unlock();
      scheduleExpiry(session.grantedAt);
      return;
    }

    const gate = createGate();
    document.body.appendChild(gate);
    const form = gate.querySelector('#priveGateForm');
    const user = gate.querySelector('#priveGateUser');
    const password = gate.querySelector('#priveGatePassword');
    const submit = gate.querySelector('#priveGateSubmit');
    const error = gate.querySelector('#priveGateError');

    requestAnimationFrame(() => user?.focus({ preventScroll: true }));

    form.addEventListener('submit', async event => {
      event.preventDefault();
      error.textContent = '';
      submit.disabled = true;
      try {
        const normalizedUser = user.value.trim().toLowerCase();
        const [userHash, passwordHash] = await Promise.all([
          digest(normalizedUser),
          digest(password.value)
        ]);
        if (userHash === USER_HASH && passwordHash === PASSWORD_HASH) {
          const newSession = saveSession();
          unlock();
          scheduleExpiry(newSession.grantedAt);
          return;
        }
        error.textContent = 'Usuario o contraseña incorrectos.';
        password.value = '';
        password.focus();
      } catch (_) {
        error.textContent = 'No fue posible validar el acceso. Inténtalo de nuevo.';
      } finally {
        submit.disabled = false;
      }
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
