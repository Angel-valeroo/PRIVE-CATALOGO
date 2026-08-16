import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

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


function wrapText(text: string, font: any, size: number, maxWidth: number) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) current = candidate;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function centerX(text: string, x: number, width: number, font: any, size: number) {
  return x + Math.max(0, (width - font.widthOfTextAtSize(text, size)) / 2);
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  try {
    const { supabase, user } = await userClient(req);
    await assertActiveAdmin(supabase, user.id);
    const { cycle_id } = await req.json();
    if (!cycle_id) return json({ error: "Falta cycle_id" }, 400);

    const [cycleResult, reportResult] = await Promise.all([
      supabase.from("order_cycles").select("name,order_day").eq("id", cycle_id).maybeSingle(),
      supabase.rpc("get_supplier_cycle_report", { p_cycle_id: cycle_id }),
    ]);
    if (cycleResult.error) throw cycleResult.error;
    if (reportResult.error) throw reportResult.error;
    const cycle = cycleResult.data;
    const rows = reportResult.data ?? [];
    if (!cycle) throw new Error("Corte no encontrado");

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const W=792,H=612,margin=36;
    const dark=rgb(23/255,24/255,28/255), gold=rgb(201/255,164/255,88/255),
      white=rgb(1,1,1), light=rgb(244/255,241/255,234/255), border=rgb(217/255,212/255,202/255);
    const widths=[70,250,110,120,100];
    const headers=["Cantidad","Perfume","Clave","Presentación","Muestras"];
    const tableW=widths.reduce((a,b)=>a+b,0), tableX=(W-tableW)/2;
    let page:any, y=0, pageNo=0;

    const drawFooter=()=>{
      page.drawText("Generado automáticamente por el Sistema PRIVÉ.",{x:margin,y:20,size:8,font,color:rgb(.4,.4,.4)});
      const t=`Página ${pageNo}`;
      page.drawText(t,{x:W-margin-font.widthOfTextAtSize(t,8),y:20,size:8,font,color:rgb(.4,.4,.4)});
    };

    const drawHeader=()=>{
      const h=32; let x=tableX;
      for(let i=0;i<headers.length;i++){
        page.drawRectangle({x,y:y-h,width:widths[i],height:h,color:dark,borderColor:white,borderWidth:.4});
        const lines=wrapText(headers[i],bold,9,widths[i]-8);
        let ty=y-h/2+(lines.length*11)/2-9;
        for(const line of lines){
          page.drawText(line,{x:centerX(line,x,widths[i],bold,9),y:ty,size:9,font:bold,color:white});
          ty-=11;
        }
        x+=widths[i];
      }
      y-=h;
    };

    const addPage=()=>{
      if(page) drawFooter();
      page=pdf.addPage([W,H]); pageNo++;
      page.drawRectangle({x:0,y:H-118,width:W,height:118,color:dark});
      page.drawText("PRIVÉ",{x:margin,y:H-52,size:25,font:bold,color:gold});
      page.drawText("PEDIDO CONSOLIDADO PARA PROVEEDOR",{x:margin,y:H-82,size:14,font:bold,color:white});
      page.drawText(cycle.name??"",{x:margin,y:H-104,size:9,font,color:white});
      const dateText=`Fecha de pedido: ${cycle.order_day??""}`;
      page.drawText(dateText,{x:W-margin-font.widthOfTextAtSize(dateText,9),y:H-104,size:9,font,color:white});
      y=H-145; drawHeader();
    };

    addPage();
    for(const row of rows){
      const vals=[
        String(Number(row.total_quantity??0)), String(row.perfume_name??""), String(row.perfume_code??""),
        presentationLabel(row.presentation)||"—", String(Number(row.total_samples??0))
      ];
      const wrapped=vals.map((v,i)=>wrapText(v,font,10,widths[i]-10));
      const maxLines=Math.max(...wrapped.map(x=>x.length));
      const rowH=Math.max(34,maxLines*13+12);
      if(y-rowH<62) addPage();
      let x=tableX;
      for(let i=0;i<wrapped.length;i++){
        page.drawRectangle({x,y:y-rowH,width:widths[i],height:rowH,color:white,borderColor:border,borderWidth:.5});
        let ty=y-rowH/2+(wrapped[i].length*13)/2-10;
        for(const line of wrapped[i]){
          page.drawText(line,{x:centerX(line,x,widths[i],font,10),y:ty,size:10,font,color:dark});
          ty-=13;
        }
        x+=widths[i];
      }
      y-=rowH;
    }

    const totalPerfumes=rows.reduce((s:any,r:any)=>s+Number(r.total_quantity||0),0);
    const totalSamples=rows.reduce((s:any,r:any)=>s+Number(r.total_samples||0),0);
    if(y<105) addPage();
    y-=16;
    page.drawRectangle({x:tableX,y:y-34,width:tableW,height:34,color:light,borderColor:border,borderWidth:.6});
    const totalText=`Total de perfumes: ${totalPerfumes}     ·     Total de muestras: ${totalSamples}`;
    page.drawText(totalText,{x:centerX(totalText,tableX,tableW,bold,11),y:y-21,size:11,font:bold,color:dark});
    drawFooter();

    const pages=pdf.getPages();
    for(let i=0;i<pages.length;i++){
      const p=pages[i], t=`Página ${i+1} de ${pages.length}`;
      p.drawRectangle({x:W-margin-90,y:15,width:90,height:14,color:white});
      p.drawText(t,{x:W-margin-font.widthOfTextAtSize(t,8),y:20,size:8,font,color:rgb(.4,.4,.4)});
    }

    const bytes=await pdf.save();
    return new Response(bytes,{status:200,headers:{...corsHeaders,"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="PRIVE-PEDIDO-PROVEEDOR.pdf"'}});
  } catch(error) {
    console.error(error);
    return json({error:"No se pudo generar el PDF del proveedor",detail:error instanceof Error?error.message:String(error)},500);
  }
});
