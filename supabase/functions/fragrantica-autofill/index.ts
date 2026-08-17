import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

const clean = (value: unknown) =>
  String(value ?? "").trim().replace(/\s+/g, " ");

const upper = (value: unknown) =>
  clean(value).toLocaleUpperCase("es-MX");

function decodeHtml(value: string) {
  return String(value ?? "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .trim();
}

function slugToText(value: string) {
  return decodeURIComponent(value)
    .replace(/\.html?$/i, "")
    .replace(/-\d+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFromUrl(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean);
  const index = parts.findIndex(part => part.toLowerCase() === "perfume");

  if (
    index < 0 ||
    !parts[index + 1] ||
    !parts[index + 2]
  ) {
    return {
      designer: "",
      name: "",
      perfumeId: "",
    };
  }

  const filePart = parts[index + 2];
  const idMatch = filePart.match(/-(\d+)\.html?$/i);

  return {
    designer: slugToText(parts[index + 1]),
    name: slugToText(filePart),
    perfumeId: idMatch?.[1] ?? "",
  };
}

function validateFragranticaUrl(raw: unknown) {
  const rawValue = clean(raw);
  if (!rawValue) throw new Error("Pega una URL de Fragrantica");

  let url: URL;
  try {
    url = new URL(rawValue);
  } catch {
    throw new Error("La URL de Fragrantica no es válida");
  }

  if (!/^https?:$/.test(url.protocol)) {
    throw new Error("La URL debe usar HTTP o HTTPS");
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (
    host !== "fragrantica.com" &&
    host !== "fragrantica.es"
  ) {
    throw new Error("La URL debe pertenecer a Fragrantica");
  }

  if (!url.pathname.toLowerCase().includes("/perfume/")) {
    throw new Error("La URL debe ser la ficha de un perfume");
  }

  return url;
}

function parseAttributes(tag: string) {
  const result: Record<string, string> = {};
  const rx =
    /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;

  let match;

  while ((match = rx.exec(tag)) !== null) {
    result[String(match[1]).toLowerCase()] =
      decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }

  return result;
}

function getMeta(html: string, key: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = parseAttributes(tag);
    const property = String(
      attrs.property ?? attrs.name ?? "",
    ).toLowerCase();

    if (
      property === key.toLowerCase() &&
      attrs.content
    ) {
      return clean(attrs.content);
    }
  }

  return "";
}

function imageCandidatesFromHtml(
  html: string,
  sourceUrl: URL,
  perfumeId: string,
  perfumeName: string,
) {
  const candidates = new Map<string, number>();
  const normalizedName = upper(perfumeName);

  const addCandidate = (
    raw: string,
    baseScore: number,
    alt = "",
    widthHint = 0,
  ) => {
    if (!raw) return;
    let resolved = "";
    try {
      resolved = new URL(raw, sourceUrl).toString();
    } catch {
      return;
    }
    if (!/^https?:/i.test(resolved)) return;

    const haystack = `${resolved} ${alt}`;
    let score = baseScore;

    if (perfumeId && resolved.includes(`.${perfumeId}.`)) score += 120;
    if (/mdimg\/perfume\//i.test(resolved)) score += 45;
    if (/perfumes\//i.test(resolved)) score += 30;

    // La miniatura 375x500 fue útil como fallback en V4/V5, pero era la causa
    // principal de la menor definición frente a las imágenes descargadas
    // manualmente. En V6 se conserva solo como respaldo.
    if (/perfume-thumbs|375x500/i.test(resolved)) score -= 85;

    if (
      normalizedName &&
      alt &&
      normalizedName
        .split(/\s+/)
        .filter(Boolean)
        .every(token => alt.includes(token))
    ) {
      score += 35;
    }

    if (/logo|brand|designer|avatar|banner|accord/i.test(haystack)) score -= 100;

    // srcset suele declarar la variante de mayor resolución mediante "w".
    if (widthHint >= 1200) score += 90;
    else if (widthHint >= 800) score += 65;
    else if (widthHint >= 600) score += 40;
    else if (widthHint >= 400) score += 15;

    const previous = candidates.get(resolved) ?? -Infinity;
    if (score > previous) candidates.set(resolved, score);
  };

  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    const attrs = parseAttributes(tag);
    const alt = upper(attrs.alt ?? attrs.title ?? "");

    const raw =
      attrs["data-src"] ??
      attrs["data-original"] ??
      attrs.src ??
      "";

    const attrWidth = Number.parseInt(attrs.width ?? "0", 10) || 0;
    addCandidate(raw, 0, alt, attrWidth);

    // Preferir la variante de mayor tamaño declarada por la página.
    const srcset = attrs["data-srcset"] ?? attrs.srcset ?? "";
    for (const part of srcset.split(",")) {
      const item = part.trim();
      if (!item) continue;
      const match = item.match(/^(\S+)(?:\s+(\d+)w|\s+([\d.]+)x)?$/);
      if (!match) continue;
      const widthHint = Number.parseInt(match[2] ?? "0", 10) || 0;
      const density = Number.parseFloat(match[3] ?? "0") || 0;
      addCandidate(match[1], density >= 2 ? 55 : 25, alt, widthHint);
    }
  }

  return [...candidates.entries()]
    .filter(([, score]) => score > -40)
    .sort((a, b) => b[1] - a[1])
    .map(([url]) => url);
}

async function fetchWithTimeout(
  url: string,
  accept: string,
  timeoutMs = 15000,
) {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PRIVE-Catalog/1.0)",
        Accept: accept,
        "Accept-Language":
          "es-MX,es;q=0.9,en;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function getPageData(sourceUrl: URL) {
  const parsed = parseFromUrl(sourceUrl);

  // Regla canónica PRIVÉ:
  // diseñador y nombre vienen de la estructura de la URL.
  // Así evitamos títulos SEO como "... para hombres".
  const designer = parsed.designer;
  const name = parsed.name;

  const imageCandidates: string[] = [];

  // V6: primero buscamos la mejor fuente que realmente publica la ficha.
  // La miniatura 375x500 queda únicamente como fallback, porque priorizarla
  // reducía la calidad respecto a una descarga manual desde Fragrantica.
  let warning = "";

  try {
    const response = await fetchWithTimeout(
      sourceUrl.toString(),
      "text/html,application/xhtml+xml",
    );

    if (response.ok) {
      const html = await response.text();

      for (
        const candidate of imageCandidatesFromHtml(
          html,
          sourceUrl,
          parsed.perfumeId,
          name,
        )
      ) {
        if (!imageCandidates.includes(candidate)) {
          imageCandidates.push(candidate);
        }
      }

      for (const key of ["og:image", "twitter:image"]) {
        const value = getMeta(html, key);
        if (value) {
          try {
            const resolved = new URL(value, sourceUrl).toString();
            if (!imageCandidates.includes(resolved)) {
              imageCandidates.push(resolved);
            }
          } catch {
            // Ignorar metadato inválido.
          }
        }
      }
    } else {
      warning = `Fragrantica respondió HTTP ${response.status}`;
    }
  } catch (error) {
    warning =
      error instanceof Error
        ? error.message
        : String(error);
  }

  // Respaldo seguro por ID: solo se usa si ninguna fuente de mayor calidad
  // de la ficha funciona al descargar.
  if (parsed.perfumeId) {
    const fallback =
      `https://fimgs.net/mdimg/perfume-thumbs/375x500.${parsed.perfumeId}.jpg`;
    if (!imageCandidates.includes(fallback)) imageCandidates.push(fallback);
  }

  return {
    designer,
    name,
    perfumeId: parsed.perfumeId,
    imageCandidates,
    warning,
  };
}

async function fetchFirstValidImage(
  candidates: string[],
) {
  const errors: string[] = [];

  for (const candidate of candidates) {
    try {
      const response = await fetchWithTimeout(
        candidate,
        "image/avif,image/webp,image/png,image/jpeg,image/*",
        18000,
      );

      if (!response.ok) {
        errors.push(`${response.status} ${candidate}`);
        continue;
      }

      const type = String(
        response.headers.get("content-type") ?? "",
      )
        .split(";")[0]
        .trim()
        .toLowerCase();

      if (!type.startsWith("image/")) {
        errors.push(`no-image ${candidate}`);
        continue;
      }

      const bytes = await response.arrayBuffer();

      if (bytes.byteLength > 16 * 1024 * 1024) {
        errors.push(`too-large ${candidate}`);
        continue;
      }

      return {
        bytes,
        type,
        url: candidate,
      };
    } catch (error) {
      errors.push(
        `${
          error instanceof Error
            ? error.message
            : String(error)
        } ${candidate}`,
      );
    }
  }

  throw new Error(
    errors.length
      ? "No se pudo descargar la botella principal. Usa la imagen manual."
      : "No se detectó una botella principal. Usa la imagen manual.",
  );
}

async function validateAdmin(req: Request) {
  const authHeader =
    req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw Object.assign(
      new Error("Falta sesión de usuario"),
      { status: 401 },
    );
  }

  const supabaseUrl =
    Deno.env.get("SUPABASE_URL");

  const supabaseKey =
    Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Faltan variables de entorno de Supabase",
    );
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const token = authHeader
    .replace("Bearer ", "")
    .trim();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    throw Object.assign(
      new Error("Sesión inválida o expirada"),
      { status: 401 },
    );
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin" ||
    profile.status !== "active"
  ) {
    throw Object.assign(
      new Error(
        "Acceso exclusivo para administrador",
      ),
      { status: 403 },
    );
  }
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return json(
        { error: "Método no permitido" },
        405,
      );
    }

    await validateAdmin(req);

    const body = await req.json();
    const sourceUrl = validateFragranticaUrl(
      body?.url,
    );

    const ficha = await getPageData(sourceUrl);

    if (!ficha.name || !ficha.designer) {
      return json(
        {
          error:
            "No se pudieron identificar con seguridad el perfume y el diseñador desde esa URL",
        },
        422,
      );
    }

    if (body?.action === "image") {
      const image = await fetchFirstValidImage(
        ficha.imageCandidates,
      );

      return new Response(image.bytes, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": image.type,
          "X-PRIVE-Image-Source": image.url,
          "Cache-Control": "no-store",
        },
      });
    }

    // Para la vista previa exponemos el mejor candidato.
    // La descarga real se vuelve a validar con action=image.
    const imageUrl =
      ficha.imageCandidates[0] ?? null;

    return json({
      success: true,
      source_url: sourceUrl.toString(),
      source_provider: "fragrantica",
      designer: upper(ficha.designer),
      name: upper(ficha.name),
      image_url: imageUrl,
      image_origin: imageUrl
        ? "fragrantica"
        : null,
      extraction_method: "url_canonical",
      perfume_id: ficha.perfumeId || null,
      warning:
        ficha.warning ||
        (!imageUrl
          ? "No se pudo detectar automáticamente la botella principal. Puedes pegarla o subirla manualmente."
          : null),
    });
  } catch (error) {
    console.error(
      "fragrantica-autofill:",
      error,
    );

    const status = Number(
      (error as any)?.status ?? 400,
    );

    return json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      status,
    );
  }
});
