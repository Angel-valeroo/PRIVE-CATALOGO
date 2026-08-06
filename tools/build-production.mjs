import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const SITE = 'https://www.perfumeriaprive.com';
const TODAY = new Date().toISOString().slice(0, 10);

const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const unique = values => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];

await import(pathToFileURL(path.join(root, 'core-adapter.js')).href + `?v=${Date.now()}`);
const adapter = globalThis.PriveCoreAdapter;
if (!adapter) throw new Error('No fue posible cargar PriveCoreAdapter.');

const legacy = await readJson(path.join(root, 'data', 'perfumes.json'));
const manifest = await readJson(path.join(root, 'data', 'core', 'catalog.json'));
const coreFiles = Array.isArray(manifest.perfumes) ? manifest.perfumes : [];
const core = await Promise.all(coreFiles.map(file => readJson(path.join(root, 'data', 'core', file))));
const merged = adapter.mergeCatalogs(legacy, core);

if (merged.length !== 547) throw new Error(`Se esperaban 547 perfumes y se generaron ${merged.length}.`);
const codes = new Set();
const ids = new Set();
for (const perfume of merged) {
  if (!perfume.code || codes.has(perfume.code)) throw new Error(`Clave inválida/duplicada: ${perfume.code}`);
  if (!perfume.id || ids.has(perfume.id)) throw new Error(`ID inválido/duplicado: ${perfume.id}`);
  codes.add(perfume.code); ids.add(perfume.id);
}

await fs.writeFile(path.join(root, 'data', 'prive-catalog.json'), JSON.stringify(merged), 'utf8');

const byCode = new Map(merged.map(item => [item.code, item]));
const perfumeEntries = [];
for (const file of coreFiles) {
  const code = file.split('-')[0].toUpperCase();
  const perfume = byCode.get(code);
  if (!perfume) continue;
  const slug = file.replace(/\.json$/i, '');
  perfumeEntries.push({ slug, perfume });
}

const perfumesDir = path.join(root, 'perfumes');
await fs.rm(perfumesDir, { recursive: true, force: true });
await fs.mkdir(perfumesDir, { recursive: true });

const pageCss = `:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#07090d;color:#f5f2eb;font-family:Inter,Arial,sans-serif;min-height:100vh}main{width:min(760px,calc(100% - 36px));margin:auto;padding:64px 0 80px}.brand{color:#d8c79f;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase}.back{display:inline-block;margin-bottom:42px;color:#d8c79f;text-decoration:none}h1{margin:10px 0 6px;font-family:Georgia,serif;font-size:clamp(2.2rem,8vw,4.8rem);line-height:1}.designer{color:#c7ae79;letter-spacing:.08em;text-transform:uppercase}.code{color:#9c9a95;font-size:.78rem}.description{font-size:1.03rem;line-height:1.75;color:#d6d2ca}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:32px 0}.panel{padding:18px;border:1px solid #2e2d2a;border-radius:16px;background:#111319}.panel strong{display:block;margin-bottom:9px;color:#d8c79f;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em}.panel p{margin:0;color:#dedad2;line-height:1.6}.cta{display:inline-flex;margin-top:20px;padding:14px 18px;border:1px solid #c7ae79;border-radius:999px;color:#171512;background:#c7ae79;text-decoration:none;font-weight:700}`;

