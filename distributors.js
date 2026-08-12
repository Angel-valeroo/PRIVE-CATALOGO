(() => {
  'use strict';

  const grid = document.getElementById('distributorGrid');
  const modal = document.getElementById('distributorProfileModal');
  const modalPanel = document.getElementById('distributorProfilePanel');
  const modalContent = document.getElementById('distributorProfileContent');
  const modalClose = document.getElementById('distributorProfileClose');
  if (!grid) return;

  let directory = [];
  let lastTrigger = null;

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const safeUrl = value => {
    try {
      const url = new URL(String(value || ''), window.location.origin);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

  const normalizeNetwork = value => Array.isArray(value)
    ? value.filter(Boolean).map(member => ({
        name: esc(member?.name || ''),
        alias: esc(member?.alias || '')
      })).filter(member => member.name || member.alias)
    : [];

  const roleFor = item => item.type === 'owner' ? 'Fundador - CEO de PRIVÉ' : (item.role || 'Distribuidor autorizado');

  const renderEmpty = () => {
    grid.innerHTML = `
      <div class="dist-empty">
        <strong>Directorio oficial en actualización</strong>
        <span>Estamos incorporando las credenciales de nuestra red autorizada. Si deseas confirmar a tu vendedor antes de comprar, escríbenos por Instagram.</span>
      </div>`;
  };

  const renderCard = (item, index) => {
    const isOwner = item.type === 'owner';
    const name = esc(item.name || '');
    const alias = esc(item.alias || '');
    const role = esc(roleFor(item));
    const city = esc(item.city || '');
    const photo = safeUrl(item.photo);
    const network = normalizeNetwork(item.network);
    const networkLabel = network.length
      ? `<span class="dist-network-count">${network.length} ${network.length === 1 ? 'revendedor' : 'revendedores'}</span>`
      : '';

    return `
      <article class="dist-card${isOwner ? ' dist-card--owner' : ''}" data-distributor-index="${index}">
        <button class="dist-card-button" type="button" aria-label="Más detalles de ${name}" data-open-profile="${index}">
          <div class="dist-card-inner">
            <div class="dist-photo-frame">
              ${photo ? `<img class="dist-photo" src="${esc(photo)}" alt="Foto de ${name}" loading="lazy" decoding="async">` : '<div class="dist-photo dist-photo--placeholder" aria-hidden="true">PRIVÉ</div>'}
            </div>
            <div class="dist-card-body">
              <span class="dist-status${isOwner ? ' dist-status--owner' : ''}">${role}</span>
              <p class="dist-eyebrow">${isOwner ? 'DIRECCIÓN OFICIAL' : 'RED OFICIAL PRIVÉ'}</p>
              <h2>${name}</h2>
              ${alias ? `<p class="dist-alias">“${alias}”</p>` : ''}
              ${city ? `<p class="dist-meta">${city}</p>` : ''}
              <div class="dist-card-footer">
                ${networkLabel}
                <span class="dist-view-profile">Más detalles <span aria-hidden="true">↗</span></span>
              </div>
            </div>
          </div>
        </button>
      </article>`;
  };

  const renderNetwork = network => {
    if (!network.length) return '';
    return `
      <section class="dist-profile-network" aria-labelledby="distNetworkTitle">
        <div class="dist-profile-section-head">
          <p class="dist-profile-kicker">RED DEL DISTRIBUIDOR</p>
          <h3 id="distNetworkTitle">${network.length} ${network.length === 1 ? 'revendedor' : 'revendedores'}</h3>
        </div>
        <div class="dist-network-list">
          ${network.map(member => `
            <div class="dist-network-member">
              <strong>${member.name || member.alias}</strong>
              ${member.alias && member.name ? `<span>“${member.alias}”</span>` : ''}
            </div>`).join('')}
        </div>
      </section>`;
  };

  const profileHtml = item => {
    const isOwner = item.type === 'owner';
    const name = esc(item.name || '');
    const alias = esc(item.alias || '');
    const role = esc(roleFor(item));
    const city = esc(item.city || '');
    const phone = esc(item.phone || '');
    const photo = safeUrl(item.photo);
    const instagram = safeUrl(item.instagram);
    const instagramHandle = esc(item.instagramHandle || 'Instagram');
    const id = esc(item.id || '');
    const badge = esc(isOwner ? 'PERFIL OFICIAL' : (item.badge || 'DISTRIBUIDOR AUTORIZADO'));
    const quote = esc(item.quote || (isOwner ? "La calidad nos unió; la confianza nos hace crecer." : ''));
    const founderMessage = esc(item.founderMessage || (isOwner ? "PRIVÉ nació con una idea sencilla: ofrecer perfumes de gran calidad a un precio justo. Con el tiempo entendimos que lo más valioso no eran solo los aromas, sino la confianza de quienes nos eligieron y el apoyo de quienes decidieron crecer con nosotros. Gracias por formar parte de esta historia." : ''));
    const network = normalizeNetwork(item.network);
    const activeDistributorCount = directory.filter(entry => entry && entry.type !== 'owner').length;

    return `
      <div class="dist-profile${isOwner ? ' dist-profile--owner' : ''}">
        <div class="dist-profile-hero">
          <div class="dist-profile-photo-frame">
            ${photo ? `<img class="dist-profile-photo" src="${esc(photo)}" alt="Foto de ${name}">` : '<div class="dist-profile-photo dist-photo--placeholder" aria-hidden="true">PRIVÉ</div>'}
          </div>
          <div class="dist-profile-heading">
            ${isOwner
              ? `<span class="dist-profile-badge dist-profile-badge--verified"><span>${badge}</span><span class="dist-verified-check" aria-label="Perfil verificado">✓</span></span>`
              : `<span class="dist-profile-badge">${badge}</span>`}
            <p class="dist-profile-role">${role}</p>
            <h2 id="distributorProfileTitle">${name}</h2>
            ${alias ? `<p class="dist-profile-alias">“${alias}”</p>` : ''}
            ${city ? `<p class="dist-profile-city">${city}</p>` : ''}
          </div>
        </div>

        ${quote ? `<blockquote class="dist-founder-quote">“${quote}”</blockquote>` : ''}

        ${founderMessage ? `
          <section class="dist-founder-message">
            <p class="dist-profile-kicker">MENSAJE DEL FUNDADOR</p>
            <p>${founderMessage}</p>
          </section>` : ''}

        ${isOwner ? `
          <div class="dist-founder-stat">
            <span>Distribuidores autorizados activos</span>
            <strong>${activeDistributorCount}</strong>
          </div>` : ''}

        <section class="dist-profile-contact" aria-label="Información de contacto">
          ${phone ? `<div class="dist-profile-contact-row"><span>Teléfono</span><strong>${phone}</strong></div>` : ''}
          ${instagram ? `<a class="dist-profile-instagram" href="${esc(instagram)}" target="_blank" rel="noopener noreferrer"><span>Instagram</span><strong>${instagramHandle}</strong></a>` : ''}
          ${id ? `<div class="dist-profile-contact-row"><span>ID PRIVÉ</span><strong>${id}</strong></div>` : ''}
        </section>

        ${renderNetwork(network)}
      </div>`;
  };

  const closeProfile = () => {
    if (!modal || !modal.open) return;
    modal.classList.add('is-closing');
    window.setTimeout(() => {
      modal.close();
      modal.classList.remove('is-closing');
      document.body.classList.remove('dist-profile-open');
      if (modalContent) modalContent.innerHTML = '';
      lastTrigger?.focus?.({ preventScroll: true });
      lastTrigger = null;
    }, 180);
  };

  const openProfile = (index, trigger) => {
    const item = directory[index];
    if (!item || !modal || !modalContent) return;
    lastTrigger = trigger || null;
    modalContent.innerHTML = profileHtml(item);
    document.body.classList.add('dist-profile-open');
    modal.classList.remove('is-closing', 'is-open');
    modal.showModal();
    if (modalPanel) {
      modalPanel.scrollTop = 0;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.requestAnimationFrame(() => {
      if (modalPanel) modalPanel.scrollTop = 0;
      modal.classList.add('is-open');
    });
  };

  const render = distributors => {
    if (!Array.isArray(distributors) || !distributors.length) {
      renderEmpty();
      return;
    }
    directory = distributors;
    grid.innerHTML = distributors.map(renderCard).join('');
    grid.querySelectorAll('[data-open-profile]').forEach(button => {
      button.addEventListener('click', () => openProfile(Number(button.dataset.openProfile), button));
    });
  };

  modalClose?.addEventListener('click', closeProfile);
  modal?.addEventListener('click', event => {
    if (event.target === modal) closeProfile();
  });
  modal?.addEventListener('cancel', event => {
    event.preventDefault();
    closeProfile();
  });

  fetch('/data/distributors.json', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('No disponible')))
    .then(data => render(data.distributors))
    .catch(renderEmpty);
})();
