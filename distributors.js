(() => {
  'use strict';
  const grid = document.getElementById('distributorGrid');
  if (!grid) return;

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));

  const safeUrl = value => {
    try {
      const url = new URL(String(value || ''), window.location.origin);
      return ['https:', 'http:', 'tel:'].includes(url.protocol) ? url.href : '';
    } catch {
      return '';
    }
  };

  const renderEmpty = () => {
    grid.innerHTML = `
      <div class="dist-empty">
        <strong>Directorio oficial en actualización</strong>
        <span>Estamos incorporando las credenciales de nuestra red autorizada. Si deseas confirmar a tu vendedor antes de comprar, escríbenos por Instagram.</span>
      </div>`;
  };

  const renderCard = item => {
    const isOwner = item.type === 'owner';
    const name = esc(item.name || '');
    const alias = esc(item.alias || '');
    const role = esc(item.role || (isOwner ? 'CEO de PRIVÉ' : 'Distribuidor autorizado'));
    const city = esc(item.city || '');
    const phone = esc(item.phone || '');
    const photo = safeUrl(item.photo);
    const instagram = safeUrl(item.instagram);
    const instagramHandle = esc(item.instagramHandle || 'Instagram');
    const id = esc(item.id || '');

    return `
      <article class="dist-card${isOwner ? ' dist-card--owner' : ''}">
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
            <div class="dist-contact-list">
              ${phone ? `<div class="dist-contact dist-contact--phone" aria-label="Teléfono de ${name}"><span>Teléfono</span><strong>${phone}</strong></div>` : ''}
              ${instagram ? `<a class="dist-contact dist-contact--instagram" href="${esc(instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram de ${name}"><span>Instagram</span><strong>${instagramHandle}</strong></a>` : ''}
            </div>
            ${id ? `<p class="dist-id">ID PRIVÉ · ${id}</p>` : ''}
          </div>
        </div>
      </article>`;
  };

  const render = distributors => {
    if (!Array.isArray(distributors) || !distributors.length) {
      renderEmpty();
      return;
    }
    grid.innerHTML = distributors.map(renderCard).join('');
  };

  fetch('/data/distributors.json', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('No disponible')))
    .then(data => render(data.distributors))
    .catch(renderEmpty);
})();
