import {readState,selectRecords,productHref} from "./catalog-core.mjs";
const $=id=>document.getElementById(id);
const button=$("ai-invoke"),panel=$("ai-search-panel"),result=$("ai-result"),challenge=$("ai-challenge");
const endpoint=String(window.AI_SEARCH_ENDPOINT||"");
const sitekey=String(window.AI_TURNSTILE_SITE_KEY||"");
if(button&&panel&&result&&challenge&&endpoint.startsWith("https://")&&sitekey){
 let widget=null,scriptLoad=null,pending=false;
 const setStatus=text=>{result.textContent=text;};
 const loadScript=()=>{
  if(window.turnstile)return Promise.resolve(window.turnstile);
  if(scriptLoad)return scriptLoad;
  scriptLoad=new Promise((resolve,reject)=>{
   const s=document.createElement("script");
   s.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
   s.async=true;s.defer=true;
   s.onload=()=>window.turnstile?resolve(window.turnstile):reject(new Error("Turnstile unavailable"));
   s.onerror=()=>reject(new Error("Turnstile unavailable"));
   document.head.appendChild(s);
  });
  return scriptLoad;
 };
 const perform=async token=>{
  if(pending)return;
  const query=$("search")?.value.trim().slice(0,180)||"";
  if(query.length<3){setStatus("Опишите задачу хотя бы тремя символами");return;}
  const records=Array.isArray(window.PORTFOLIO_RECORDS)?window.PORTFOLIO_RECORDS:[];
  const scope=window.PORTFOLIO_SCOPE||"all";
  const state={...readState(window.location.search),q:query,status:"all"};
  const matches=selectRecords(records,state,scope).slice(0,18).map(p=>p.id);
  pending=true;button.disabled=true;result.setAttribute("aria-busy","true");
  setStatus("GigaChat подбирает подходящие продукты…");
  try{
   const response=await fetch(endpoint,{method:"POST",mode:"cors",headers:{"content-type":"application/json"},
    body:JSON.stringify({query,candidate_ids:matches,turnstile_token:token}),signal:AbortSignal.timeout(23000)});
   if(!response.ok)throw Error("api");
   const data=await response.json();
   if(!Array.isArray(data.products))throw Error("invalid");
   result.replaceChildren();
   const answer=document.createElement("p");
   answer.className="giga-search-answer";
   answer.textContent=String(data.answer||"")||"Вот подходящие продукты из каталога";
   result.appendChild(answer);
   const allowed=new Map(records.map(p=>[p.id,p]));
   for(const rec of data.products.slice(0,5)){
    const product=allowed.get(rec.id);
    if(!product)continue;
    const a=document.createElement("a");
    a.className="giga-search-choice";
    a.href=productHref(product,window.location.pathname+window.location.search);
    const title=document.createElement("strong");title.textContent=product.title;
    const desc=document.createElement("span");desc.textContent=String(rec.reason||product.public_pitch||"").slice(0,180);
    a.append(title,desc);result.appendChild(a);
   }
  }catch{
   setStatus("Сейчас ИИ-подбор недоступен · результаты обычного поиска ниже остаются доступны");
  }finally{
   pending=false;button.disabled=false;result.removeAttribute("aria-busy");
   if(window.turnstile&&widget!==null)window.turnstile.reset(widget);
  }
 };
 button.addEventListener("click",async()=>{
  const opened=panel.hidden;
  panel.hidden=!opened;button.setAttribute("aria-expanded",String(opened));
  if(!opened)return;
  if(($("search")?.value.trim().length||0)<3){setStatus("Сначала опишите задачу в поисковой строке");return;}
  try{
   const turnstile=await loadScript();
   if(widget===null)widget=turnstile.render(challenge,{
    sitekey,theme:"dark",callback:perform,
    "error-callback":()=>setStatus("Не удалось подтвердить запрос"),
    "expired-callback":()=>setStatus("Подтверждение устарело · повторите запрос")
   });
   else turnstile.reset(widget);
  }catch{setStatus("Проверка посетителя временно недоступна · используйте обычный поиск");}
 });
}
