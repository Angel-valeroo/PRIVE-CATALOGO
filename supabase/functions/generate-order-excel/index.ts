import { createClient } from "npm:@supabase/supabase-js@2";
import XLSX from "npm:xlsx-js-style@1.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function presentationLabel(value: string | null | undefined) {
  if (value === "caballero") return "Caballero";
  if (value === "dama") return "Dama";
  return "";
}

async function userClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Falta sesión de usuario");
  const token = authHeader.replace("Bearer ", "").trim();
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) throw new Error("Faltan variables de entorno de Supabase");
  const supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error("Sesión inválida o expirada");
  return { supabase, user };
}

async function assertActiveAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data || data.role !== "admin" || data.status !== "active") {
    throw new Error("Acceso exclusivo para administrador");
  }
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const { supabase, user } = await userClient(req);
    await assertActiveAdmin(supabase, user.id);
    const { cycle_id } = await req.json();
    if (!cycle_id) return json({ error: "Falta cycle_id" }, 400);

    const [cycleResult, supplierResult, internalResult] = await Promise.all([
      supabase.from("order_cycles").select("name,order_day").eq("id", cycle_id).maybeSingle(),
      supabase.rpc("get_supplier_cycle_report", { p_cycle_id: cycle_id }),
      supabase.rpc("get_cycle_consolidated_report", { p_cycle_id: cycle_id }),
    ]);

    if (cycleResult.error) throw cycleResult.error;
    if (supplierResult.error) throw supplierResult.error;
    if (internalResult.error) throw internalResult.error;

    const cycle = cycleResult.data;
    const supplier = supplierResult.data ?? [];
    const internal = internalResult.data ?? [];
    if (!cycle) throw new Error("Corte no encontrado");

    const generatedAt = new Intl.DateTimeFormat("es-MX", {
      timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit"
    }).format(new Date());

    const makeSheet = (rows: any[][], widths: number[]) => {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = widths.map(wch => ({ wch }));
      ws["!merges"] = [XLSX.utils.decode_range(`A1:${XLSX.utils.encode_col(widths.length - 1)}1`),
                       XLSX.utils.decode_range(`A2:${XLSX.utils.encode_col(widths.length - 1)}2`)];
      const dark = "17181C", gold = "C9A458", white = "FFFFFF", light = "F4F1EA", border = "D9D4CA";
      const centered = { horizontal: "center", vertical: "center", wrapText: true };
      for (let c=0;c<widths.length;c++) {
        for (let r=0;r<2;r++) {
          const a=XLSX.utils.encode_cell({r,c}); if(!ws[a]) ws[a]={t:"s",v:""};
          ws[a].s={fill:{fgColor:{rgb:dark}},alignment:centered};
        }
      }
      ws["A1"].s={font:{bold:true,color:{rgb:gold},sz:22},fill:{fgColor:{rgb:dark}},alignment:centered};
      ws["A2"].s={font:{bold:true,color:{rgb:white},sz:14},fill:{fgColor:{rgb:dark}},alignment:centered};
      const headerRow = 6;
      for (let c=0;c<widths.length;c++) {
        const a=XLSX.utils.encode_cell({r:headerRow,c});
        if(ws[a]) ws[a].s={font:{bold:true,color:{rgb:white},sz:11},fill:{fgColor:{rgb:dark}},alignment:centered};
      }
      const range=XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
      for(let r=headerRow+1;r<=range.e.r;r++) for(let c=0;c<widths.length;c++) {
        const a=XLSX.utils.encode_cell({r,c}); if(!ws[a]) continue;
        ws[a].s={...(ws[a].s||{}),font:{...(ws[a].s?.font||{}),sz:11,color:{rgb:dark}},
          fill:{fgColor:{rgb:r%2===0?"FFFFFF":light}},alignment:centered,
          border:{bottom:{style:"thin",color:{rgb:border}}}};
      }
      ws["!pageSetup"]={orientation:"landscape",fitToWidth:1,fitToHeight:0};
      return ws;
    };

    const supplierRows:any[][] = [
      ["PRIVÉ","","","",""],
      ["PEDIDO CONSOLIDADO PARA PROVEEDOR","","","",""],
      [],
      ["Corte", cycle.name ?? "", "", "", ""],
      ["Fecha de pedido", cycle.order_day ?? "", "", "", ""],
      ["Generado", generatedAt, "", "", ""],
      ["Cantidad","Perfume","Clave","Presentación","Muestras 10 ml"],
    ];
    for (const row of supplier) supplierRows.push([
      Number(row.total_quantity ?? 0), row.perfume_name ?? "", row.perfume_code ?? "",
      presentationLabel(row.presentation) || "—", Number(row.total_samples ?? 0)
    ]);

    const internalRows:any[][] = [
      ["PRIVÉ","","","","",""],
      ["CONSOLIDADO INTERNO PRIVÉ","","","","",""],
      [],
      ["Corte", cycle.name ?? "", "", "", "", ""],
      ["Fecha de pedido", cycle.order_day ?? "", "", "", "", ""],
      ["Generado", generatedAt, "", "", "", "", ""],
      ["Cantidad","Perfume","Clave","Presentación","Muestras 10 ml","Desglose por usuario"],
    ];
    for (const row of internal) internalRows.push([
      Number(row.total_quantity ?? 0), row.perfume_name ?? "", row.perfume_code ?? "",
      presentationLabel(row.presentation) || "—", Number(row.total_samples ?? 0), row.internal_breakdown ?? ""
    ]);

    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, makeSheet(supplierRows,[14,42,20,20,18]), "Proveedor");
    XLSX.utils.book_append_sheet(wb, makeSheet(internalRows,[14,38,20,20,18,48]), "Interno PRIVE");
    const buffer=XLSX.write(wb,{bookType:"xlsx",type:"array"});
    return new Response(buffer, {
      status:200,
      headers:{...corsHeaders,
        "Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":'attachment; filename="PRIVE-PEDIDO-PROVEEDOR.xlsx"'}
    });
  } catch (error) {
    console.error(error);
    return json({ error:"No se pudo generar el Excel del proveedor", detail:error instanceof Error?error.message:String(error) },500);
  }
});
