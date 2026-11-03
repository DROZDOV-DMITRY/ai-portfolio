import {readState,queryFromState,selectRecords,paginate,cardBadges,productHref} from "./catalog-core.mjs";
(()=>{
 const list=Array.isArray(window.PORTFOLIO_RECORDS)?window.PORTFOLIO_RECORDS:[];
 const scope=window.PORTFOLIO_SCOPE||"all";
 const $=id=>document.getElementById(id);
 const cards=$("cards"),search=$("search"),counter=$("count"),sort=$("sort");
 if(!cards||!search||!counter)return;
 const status=null,sidebar=$("sidebar"),toggle=$("filter-toggle");
 const pager=$("pager"),loadMore=$("load-more"),pagerStatus=$("pager-status");
 const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
 let state=readState(window.location.search),timer=0;state.status="all";
 function applyControls(){
  search.value=state.q;if(sort)sort.value=state.sort;if(status)status.value=state.status;
  document.querySelectorAll("[data-cat]").forEach(e=>{const active=e.dataset.cat===state.cat;e.classList.toggle("active",active);e.setAttribute("aria-pressed",String(active));});
  for(const [name,key] of [["author","author"],["school","school"]])document.querySelectorAll('input[name="'+name+'"]').forEach(e=>e.checked=e.value===state[key]);
 }
 function card(record){
  const href=esc(productHref(record,window.location.pathname+window.location.search));
  const badges=cardBadges(record).map(t=>'<span class="foot-chip">'+esc(t)+'</span>').join("");
  const graphic='<div class="card-graphic"><span class="ring r1"></span><span class="ring r2"></span><img class="product-mark" src="'+esc(record.logo_path)+'" alt="" loading="lazy" decoding="async" width="138" height="138"/><span class="visual-sub">'+esc(record.num)+' / AI LAB</span></div>';
  return '<article class="product-card"><a class="card-visual '+esc(record.cover)+'" href="'+href+'" aria-label="Подробнее: '+esc(record.title)+'"><span class="card-badge">'+esc(record.public_label||"ИИ-продукт")+'</span>'+graphic+'</a>'+
   '<div class="product-info"><div class="product-top"><span>'+esc(record.category)+'</span><span>'+esc(record.version==="—"?"AI LAB":record.version)+'</span></div>'+
   '<h3 class="product-name"><a href="'+href+'">'+esc(record.title)+'</a></h3><p class="product-description">'+esc(record.public_pitch||record.subtitle)+'</p>'+
   '<div class="product-foot"><span class="foot-chip is-bright">ИИ-продукт</span>'+badges+'</div></div></article>';
 }
 function paint(){
  const rows=selectRecords(list,state,scope),page=paginate(rows,state.page);
  state.page=page.current;
  counter.textContent="Найдено: "+rows.length+" из "+list.length;
  cards.innerHTML=rows.length?page.visible.map(card).join(""):'<div class="empty-state"><strong>Совпадений нет</strong><p>Уточните запрос или сбросьте фильтры.</p><button type="button" id="empty-clear">Сбросить фильтры</button></div>';
  $("empty-clear")?.addEventListener("click",reset);
  if(pager)pager.hidden=!page.hasMore;
  if(loadMore)loadMore.disabled=!page.hasMore;
  if(pagerStatus)pagerStatus.textContent="Показано "+page.visible.length+" из "+rows.length;
  applyControls();
 }
 function commit(mode="push"){
  const next=queryFromState(state),url=window.location.pathname+(next?"?"+next:"");
  if(url!==window.location.pathname+window.location.search)window.history[mode==="replace"?"replaceState":"pushState"](null,"",url);
  paint();
 }
 function change(field,value){window.clearTimeout(timer);state[field]=value;state.page=1;commit();}
 function reset(){window.clearTimeout(timer);state=readState("");commit();}
 search.addEventListener("input",()=>{window.clearTimeout(timer);const q=search.value;timer=window.setTimeout(()=>{state.q=q;state.page=1;commit();},200);});
 search.addEventListener("change",()=>{window.clearTimeout(timer);if(state.q!==search.value){state.q=search.value;state.page=1;commit();}});
 $("hero-search-form")?.addEventListener("submit",e=>{e.preventDefault();window.clearTimeout(timer);state.q=search.value;state.page=1;commit();$("catalog")?.scrollIntoView({behavior:"smooth",block:"start"});});
 document.querySelectorAll("[data-cat]").forEach(e=>e.addEventListener("click",()=>change("cat",e.dataset.cat)));
 document.querySelectorAll('input[name="author"]').forEach(e=>e.addEventListener("change",()=>change("author",e.value)));
 document.querySelectorAll('input[name="school"]').forEach(e=>e.addEventListener("change",()=>change("school",e.value)));
 sort?.addEventListener("change",()=>change("sort",sort.value));
 status?.addEventListener("change",()=>change("status",status.value));
 $("clear-filters")?.addEventListener("click",reset);
 loadMore?.addEventListener("click",()=>{state.page++;commit();});
 toggle?.addEventListener("click",()=>{const open=sidebar?.classList.toggle("open")??false;toggle.setAttribute("aria-expanded",String(open));});
 window.addEventListener("popstate",()=>{window.clearTimeout(timer);state=readState(window.location.search);state.status="all";paint();});
 paint();
})();
