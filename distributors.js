(() => {
  'use strict';

  const grid = document.getElementById('distributorGrid');
  const modal = document.getElementById('distributorProfileModal');
  const modalPanel = document.getElementById('distributorProfilePanel');
  const modalContent = document.getElementById('distributorProfileContent');
  const modalClose = document.getElementById('distributorProfileClose');
  if (!grid) return;

  let directory = [];

  const BUILTIN_DISTRIBUTORS = [{"type":"owner","name":"Angel Valero","alias":"Valero","role":"Fundador - CEO de PRIVÉ","city":"Torreón, Coahuila","phone":"871 483 9533","instagram":"https://www.instagram.com/angel_valeroo/","instagramHandle":"@angel_valeroo","photo":"/assets/distributors/angel-valero.jpg","badge":"PERFIL OFICIAL","verified":true,"quote":"La calidad nos unió; la confianza nos hace crecer.","founderMessage":"PRIVÉ nació con una idea sencilla: ofrecer perfumes de gran calidad a un precio justo. Todo lo que hemos construido ha sido posible, primero, gracias a Dios; también gracias a mi familia, a las personas que creyeron en este proyecto desde el comienzo y a cada cliente que nos dio su confianza al elegir nuestros perfumes. Con el tiempo entendí que lo más valioso no son solo las fragancias, sino la confianza, el apoyo y las personas que han decidido crecer junto a nosotros. Gracias por formar parte de este emprendimiento y de esta historia."},{"type":"executive","name":"Mariana Valero","alias":"Mariana","role":"CEO y Redes","city":"Tijuana, Baja California","phone":"+52 1 871 146 4232","instagram":"https://www.instagram.com/mariana_valerog/","instagramHandle":"@mariana_valerog","photo":"/assets/distributors/mariana-valero.jpg","badge":"PERFIL OFICIAL","verified":true,"network":[]},{"type":"distributor","name":"Roberto Guerra González","alias":"Rober","role":"Distribuidor autorizado","city":"Torreón, Coahuila","phone":"871 458 4498","instagram":"https://www.instagram.com/robertoguerraglz/","instagramHandle":"@robertoguerraglz","photo":"/assets/distributors/roberto-guerra-gonzalez.jpg","badge":"DISTRIBUIDOR AUTORIZADO","network":[],"networkPending":true},{"type":"distributor","name":"Adalaaí Cabrera","alias":"Cabrera","role":"Distribuidor autorizado","city":"Torreón, Coahuila","phone":"871 571 9087","instagram":"https://www.instagram.com/adalaaicabreraa?igsh=ZHI4cG9zdTh5ZTJ3","instagramHandle":"@adalaaicabreraa","photo":"/assets/distributors/adalaai-cabrera.jpg","badge":"DISTRIBUIDOR AUTORIZADO","network":[]},{"type":"distributor","name":"Angel Soto","alias":"Soto","role":"Redes - Distribuidor Autorizado","city":"Torreón, Coahuila","phone":"871 487 9446 / 81 4596 5129","instagram":"https://www.instagram.com/whereis.soto/","instagramHandle":"@whereis.soto","photo":"/assets/distributors/angel-soto.jpg","badge":"DISTRIBUIDOR AUTORIZADO","network":[],"networkPending":true},{"type":"distributor","name":"Diana Rodriguez","alias":"Diana","role":"Distribuidor autorizado","city":"Torreón, Coahuila","phone":"871 115 6768","instagram":"https://www.instagram.com/diana_rdz007/","instagramHandle":"@diana_rdz007","photo":"/assets/distributors/diana-rodriguez.jpg","badge":"DISTRIBUIDOR AUTORIZADO","network":[]},{"type":"distributor","name":"Ernesto Meraz","alias":"Jonny","role":"Distribuidor autorizado","city":"Torreón, Coahuila","phone":"871 451 3244","instagram":"https://www.instagram.com/jonny_015__/","instagramHandle":"@jonny_015__","photo":"/assets/distributors/ernesto-meraz.jpg","badge":"DISTRIBUIDOR AUTORIZADO","network":[]},{"type":"distributor","name":"Francisco Félix","alias":"Frank","role":"Distribuidor autorizado","city":"Torreón, Coahuila","phone":"667 423 9767","photo":"/assets/distributors/francisco-felix.jpg","badge":"DISTRIBUIDOR AUTORIZADO","network":[]},{"type":"distributor","name":"Kaled Puentes","alias":"Kaled / Flaco","role":"Distribuidor autorizado","city":"Torreón, Coahuila","phone":"870 149 7694","instagram":"https://www.instagram.com/90085p/","instagramHandle":"@90085p","photo":"/assets/distributors/kaled-puentes.jpg","badge":"DISTRIBUIDOR AUTORIZADO","network":[]},{"type":"distributor","name":"Ruben Albores","alias":"Chaparro","role":"Distribuidor autorizado","city":"Torreón, Coahuila","phone":"871 594 5420","photo":"/assets/distributors/ruben-albores.jpg","badge":"DISTRIBUIDOR AUTORIZADO","network":[]}];
  let lastTrigger = null;

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const safeUrl = value => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, window.location.origin);
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
  const isVerifiedProfile = item => Boolean(item?.verified || item?.type === 'owner');
  const isOfficialLeadership = item => item?.type === 'owner' || item?.type === 'executive';

  const renderEmpty = () => {
    grid.innerHTML = `
      <div class="dist-empty">
        <strong>Directorio oficial en actualización</strong>
        <span>Estamos incorporando las credenciales de nuestra red autorizada. Si deseas confirmar a tu vendedor antes de comprar, escríbenos por Instagram.</span>
      </div>`;
  };

  const renderCard = (item, index) => {
    const isOwner = item.type === 'owner';
    const isLeadership = isOfficialLeadership(item);
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
      <article class="dist-card${isLeadership ? ' dist-card--owner' : ''}" data-distributor-index="${index}">
        <button class="dist-card-button" type="button" aria-label="Más detalles de ${name}" data-open-profile="${index}">
          <div class="dist-card-inner">
            <div class="dist-photo-frame">
              ${photo ? `<img class="dist-photo" src="${esc(photo)}" alt="Foto de ${name}" loading="lazy" decoding="async">` : '<div class="dist-photo dist-photo--placeholder" aria-hidden="true">PRIVÉ</div>'}
            </div>
            <div class="dist-card-body">
              <span class="dist-status${isLeadership ? ' dist-status--owner' : ''}">${role}</span>
              <p class="dist-eyebrow">${isLeadership ? 'DIRECCIÓN OFICIAL' : 'RED OFICIAL PRIVÉ'}</p>
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
    const isVerified = isVerifiedProfile(item);
    const isLeadership = isOfficialLeadership(item);
    const name = esc(item.name || '');
    const alias = esc(item.alias || '');
    const role = esc(roleFor(item));
    const city = esc(item.city || '');
    const phone = esc(item.phone || '');
    const photo = safeUrl(item.photo);
    const instagram = safeUrl(item.instagram);
    const instagramHandle = esc(item.instagramHandle || 'Instagram');
    const id = esc(item.id || '');
    const badge = esc(isVerified ? 'PERFIL OFICIAL' : (item.badge || 'DISTRIBUIDOR AUTORIZADO'));
    const quote = esc(item.quote || (isOwner ? "La calidad nos unió; la confianza nos hace crecer." : ''));
    const founderMessage = esc(item.founderMessage || (isOwner ? "PRIVÉ nació con una idea sencilla: ofrecer perfumes de gran calidad a un precio justo. Todo lo que hemos construido ha sido posible, primero, gracias a Dios; también gracias a mi familia, a las personas que creyeron en este proyecto desde el comienzo y a cada cliente que nos dio su confianza al elegir nuestros perfumes. Con el tiempo entendí que lo más valioso no son solo las fragancias, sino la confianza, el apoyo y las personas que han decidido crecer junto a nosotros. Gracias por formar parte de este emprendimiento y de esta historia." : ''));
    const network = normalizeNetwork(item.network);
    const activeDistributorCount = directory.filter(entry => entry && entry.type === 'distributor').length;

    return `
      <div class="dist-profile${isLeadership ? ' dist-profile--owner' : ''}">
        <div class="dist-profile-hero">
          <div class="dist-profile-photo-frame">
            ${photo ? `<img class="dist-profile-photo" src="${esc(photo)}" alt="Foto de ${name}">` : '<div class="dist-profile-photo dist-photo--placeholder" aria-hidden="true">PRIVÉ</div>'}
          </div>
          <div class="dist-profile-heading">
            ${isVerified
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

  // Render the built-in directory immediately so the public page never depends
  // on a stale CDN copy of data/distributors.json. The external JSON remains the
  // canonical update path and can override this fallback when it is at least as complete.
  render(BUILTIN_DISTRIBUTORS);

  fetch('/data/distributors.json?v=7.14', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('No disponible')))
    .then(data => {
      const remote = Array.isArray(data?.distributors) ? data.distributors : [];
      if (remote.length >= BUILTIN_DISTRIBUTORS.length) render(remote);
    })
    .catch(() => { /* Built-in directory is already visible. */ });
})();
