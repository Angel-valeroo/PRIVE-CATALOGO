(() => {
  'use strict';

  const NOTICE_KEY = 'prive-trust-notice-seen-v1';
  const INSTAGRAM_URL = 'https://www.instagram.com/prive_trc/';

  const alreadySeen = () => {
    try { return sessionStorage.getItem(NOTICE_KEY) === '1'; }
    catch (_) { return false; }
  };

  const markSeen = () => {
    try { sessionStorage.setItem(NOTICE_KEY, '1'); } catch (_) {}
  };

  const accessIsLocked = () => document.documentElement.classList.contains('prive-access-locked');

  const buildNotice = () => {
    const notice = document.createElement('section');
    notice.id = 'priveTrustNotice';
    notice.className = 'prive-trust-notice';
    notice.setAttribute('role', 'dialog');
    notice.setAttribute('aria-modal', 'true');
    notice.setAttribute('aria-labelledby', 'priveTrustTitle');
    notice.innerHTML = `
      <div class="prive-trust-card prive-trust-card--alert">
        <div class="prive-trust-brand-lockup" aria-label="Perfumería PRIVÉ">
          <span class="prive-trust-brand-small">PERFUMERÍA</span>
          <strong>PRIVÉ</strong>
        </div>
        <div class="prive-trust-alert-band" role="note">
          <span class="prive-trust-alert-icon" aria-hidden="true">!</span>
          <span>AVISO DE SEGURIDAD PARA TU COMPRA</span>
        </div>
        <p class="prive-trust-overline">RESPALDO OFICIAL PRIVÉ</p>
        <h2 id="priveTrustTitle">Compra con confianza</h2>
        <p class="prive-trust-lead">Para proteger tu compra y conservar el respaldo de nuestra garantía, adquiere tus fragancias únicamente con distribuidores autorizados de PRIVÉ.</p>
        <p class="prive-trust-warning"><strong>Importante:</strong> que una persona comparta este catálogo oficial no significa que forme parte de nuestra red. PRIVÉ no puede verificar la procedencia, calidad o desempeño de productos vendidos por terceros no autorizados.</p>
        <div class="prive-trust-actions">
          <a class="prive-trust-primary" href="/distribuidores.html">Ver distribuidores autorizados</a>
          <button id="priveTrustContinue" class="prive-trust-secondary" type="button">Continuar al catálogo</button>
        </div>
        <a class="prive-trust-instagram" href="${INSTAGRAM_URL}" target="_blank" rel="noopener noreferrer">Instagram oficial · @prive_trc</a>
      </div>`;
    return notice;
  };

  const showNotice = () => {
    if (alreadySeen() || document.getElementById('priveTrustNotice')) return;
    const notice = buildNotice();
    document.body.appendChild(notice);
    document.body.classList.add('prive-trust-open');
    const close = () => {
      markSeen();
      document.body.classList.remove('prive-trust-open');
      notice.remove();
      window.dispatchEvent(new CustomEvent('prive:catalog-entered'));
    };
    notice.querySelector('#priveTrustContinue')?.addEventListener('click', close);
  };

  const init = () => {
    window.addEventListener('prive:client-entry', () => {
      window.setTimeout(showNotice, 40);
    });

    if (!accessIsLocked()) {
      showNotice();
      return;
    }

    const observer = new MutationObserver(() => {
      if (!accessIsLocked()) {
        observer.disconnect();
        window.setTimeout(showNotice, 70);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