for (const { slug, perfume } of perfumeEntries) {
  const dir = path.join(perfumesDir, slug);
  await fs.mkdir(dir, { recursive: true });
  const canonical = `${SITE}/perfumes/${slug}/`;
  const mainUrl = `${SITE}/#perfume=${encodeURIComponent(perfume.id)}`;
  const description = perfume.description || `${perfume.name} de ${perfume.designer}, referencia disponible en el catálogo de Perfumería PRIVÉ.`;
  const family = perfume.family || 'Perfil en actualización';
  const notes = [...unique(perfume.topNotes), ...unique(perfume.heartNotes), ...unique(perfume.baseNotes)].slice(0, 12);
  const contexts = unique([...(perfume.occasions || []), ...(perfume.climates || []), ...(perfume.styleTags || [])]).slice(0, 10);
  const structured = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: `${perfume.name} de ${perfume.designer} | Perfumería PRIVÉ`,
        description,
        inLanguage: 'es-MX',
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@type': 'Thing', name: perfume.name, identifier: perfume.code }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Perfumería PRIVÉ', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Fragancias', item: `${SITE}/perfumes/` },
          { '@type': 'ListItem', position: 3, name: perfume.name, item: canonical }
        ]
      }
    ]
  };
  const html = `<!doctype html><html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${escapeHtml(perfume.name)} de ${escapeHtml(perfume.designer)} | Perfumería PRIVÉ</title><meta name="description" content="${escapeHtml(description.slice(0, 160))}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:locale" content="es_MX"><meta property="og:site_name" content="Perfumería PRIVÉ"><meta property="og:title" content="${escapeHtml(perfume.name)} de ${escapeHtml(perfume.designer)}"><meta property="og:description" content="${escapeHtml(description.slice(0, 200))}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${SITE}/assets/og-prive.png"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${SITE}/assets/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="${SITE}/assets/apple-touch-icon.png"><script>document.documentElement.classList.add("prive-access-locked")</script><link rel="stylesheet" href="${SITE}/access-gate.css?v=1.0"><script src="${SITE}/access-gate.js?v=1.0" defer></script><style>${pageCss}</style><script type="application/ld+json">${JSON.stringify(structured).replaceAll('<','\\u003c')}</script></head><body><main><a class="back" href="${SITE}/">← Volver a PRIVÉ</a><p class="brand">PERFUMERÍA PRIVÉ · ${escapeHtml(perfume.category)}</p><p class="designer">${escapeHtml(perfume.designer)}</p><h1>${escapeHtml(perfume.name)}</h1><p class="code">CLAVE ${escapeHtml(perfume.code)}</p><p class="description">${escapeHtml(description)}</p><div class="grid"><div class="panel"><strong>Familia olfativa</strong><p>${escapeHtml(family)}</p></div>${notes.length ? `<div class="panel"><strong>Notas</strong><p>${escapeHtml(notes.join(' · '))}</p></div>` : ''}${contexts.length ? `<div class="panel"><strong>Perfil de uso</strong><p>${escapeHtml(contexts.join(' · '))}</p></div>` : ''}</div><a class="cta" href="${mainUrl}">Abrir ficha interactiva en el catálogo →</a></main></body></html>`;
  await fs.writeFile(path.join(dir, 'index.html'), html, 'utf8');
}

const indexItems = perfumeEntries.map(({ slug, perfume }) => `<li><a href="${SITE}/perfumes/${slug}/">${escapeHtml(perfume.name)}</a> <span>${escapeHtml(perfume.designer)} · ${escapeHtml(perfume.code)}</span></li>`).join('');
await fs.writeFile(path.join(perfumesDir, 'index.html'), `<!doctype html><html lang="es-MX"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Índice de fragancias | Perfumería PRIVÉ</title><meta name="description" content="Índice de fragancias del catálogo de Perfumería PRIVÉ."><link rel="canonical" href="${SITE}/perfumes/"><meta name="robots" content="index,follow"><script>document.documentElement.classList.add("prive-access-locked")</script><link rel="stylesheet" href="${SITE}/access-gate.css?v=1.0"><script src="${SITE}/access-gate.js?v=1.0" defer></script><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 20px;color:#1b1b1b}a{color:#5d4321}li{margin:9px 0}span{color:#666;font-size:.86rem}</style></head><body><h1>Índice de fragancias PRIVÉ</h1><p><a href="${SITE}/">Volver al catálogo interactivo</a></p><ol>${indexItems}</ol></body></html>`, 'utf8');

const sitemapUrls = [
  `${SITE}/`,
  `${SITE}/perfumes/`,
  ...perfumeEntries.map(({ slug }) => `${SITE}/perfumes/${slug}/`)
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(url => `  <url><loc>${url}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await fs.writeFile(path.join(root, 'sitemap.xml'), sitemap, 'utf8');
await fs.writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');

console.log(`✅ Producción generada: ${merged.length} perfumes en un solo bundle, ${perfumeEntries.length} páginas SEO y ${sitemapUrls.length} URLs en sitemap.`);
