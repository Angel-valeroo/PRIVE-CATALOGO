const SUPABASE_URL="https://uqjrotqqquorsagwiara.supabase.co";
const SUPABASE_KEY="sb_publishable_KV6_5XskGXe8mCg-6vfkiA_vNMKDZNP";
const state={rows:[],scope:"Todos"};
const $=s=>document.querySelector(s);
const grid=$("#topGrid"),tabs=$("#topTabs"),month=$("#topMonth");

function resolveImageUrl(value){
  const raw=String(value||"").trim();
  if(!raw)return "";
  if(/^https?:\/\//i.test(raw))return raw;
  return new URL(`../${raw.replace(/^\/+/,"")}`,window.location.href).href;
}

function monthLabel(value){
  const date=value?new Date(`${value}T12:00:00`):new Date();
  const text=new Intl.DateTimeFormat("es-MX",{month:"long",year:"numeric"}).format(date);
  return text.charAt(0).toUpperCase()+text.slice(1);
}
function rows(){
  return state.rows.filter(row=>row.scope===state.scope).sort((a,b)=>a.rank-b.rank);
}
function render(){
  const list=rows();
  grid.replaceChildren();
  if(!list.length){
    const p=document.createElement("p");
    p.className="top-empty";
    p.textContent=`Aún no hay suficientes pedidos confirmados de ${state.scope==="Todos"?"este mes":state.scope} para mostrar un ranking.`;
    grid.appendChild(p);
    return;
  }
  list.forEach(row=>{
    const card=document.createElement("a");
    card.className=`top-card rank-${row.rank}`;
    card.href=`/?entry=catalog#perfume=${encodeURIComponent(row.perfume_id)}`;
    card.innerHTML=`
      <span class="top-rank">${row.rank}</span>
      <span class="top-image">${resolveImageUrl(row.image_url)?`<img src="${resolveImageUrl(row.image_url)}" alt="" loading="lazy" decoding="async">`:""}</span>
      <span class="top-copy"><small>${row.designer||"PRIVÉ"}</small><strong>${row.perfume_name||""}</strong><em>${row.category||""}</em></span>
      <span class="top-arrow" aria-hidden="true">→</span>`;
    grid.appendChild(card);
  });
}
async function load(){
  try{
    const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_monthly_bestsellers`,{
      method:"POST",
      headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({p_month:new Date().toISOString().slice(0,10)})
    });
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    state.rows=await response.json();
    month.textContent=state.rows[0]?.month_start?monthLabel(state.rows[0].month_start):monthLabel();
    render();
  }catch(error){
    console.error(error);
    grid.innerHTML='<p class="top-error">No pudimos cargar el ranking. Intenta actualizar la página.</p>';
    month.textContent=monthLabel();
  }
}
tabs.addEventListener("click",event=>{
  const button=event.target.closest("[data-scope]");
  if(!button)return;
  state.scope=button.dataset.scope||"Todos";
  [...tabs.querySelectorAll("[data-scope]")].forEach(item=>{
    const active=item===button;
    item.classList.toggle("is-active",active);
    item.setAttribute("aria-selected",String(active));
  });
  const url=new URL(location.href);
  if(state.scope==="Todos")url.searchParams.delete("scope");else url.searchParams.set("scope",state.scope);
  history.replaceState(null,"",url);
  render();
});
const requested=new URL(location.href).searchParams.get("scope");
if(["Todos","Caballero","Dama","Unisex"].includes(requested)){
  state.scope=requested;
  [...tabs.querySelectorAll("[data-scope]")].forEach(item=>{
    const active=item.dataset.scope===requested;
    item.classList.toggle("is-active",active);
    item.setAttribute("aria-selected",String(active));
  });
}
history.scrollRestoration="manual";
window.scrollTo({top:0,left:0,behavior:"auto"});
window.addEventListener("pageshow",event=>{
  if(event.persisted){
    location.reload();
    return;
  }
  window.scrollTo({top:0,left:0,behavior:"auto"});
});
load();