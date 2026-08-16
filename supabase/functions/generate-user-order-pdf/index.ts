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
    const { supabase } = await userClient(req);
    const { order_id } = await req.json();
    if (!order_id) return json({ error: "Falta order_id" }, 400);

    const { data: rows, error } = await supabase.rpc("get_confirmed_order_report", { p_order_id: order_id });
    if (error) throw error;
    if (!rows?.length) return json({ error: "Pedido no encontrado, no confirmado o sin permiso" }, 404);

    const first=rows[0];
    const pdf=await PDFDocument.create();
    const font=await pdf.embedFont(StandardFonts.Helvetica);
    const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
    const W=792,H=612,margin=34;
    const dark=rgb(23/255,24/255,28/255),gold=rgb(201/255,164/255,88/255),white=rgb(1,1,1),
      light=rgb(244/255,241/255,234/255),border=rgb(217/255,212/255,202/255);

    const widths=[60,205,95,105,80,175];
    const headers=["Cantidad","Perfume","Clave","Presentación","Muestras","Nota / Cliente"];
    const tableW=widths.reduce((a,b)=>a+b,0),tableX=(W-tableW)/2;
    let page:any,y=0,pageNo=0;

    const generatedAt=new Intl.DateTimeFormat("es-MX",{timeZone:"America/Mexico_City",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

    const footer=()=>{
      page.drawText("Generado automáticamente por el Sistema PRIVÉ.",{x:margin,y:20,size:8,font,color:rgb(.4,.4,.4)});
      const t=`Página ${pageNo}`; page.drawText(t,{x:W-margin-font.widthOfTextAtSize(t,8),y:20,size:8,font,color:rgb(.4,.4,.4)});
    };

    const tableHeader=()=>{
      const h=34;let x=tableX;
      for(let i=0;i<headers.length;i++){
        page.drawRectangle({x,y:y-h,width:widths[i],height:h,color:dark,borderColor:white,borderWidth:.4});
        const lines=wrapText(headers[i],bold,9,widths[i]-8);
        let ty=y-h/2+(lines.length*11)/2-9;
        for(const line of lines){
          page.drawText(line,{x:centerX(line,x,widths[i],bold,9),y:ty,size:9,font:bold,color:white}); ty-=11;
        }
        x+=widths[i];
      }
      y-=h;
    };

    const addPage=(firstPage=false)=>{
      if(page) footer();
      page=pdf.addPage([W,H]);pageNo++;
      page.drawRectangle({x:0,y:H-122,width:W,height:122,color:dark});
      page.drawText("PRIVÉ",{x:margin,y:H-52,size:25,font:bold,color:gold});
      page.drawText("PEDIDO INDIVIDUAL CONFIRMADO",{x:margin,y:H-82,size:14,font:bold,color:white});
      page.drawText(`Folio: ${first.folio??""}`,{x:margin,y:H-104,size:9,font,color:white});
      const date=`Generado: ${generatedAt}`;
      page.drawText(date,{x:W-margin-font.widthOfTextAtSize(date,9),y:H-104,size:9,font,color:white});
      y=H-145;

      if(firstPage){
        const info=[
          ["Revendedor",first.user_alias||first.user_name||""],
          ["Corte",first.cycle_name||""],
          ["Fecha de confirmación", first.confirmed_at ? new Intl.DateTimeFormat("es-MX",{timeZone:"America/Mexico_City",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(new Date(first.confirmed_at)) : ""]
        ];
        for(const [label,value] of info){
          const h=27;
          page.drawRectangle({x:tableX,y:y-h,width:135,height:h,color:dark,borderColor:border,borderWidth:.4});
          page.drawRectangle({x:tableX+135,y:y-h,width:tableW-135,height:h,color:light,borderColor:border,borderWidth:.4});
          page.drawText(label,{x:centerX(label,tableX,135,bold,9),y:y-17,size:9,font:bold,color:white});
          const lines=wrapText(value,font,9,tableW-145);
          page.drawText(lines[0]||"",{x:centerX(lines[0]||"",tableX+135,tableW-135,font,9),y:y-17,size:9,font,color:dark});
          y-=h;
        }
        y-=14;
      }
      tableHeader();
    };

    addPage(true);
    for(const row of rows){
      const vals=[
        String(Number(row.quantity||0)),String(row.perfume_name||""),String(row.perfume_code||""),
        presentationLabel(row.presentation)||"—",String(Number(row.sample_quantity||0)),String(row.customer_note||"")
      ];
      const wrapped=vals.map((v,i)=>wrapText(v,font,9.5,widths[i]-10));
      const maxLines=Math.max(...wrapped.map(a=>a.length));
      const rowH=Math.max(34,maxLines*12+12);
      if(y-rowH<62) addPage(false);
      let x=tableX;
      for(let i=0;i<wrapped.length;i++){
        page.drawRectangle({x,y:y-rowH,width:widths[i],height:rowH,color:white,borderColor:border,borderWidth:.5});
        let ty=y-rowH/2+(wrapped[i].length*12)/2-9;
        for(const line of wrapped[i]){
          page.drawText(line,{x:centerX(line,x,widths[i],font,9.5),y:ty,size:9.5,font,color:dark});ty-=12;
        }
        x+=widths[i];
      }
      y-=rowH;
    }

    const totalPerfumes=rows.reduce((s:any,r:any)=>s+Number(r.quantity||0),0);
    const totalSamples=rows.reduce((s:any,r:any)=>s+Number(r.sample_quantity||0),0);
    if(y<105) addPage(false);
    y-=16;
    page.drawRectangle({x:tableX,y:y-34,width:tableW,height:34,color:light,borderColor:border,borderWidth:.6});
    const total=`Total de perfumes: ${totalPerfumes}     ·     Total de muestras: ${totalSamples}`;
    page.drawText(total,{x:centerX(total,tableX,tableW,bold,11),y:y-21,size:11,font:bold,color:dark});
    footer();

    const pages=pdf.getPages();
    for(let i=0;i<pages.length;i++){
      const p=pages[i],t=`Página ${i+1} de ${pages.length}`;
      p.drawRectangle({x:W-margin-90,y:15,width:90,height:14,color:white});
      p.drawText(t,{x:W-margin-font.widthOfTextAtSize(t,8),y:20,size:8,font,color:rgb(.4,.4,.4)});
    }

    const bytes=await pdf.save();
    return new Response(bytes,{status:200,headers:{...corsHeaders,"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="PRIVE-PEDIDO-INDIVIDUAL.pdf"'}});
  } catch(error) {
    console.error(error);
    return json({error:"No se pudo generar el PDF individual",detail:error instanceof Error?error.message:String(error)},500);
  }
});
