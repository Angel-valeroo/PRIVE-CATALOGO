import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
});

const clean = (v: unknown) => String(v ?? "").trim().replace(/\s+/g, " ");
const nullable = (v: unknown) => clean(v) || null;
const allowedRoles = new Set(["admin", "distributor", "reseller"]);
const allowedStatuses = new Set(["active", "inactive"]);

function fail(message: string, status = 400) {
  throw Object.assign(new Error(message), { status });
}

function requireUuid(value: unknown, label = "usuario") {
  const v = clean(value);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) {
    fail(`ID de ${label} inválido`);
  }
  return v;
}

function normalizeEmail(value: unknown) {
  const email = clean(value).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Correo inválido");
  return email;
}

function normalizeRole(value: unknown) {
  const role = clean(value).toLowerCase();
  if (!allowedRoles.has(role)) fail("Rol inválido");
  return role;
}

function normalizeStatus(value: unknown) {
  const status = clean(value).toLowerCase();
  if (!allowedStatuses.has(status)) fail("Estado inválido");
  return status;
}

async function context(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) fail("Falta sesión de administrador", 401);
  const token = authHeader.slice(7).trim();

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !service) fail("Faltan variables de entorno de Supabase", 500);

  const callerClient = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await callerClient.auth.getUser(token);
  const caller = userData?.user;
  if (userError || !caller) fail("Sesión inválida o expirada", 401);

  const { data: profile, error: profileError } = await callerClient
    .from("profiles")
    .select("id,role,status")
    .eq("id", caller.id)
    .single();
  if (profileError || !profile || profile.role !== "admin" || profile.status !== "active") {
    fail("Acceso exclusivo para administrador activo", 403);
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return { caller, admin };
}

async function validateParent(admin: any, parentId: unknown, role: string) {
  const raw = clean(parentId);
  if (!raw || role !== "reseller") return null;
  const id = requireUuid(raw, "distribuidor");
  const { data, error } = await admin.from("profiles").select("id,role,status").eq("id", id).single();
  if (error || !data || data.role !== "distributor") fail("El distribuidor asignado no es válido");
  return id;
}

async function listUsers(admin: any) {
  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id,full_name,alias,role,status,parent_distributor_id,phone,instagram_url,city,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (profileError) fail(profileError.message, 500);

  const authMap = new Map<string, any>();
  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) fail(error.message, 500);
    for (const user of data?.users ?? []) authMap.set(user.id, user);
    if ((data?.users?.length ?? 0) < 100) break;
    page += 1;
  }

  return (profiles ?? []).map((p: any) => {
    const au = authMap.get(p.id);
    return {
      ...p,
      email: au?.email ?? null,
      auth_created_at: au?.created_at ?? null,
      last_sign_in_at: au?.last_sign_in_at ?? null,
    };
  });
}

async function createUser(admin: any, input: any) {
  const email = normalizeEmail(input?.email);
  const password = String(input?.password ?? "");
  if (password.length < 8) fail("La contraseña temporal debe tener al menos 8 caracteres");
  const fullName = clean(input?.full_name);
  if (!fullName) fail("Ingresa el nombre completo");
  const alias = nullable(input?.alias);
  const role = normalizeRole(input?.role);
  const status = normalizeStatus(input?.status ?? "active");
  const parent = await validateParent(admin, input?.parent_distributor_id, role);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, alias: alias ?? undefined },
  });
  if (createError || !created?.user) fail(createError?.message || "No se pudo crear la cuenta", 400);

  const uid = created.user.id;
  const profile = {
    id: uid,
    full_name: fullName,
    alias,
    role,
    status,
    parent_distributor_id: parent,
    phone: nullable(input?.phone),
    instagram_url: nullable(input?.instagram_url),
    city: nullable(input?.city),
  };

  const { error: profileError } = await admin.from("profiles").insert(profile);
  if (profileError) {
    await admin.auth.admin.deleteUser(uid).catch(() => null);
    fail(`La cuenta Auth se revirtió porque el perfil no pudo guardarse: ${profileError.message}`, 500);
  }
  return { id: uid, email, ...profile };
}

async function updateUser(admin: any, callerId: string, input: any) {
  const id = requireUuid(input?.id);
  const { data: current, error: currentError } = await admin
    .from("profiles")
    .select("id,role,status")
    .eq("id", id)
    .single();
  if (currentError || !current) fail("Usuario no encontrado", 404);

  const fullName = clean(input?.full_name);
  if (!fullName) fail("Ingresa el nombre completo");
  const role = normalizeRole(input?.role);
  const status = normalizeStatus(input?.status);
  if (id === callerId && (role !== "admin" || status !== "active")) {
    fail("No puedes quitarte tu propio acceso administrativo", 409);
  }
  const parent = await validateParent(admin, input?.parent_distributor_id, role);
  const email = normalizeEmail(input?.email);

  const { data: authData, error: authLookupError } = await admin.auth.admin.getUserById(id);
  if (authLookupError || !authData?.user) fail("No se encontró la cuenta de autenticación", 404);

  const oldEmail = String(authData.user.email ?? "").toLowerCase();
  if (email !== oldEmail) {
    const { error: emailError } = await admin.auth.admin.updateUserById(id, { email, email_confirm: true });
    if (emailError) fail(emailError.message, 400);
  }

  const changes = {
    full_name: fullName,
    alias: nullable(input?.alias),
    role,
    status,
    parent_distributor_id: parent,
    phone: nullable(input?.phone),
    instagram_url: nullable(input?.instagram_url),
    city: nullable(input?.city),
    updated_at: new Date().toISOString(),
  };
  const { error: updateError } = await admin.from("profiles").update(changes).eq("id", id);
  if (updateError) {
    if (email !== oldEmail) await admin.auth.admin.updateUserById(id, { email: oldEmail, email_confirm: true }).catch(() => null);
    fail(updateError.message, 500);
  }
  return { id, email, ...changes };
}

async function resetPassword(admin: any, input: any) {
  const id = requireUuid(input?.id);
  const password = String(input?.password ?? "");
  if (password.length < 8) fail("La nueva contraseña debe tener al menos 8 caracteres");
  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) fail(error.message, 400);
  return { success: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  try {
    const { caller, admin } = await context(req);
    const body = await req.json().catch(() => ({}));
    const action = clean(body?.action).toLowerCase();
    let result: unknown;
    if (action === "list") result = await listUsers(admin);
    else if (action === "create") result = await createUser(admin, body);
    else if (action === "update") result = await updateUser(admin, caller.id, body);
    else if (action === "reset_password") result = await resetPassword(admin, body);
    else fail("Acción no válida");
    return json({ success: true, data: result });
  } catch (error) {
    console.error("admin-users:", error);
    const status = Number((error as any)?.status ?? 400);
    return json({ error: error instanceof Error ? error.message : String(error) }, status);
  }
});
