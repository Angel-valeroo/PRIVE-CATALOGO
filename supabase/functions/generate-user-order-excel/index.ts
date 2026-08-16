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
    const { supabase } = await userClient(req);
    const { order_id } = await req.json();
    if (!order_id) return json({ error: "Falta order_id" }, 400);

    const { data: rows, error } = await supabase.rpc("get_confirmed_order_report", { p_order_id: order_id });
    if (error) throw error;
    if (!rows?.length) return json({ error: "Pedido no encontrado, no confirmado o sin permiso" }, 404);

    const first=rows[0];
    const generatedAt = new Intl.DateTimeFormat("es-MX", {
      timeZone:"America/Mexico_City",year:"numeric",month:"2-digit",day:"2-digit"
    }).format(new Date());
    const totalPerfumes=rows.reduce((s:any,r:any)=>s+Number(r.quantity||0),0);
    const totalSamples=rows.reduce((s:any,r:any)=>s+Number(r.sample_quantity||0),0);

    const data:any[][]=[
      ["PRIVÉ","","","","",""],
      ["PEDIDO INDIVIDUAL CONFIRMADO","","","","",""],
      [],
      ["Folio",first.folio??"","","","",""],
      ["Revendedor",first.user_alias||first.user_name||"","","","",""],
      ["Corte",first.cycle_name??"","","","",""],
      ["Fecha de generación",generatedAt,"","","",""],
      [],
      ["Cantidad","Perfume","Clave","Presentación","Muestras 10 ml","Nota / Cliente"]
    ];
    for(const r of rows) data.push([
      Number(r.quantity||0),r.perfume_name??"",r.perfume_code??"",
      presentationLabel(r.presentation)||"—",Number(r.sample_quantity||0),r.customer_note??""
    ]);
    data.push([]);
    data.push([`Total de perfumes: ${totalPerfumes}`,"","",`Total de muestras: ${totalSamples}`,"",""]);

    const ws=XLSX.utils.aoa_to_sheet(data);
    ws["!cols"]=[{wch:14},{wch:42},{wch:20},{wch:20},{wch:18},{wch:36}];
    ws["!merges"]=[
      XLSX.utils.decode_range("A1:F1"),XLSX.utils.decode_range("A2:F2"),
      XLSX.utils.decode_range("B4:F4"),XLSX.utils.decode_range("B5:F5"),
      XLSX.utils.decode_range("B6:F6"),XLSX.utils.decode_range("B7:F7")
    ];
    const dark="17181C",gold="C9A458",white="FFFFFF",light="F4F1EA",border="D9D4CA";
    const centered={horizontal:"center",vertical:"center",wrapText:true};
    for(let c=0;c<6;c++) for(let r=0;r<2;r++){
      const a=XLSX.utils.encode_cell({r,c}); if(!ws[a]) ws[a]={t:"s",v:""};
      ws[a].s={fill:{fgColor:{rgb:dark}},alignment:centered};
    }
    ws["A1"].s={font:{bold:true,color:{rgb:gold},sz:22},fill:{fgColor:{rgb:dark}},alignment:centered};
    ws["A2"].s={font:{bold:true,color:{rgb:white},sz:15},fill:{fgColor:{rgb:dark}},alignment:centered};
    for(let r=3;r<=6;r++){
      const a=XLSX.utils.encode_cell({r,c:0});
      ws[a].s={font:{bold:true,color:{rgb:white},sz:12},fill:{fgColor:{rgb:dark}},alignment:centered};
      for(let c=1;c<6;c++){
        const b=XLSX.utils.encode_cell({r,c}); if(!ws[b]) ws[b]={t:"s",v:""};
        ws[b].s={font:{color:{rgb:dark},sz:12},fill:{fgColor:{rgb:light}},alignment:centered};
      }
    }
    for(let c=0;c<6;c++){
      const a=XLSX.utils.encode_cell({r:8,c});
      if(ws[a]) ws[a].s={font:{bold:true,color:{rgb:white},sz:12},fill:{fgColor:{rgb:dark}},alignment:centered};
    }
    const range=XLSX.utils.decode_range(ws["!ref"]||"A1:A1");
    for(let r=9;r<=range.e.r;r++) for(let c=0;c<6;c++){
      const a=XLSX.utils.encode_cell({r,c}); if(!ws[a]) continue;
      ws[a].s={font:{bold:r===range.e.r,color:{rgb:dark},sz:12},
        fill:{fgColor:{rgb:r===range.e.r?light:"FFFFFF"}},alignment:centered,
        border:{bottom:{style:"thin",color:{rgb:border}}}};
    }
    ws["!pageSetup"]={orientation:"landscape",fitToWidth:1,fitToHeight:0};

    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,"Pedido");
    const buffer=XLSX.write(wb,{bookType:"xlsx",type:"array"});
    return new Response(buffer,{
      status:200,
      headers:{...corsHeaders,
        "Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":'attachment; filename="PRIVE-PEDIDO-INDIVIDUAL.xlsx"'}
    });
  } catch(error) {
    console.error(error);
    return json({error:"No se pudo generar el Excel individual",detail:error instanceof Error?error.message:String(error)},500);
  }
});
