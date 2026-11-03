(function(){
  const list=window.PORTFOLIO_RECORDS||[];
  const elCards=document.getElementById('cards');
  const elSearch=document.getElementById('search');
  const elCount=document.getElementById('count');
  const elSort=document.getElementById('sort');
  const elClear=document.getElementById('clear-filters');
  const elSide=document.getElementById('sidebar');
  const elToggle=document.getElementById('filter-toggle');
  const normalize = s=>(s||'').toString().toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const params=new URLSearchParams(location.search);
  const state={q:params.get('q')||'',cat:params.get('category')||'all',audience:params.get('author')||'all',school:params.get('school')||'all',sort:params.get('sort')||'editorial'};
  if (elSearch) elSearch.value=state.q; if(elSort) elSort.value=state.sort;
  function save(){const p=new URLSearchParams();Object.entries(state).forEach(([k,v])=>{const key=k==='cat'?'category':k==='audience'?'author':k;if(v&&v!=='all'&&v!=='editorial')p.set(key,v)});try{history.replaceState(null,'',location.pathname+(p.toString()?'?'+p.toString():''))}catch(e){}}
  function cover(d){return `<div class="card-graphic"><span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span><span class="big-letter">${({meta:'M',kontur:'◉',school:'AI·14',law:'§',dispatcher:'⌘',write:'W.',career:'↗',hr:'HR',net:'N',film:'F',lawbiz:'§',debt:'§',student:'G',research:'R',marketing:'→'})[d.cover]||'AI'}</span><span class="visual-sub">${esc(d.num)} / AI LAB</span></div>`}
  function card(d){const wrap=d.detail?'a':'div';const href=d.detail?` href="${esc(d.detail)}"`:'';const chip=d.status==='working'?' is-bright':'';return `<article class="product-card"><${wrap} class="card-visual ${esc(d.cover)}"${href} aria-label="${d.detail?'Подробнее: ':''}${esc(d.title)}"><span class="card-badge">${esc(d.kind)}</span>${cover(d)}</${wrap}><div class="product-info"><div class="product-top"><span>${esc(d.category)}</span><span>${esc(d.version)}</span></div><h3 class="product-name">${d.detail?`<a href="${esc(d.detail)}">${esc(d.title)}</a>`:esc(d.title)}</h3><p class="product-description">${esc(d.subtitle)}</p><div class="product-foot"><span class="foot-chip${chip}">${esc(d.statusLabel)}</span>${d.school==='direct'?'<span class="foot-chip">Для школы №14</span>':d.audience==='student'?'<span class="foot-chip">Ученическая работа</span>':''}</div></div></article>`}
  function render(){
    document.querySelectorAll('[data-cat]').forEach(x=>{x.classList.toggle('active',x.dataset.cat===state.cat);x.setAttribute('aria-pressed',String(x.dataset.cat===state.cat))});
    document.querySelectorAll('input[name="author"]').forEach(x=>x.checked=x.value===state.audience);
    document.querySelectorAll('input[name="school"]').forEach(x=>x.checked=x.value===state.school);
    const q=normalize(state.q);let rows=list.filter(x=>(state.cat==='all'||x.cat===state.cat)&&(state.audience==='all'||x.audience===state.audience)&&(state.school==='all'||(state.school==='direct'?x.school==='direct':x.school==='support'))&&(!q||normalize([x.title,x.subtitle,x.category,x.tags].join(' ')).includes(q)));
    if(state.sort==='name') rows.sort((a,b)=>a.title.localeCompare(b.title,'ru'));
    if(state.sort==='status')rows.sort((a,b)=>['working','testing','development','historical'].indexOf(a.status)-['working','testing','development','historical'].indexOf(b.status));
    elCount.innerHTML=`Найдено <strong>${rows.length}</strong> ${rows.length===1?'решение':rows.length<5?'решения':'решений'} <span style="color:#6d7d73">из ${list.length} демонстрационных записей</span>`;
    elCards.innerHTML=rows.length?rows.map(card).join(''):'<div class="empty-state"><strong>Совпадений нет</strong><p>Уточните запрос или сбросьте выбранные фильтры.</p><button type="button" id="empty-clear">Сбросить фильтры</button></div>';
    document.getElementById('empty-clear')?.addEventListener('click',reset);
    save();
  }
  function reset(){state.q='';state.cat='all';state.audience='all';state.school='all';state.sort='editorial';elSearch.value='';elSort.value='editorial';render()}
  document.querySelectorAll('[data-cat]').forEach(x=>x.addEventListener('click',()=>{state.cat=x.dataset.cat;render()}));
  document.querySelectorAll('input[name="author"]').forEach(x=>x.addEventListener('change',()=>{state.audience=x.value;render()}));
  document.querySelectorAll('input[name="school"]').forEach(x=>x.addEventListener('change',()=>{state.school=x.value;render()}));
  elSearch.addEventListener('input',()=>{state.q=elSearch.value;render()});
  elSort.addEventListener('change',()=>{state.sort=elSort.value;render()});
  elClear.addEventListener('click',reset);
  elToggle.addEventListener('click',()=>{const opened=elSide.classList.toggle('open');elToggle.setAttribute('aria-expanded',String(opened))});
  document.getElementById('hero-search-form')?.addEventListener('submit',e=>{e.preventDefault();document.getElementById('catalog')?.scrollIntoView({behavior:'smooth'})});
  window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);state.q=p.get('q')||'';state.cat=p.get('category')||'all';state.audience=p.get('author')||'all';state.school=p.get('school')||'all';state.sort=p.get('sort')||'editorial';elSearch.value=state.q;elSort.value=state.sort;render()});
  render();
})();
