(() => {
  'use strict';
  const grid = document.getElementById('distributorGrid');
  if (!grid) return;

  const renderEmpty = () => {
    grid.innerHTML = `
      <div class="dist-empty">
        <strong>Directorio oficial en actualización</strong>
        <span>Estamos incorporando las credenciales de nuestra red autorizada. Si deseas confirmar a tu vendedor antes de comprar, escríbenos por Instagram.</span>
      </div>`;
  };

  const render = distributors => {
    if (!Array.isArray(distributors) || !distributors.length) {
      renderEmpty();
      return;
    }
    grid.innerHTML = distributors.map(item => `
      <article class="dist-card">
        ${item.photo ? `<img class="dist-photo" src="${item.photo}" alt="Foto de ${item.name}">` : ''}
        <span class="dist-status">DISTRIBUIDOR AUTORIZADO</span>
        <h2>${item.displayName || item.name}</h2>
        <p class="dist-meta">${item.city || ''}${item.city && item.phone ? ' · ' : ''}${item.phone || ''}</p>
        <p class="dist-id">ID PRIVÉ · ${item.id || 'Pendiente'}</p>
      </article>`).join('');
  };

  fetch('/data/distributors.json', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error('No disponible')))
    .then(data => render(data.distributors))
    .catch(renderEmpty);
})();
