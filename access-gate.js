(() => {
  'use strict';

  const TRUST_NOTICE_KEY = 'prive-trust-notice-seen-v1';
  const ENTRY_MODE_KEY = 'prive-entry-mode-v1';
  const ROOT_PATHS = new Set(['/', '/index.html']);

  const CURATED_BOTTLES = [
    { src: '/IMAGES/Caballero/CP02515.avif', alt: 'VALENTINO VALENTINO UOMO BORN IN ROMA INTENSE' },
    { src: '/IMAGES/Caballero/CP01021.avif', alt: 'PACO RABANNE 1 MILLION' },
    { src: '/IMAGES/Caballero/CP01092.avif', alt: 'PACO RABANNE INVICTUS' },
    { src: '/IMAGES/Caballero/CP02498.avif', alt: 'LOUIS VUITTON IMAGINATION' },
    { src: '/IMAGES/Caballero/CP02158.avif', alt: 'DIOR SAUVAGE' },
    { src: '/IMAGES/Caballero/CP02341.avif', alt: 'DIOR SAUVAGE ELIXIR' },
    { src: '/IMAGES/Caballero/CP01059.avif', alt: 'CHANEL BLEU DE CHANEL EAU DE PARFUM' },
    { src: '/IMAGES/Caballero/CP00719.avif', alt: 'CHANEL ALLURE HOMME SPORT' },
    { src: '/IMAGES/Caballero/CP00879.avif', alt: 'JEAN PAUL GAULTIER LE MALE' },
    { src: '/IMAGES/Caballero/CP02475.avif', alt: 'JEAN PAUL GAULTIER LE MALE ELIXIR' },
    { src: '/IMAGES/Caballero/CP02345.avif', alt: 'JEAN PAUL GAULTIER LE MALE LE PARFUM' },
    { src: '/IMAGES/Caballero/CP02148.avif', alt: 'JEAN PAUL GAULTIER ULTRA MALE' },
    { src: '/IMAGES/Caballero/CP02319.avif', alt: 'JEAN PAUL GAULTIER LE BEAU' },
    { src: '/IMAGES/Caballero/CP02509.avif', alt: 'JEAN PAUL GAULTIER LE BEAU PARADISE GARDEN' },
    { src: '/IMAGES/Caballero/CP02513.avif', alt: 'VALENTINO VALENTINO UOMO BORN IN ROMA' },
    { src: '/IMAGES/Caballero/CP02253.avif', alt: 'CAROLINA HERRERA 212 VIP BLACK' },
    { src: '/IMAGES/Caballero/CP02266.avif', alt: 'CAROLINA HERRERA BAD BOY' },
    { src: '/IMAGES/Caballero/CP02404.avif', alt: 'CAROLINA HERRERA BAD BOY EXTREME' },
    { src: '/IMAGES/Caballero/CP01086.avif', alt: 'VERSACE EROS' },
    { src: '/IMAGES/Caballero/CP02372.avif', alt: 'VERSACE EROS FLAME' },
    { src: '/IMAGES/Caballero/CP02187.avif', alt: 'VERSACE VERSACE POUR HOMME DYLAN BLUE' },
    { src: '/IMAGES/Caballero/CP00881.avif', alt: 'DOLCE & GABBANA LIGHT BLUE POUR HOMME' },
    { src: '/IMAGES/Caballero/CP01031.avif', alt: 'DOLCE & GABBANA THE ONE FOR MEN' },
    { src: '/IMAGES/Caballero/CP02269.avif', alt: 'CREED AVENTUS' },
    { src: '/IMAGES/Caballero/CP02471.avif', alt: 'CREED ABSOLU AVENTUS 2023' },
    { src: '/IMAGES/Caballero/CP02263.avif', alt: 'MONTBLANC EXPLORER' },
    { src: '/IMAGES/Caballero/CP02365.avif', alt: 'ARMANI EMPORIO ARMANI STRONGER WITH YOU' },
    { src: '/IMAGES/Caballero/CP00725.avif', alt: 'ARMANI ACQUA DI GIO' },
    { src: '/IMAGES/Caballero/CP02393.avif', alt: 'ARMANI ARMANI CODE PARFUM' },
    { src: '/IMAGES/Caballero/CP02454.avif', alt: 'YVES SAINT LAURENT MYSLF EAU DE PARFUM' },
    { src: '/IMAGES/Caballero/CP02227.avif', alt: 'YVES SAINT LAURENT YVES SAINT LAURENT Y' },
    { src: '/IMAGES/Caballero/CP02338.avif', alt: 'YVES SAINT LAURENT LA NUIT DE L\'HOMME BLEU ELICTRIQUE' },
    { src: '/IMAGES/Caballero/CP02245.avif', alt: 'PRADA LUNA ROSSA BLACK' },
    { src: '/IMAGES/Caballero/CP02209.avif', alt: 'PRADA LUNA ROSSA CARBON EAU DE TOILETTE' },
    { src: '/IMAGES/Caballero/CP01055.avif', alt: 'GUCCI GUCCI GUILTY POUR HOMME PARFUM' },
    { src: '/IMAGES/Caballero/CP01012.avif', alt: 'BURBERRY HERO' },
    { src: '/IMAGES/Caballero/CP02289.avif', alt: 'DIOR DIOR HOMME INTENSE 2011' },
    { src: '/IMAGES/Caballero/CP02307.avif', alt: 'AZZARO WANTED BY NIGHT' },
    { src: '/IMAGES/Caballero/CP00921.avif', alt: 'RALPH LAUREN POLO BLUE' },
    { src: '/IMAGES/Caballero/CP02440.avif', alt: 'HUGO BOSS BOSS BOTTLED ELIXIR' },
    { src: '/IMAGES/Dama/DP02404.avif', alt: 'CAROLINA HERRERA GOOD GIRL' },
    { src: '/IMAGES/Dama/DP02598.avif', alt: 'CAROLINA HERRERA VERY GOOD GIRL' },
    { src: '/IMAGES/Dama/DP02754.avif', alt: 'CAROLINA HERRERA GOOD GIRL BLUSH' },
    { src: '/IMAGES/Dama/DP02324.avif', alt: 'YVES SAINT LAURENT BLACK OPIUM' },
    { src: '/IMAGES/Dama/DP02756.avif', alt: 'YVES SAINT LAURENT BLACK OPIUM LE PARFUM' },
    { src: '/IMAGES/Dama/DP02515.avif', alt: 'YVES SAINT LAURENT LIBRE' },
    { src: '/IMAGES/Dama/DP02695.avif', alt: 'YVES SAINT LAURENT LIBRE LE PARFUM' },
    { src: '/IMAGES/Dama/DP02357.avif', alt: 'DIOR MISS DIOR BLOOMING BOUQUET' },
    { src: '/IMAGES/Dama/DP02523.avif', alt: 'DIOR MISS DIOR EAU DE PARFUM 2021' },
    { src: '/IMAGES/Dama/DP01176.avif', alt: 'DIOR J\'ADORE' },
    { src: '/IMAGES/Dama/DP01054.avif', alt: 'CHANEL CHANCE EAU DE PARFUM' },
    { src: '/IMAGES/Dama/DP02622.avif', alt: 'CHANEL CHANCE EAU TENDRE' },
    { src: '/IMAGES/Dama/DP01057.avif', alt: 'CHANEL CHANEL NO 5 EAU DE PARFUM' },
    { src: '/IMAGES/Dama/DP02495.avif', alt: 'BURBERRY BURBERRY HER' },
    { src: '/IMAGES/Dama/DP02719.avif', alt: 'BURBERRY BURBERRY HER ELIXIR DE PARFUM' },
    { src: '/IMAGES/Dama/DP02789.avif', alt: 'BURBERRY GODDESS' },
    { src: '/IMAGES/Dama/DP02802.avif', alt: 'PRADA PRADA PARADOXE' },
    { src: '/IMAGES/Dama/DP02334.avif', alt: 'VIKTOR&ROLF FLOWERBOMB' },
    { src: '/IMAGES/Dama/DP02261.avif', alt: 'LANCOME LA VIE EST BELLE' },
    { src: '/IMAGES/Dama/DP02658.avif', alt: 'GUCCI GUCCI BLOOM' },
    { src: '/IMAGES/Dama/DP02624.avif', alt: 'GUCCI FLORA GORGEOUS GARDENIA' },
    { src: '/IMAGES/Dama/DP02226.avif', alt: 'VERSACE BRIGHT CRYSTAL' },
    { src: '/IMAGES/Dama/DP02857.avif', alt: 'VERSACE CRYSTAL NOIR PARFUM' },
    { src: '/IMAGES/Dama/DP02792.avif', alt: 'DOLCE & GABBANA DEVOTION' },
    { src: '/IMAGES/Dama/DP01197.avif', alt: 'DOLCE & GABBANA LIGHT BLUE' },
    { src: '/IMAGES/Dama/DP02522.avif', alt: 'ARIANA GRANDE CLOUD' },
    { src: '/IMAGES/Dama/DP02782.avif', alt: 'ARIANA GRANDE CLOUD PINK' },
    { src: '/IMAGES/Dama/DP02331.avif', alt: 'ARIANA GRANDE ARI' },
    { src: '/IMAGES/Dama/DP02632.avif', alt: 'ARIANA GRANDE SWEET LIKE CANDY' },
    { src: '/IMAGES/Dama/DP02524.avif', alt: 'ARIANA GRANDE THANK U, NEXT' },
    { src: '/IMAGES/Dama/DP02693.avif', alt: 'BILLIE EILISH EILISH' },
    { src: '/IMAGES/Dama/DP02333.avif', alt: 'BRITNEY SPEARS FANTASY' },
    { src: '/IMAGES/Dama/DP02791.avif', alt: 'LATTAFA YARA' },
    { src: '/IMAGES/Dama/DP02860.avif', alt: 'LATTAFA YARA CANDY' },
    { src: '/IMAGES/Dama/DP02843.avif', alt: 'PARFUMS DE MARLY DELINA EXCLUSIF' },
    { src: '/IMAGES/Dama/DP02753.avif', alt: 'VALENTINO VALENTINO DONNA BORN IN ROMA' },
    { src: '/IMAGES/Dama/DP02757.avif', alt: 'VALENTINO VALENTINO DONNA BORN IN ROMA INTENSE' },
    { src: '/IMAGES/Dama/DP01013.avif', alt: 'MUGLER ANGEL' },
    { src: '/IMAGES/Dama/DP02572.avif', alt: 'ARMANI MY WAY' },
    { src: '/IMAGES/Dama/DP02269.avif', alt: 'ARMANI SI' },
    { src: '/IMAGES/Unisex/UP01140.avif', alt: 'MAISON FRANCIS KURKDIJAN BACCARAT ROUGE 540 EXTRAIT DE PARFUM' },
    { src: '/IMAGES/Unisex/UP01007.avif', alt: 'TOM FORD LOST CHERRY' },
    { src: '/IMAGES/Unisex/UP01028.avif', alt: 'TOM FORD TOBACCO VANILLE' },
    { src: '/IMAGES/Unisex/UP01047.avif', alt: 'TOM FORD OUD WOOD' },
    { src: '/IMAGES/Unisex/UP01046.avif', alt: 'TOM FORD OMBRÉ LEATHER (2018)' },
    { src: '/IMAGES/Unisex/UP01029.avif', alt: 'TOM FORD SOLEIL BLANC' },
    { src: '/IMAGES/Unisex/UP01067.avif', alt: 'TOM FORD BITTER PEACH' },
    { src: '/IMAGES/Unisex/UP01042.avif', alt: 'BY KILIAN ANGEL\'S SHARE' },
    { src: '/IMAGES/Unisex/UP01018.avif', alt: 'BY KILIAN BLACK PHANTOM' },
    { src: '/IMAGES/Unisex/UP01095.avif', alt: 'LATAFFA KHAMRAH' },
    { src: '/IMAGES/Unisex/UP01111.avif', alt: 'LATAFFA KHAMRAH QAHWA' },
    { src: '/IMAGES/Unisex/UP01000.avif', alt: 'LELABO SANTAL 33' },
    { src: '/IMAGES/Unisex/UP01002.avif', alt: 'CALVIN KLEIN CK ONE' },
    { src: '/IMAGES/Unisex/UP01090.avif', alt: 'LOUIS VUITTON OMBRE NOMADE' },
    { src: '/IMAGES/Unisex/UP01099.avif', alt: 'LOUIS VUITTON PACIFIC CHILL' },
    { src: '/IMAGES/Unisex/UP01081.avif', alt: 'PARFUMS DE MARLY LAYTON EXCLUSIF' },
    { src: '/IMAGES/Unisex/UP01129.avif', alt: 'XERJOFF ERBA PURA' },
    { src: '/IMAGES/Unisex/UP01147.avif', alt: 'XERJOFF ACCENTO' },
    { src: '/IMAGES/Unisex/UP01092.avif', alt: 'AL HARAMAIN AMBER OUD GOLD EDITION' },
    { src: '/IMAGES/Unisex/UP01097.avif', alt: 'KAYALI LOVEFEST BURNING CHERRY' },
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

  const SLOT_COUNT = 10;
  const recentBySlot = new Map();

  const bottleMarkup = () => Array.from({ length: SLOT_COUNT }, (_, index) => `
    <span class="prive-bottle-slot s${index + 1}" data-bottle-slot="${index}">
      <img
        class="prive-gate-bottle"
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchpriority="low"
      >
    </span>`).join('');

  const shuffled = values => {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const startBottleRotation = gate => {
    const slots = [...gate.querySelectorAll('[data-bottle-slot]')];
    if (!slots.length) return;

    const initial = shuffled(CURATED_BOTTLES).slice(0, slots.length);
    const activeSources = new Set(initial.map(item => item.src));

    const assign = (slot, item, immediate = false) => {
      const img = slot.querySelector('.prive-gate-bottle');
      if (!img) return;

      const previous = img.dataset.src || '';
      if (previous) activeSources.delete(previous);

      img.dataset.src = item.src;
      img.src = item.src;
      img.title = item.alt;
      activeSources.add(item.src);

      if (immediate) img.classList.add('is-visible');
      else requestAnimationFrame(() => img.classList.add('is-visible'));
    };

    slots.forEach((slot, index) => {
      assign(slot, initial[index], true);
      recentBySlot.set(index, [initial[index].src]);
    });

    const rotateSlot = (slot, index) => {
      const img = slot.querySelector('.prive-gate-bottle');
      if (!img) return;

      const recent = recentBySlot.get(index) || [];
      const candidates = CURATED_BOTTLES.filter(item =>
        !activeSources.has(item.src) && !recent.includes(item.src)
      );
      const fallback = CURATED_BOTTLES.filter(item => !activeSources.has(item.src));
      const source = candidates.length ? candidates : fallback;
      if (!source.length) return;

      const next = source[Math.floor(Math.random() * source.length)];
      img.classList.remove('is-visible');

      window.setTimeout(() => {
        assign(slot, next);
        recentBySlot.set(index, [next.src, ...recent].slice(0, 7));
      }, 1200);
    };

    slots.forEach((slot, index) => {
      const firstDelay = 13000 + Math.random() * 8000 + index * 380;

      const schedule = () => {
        const interval = 21000 + Math.random() * 11000;
        window.setTimeout(() => {
          if (!document.body.contains(gate)) return;
          rotateSlot(slot, index);
          schedule();
        }, interval);
      };

      window.setTimeout(() => {
        if (!document.body.contains(gate)) return;
        rotateSlot(slot, index);
        schedule();
      }, firstDelay);
    });
  };

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
    window.setTimeout(() => startBottleRotation(gate), 30);
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
