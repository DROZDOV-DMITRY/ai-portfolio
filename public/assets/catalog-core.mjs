import {rankProducts,normalizeSearch} from "./catalog-search.mjs";
export const PAGE_SIZE=12;
export const normalize=value=>String(value??"").toLowerCase().replace(/ё/g,"е").replace(/\s+/g," ").trim();
const choices={author:new Set(["all","author","student"]),school:new Set(["all","direct","support"]),status:new Set(["all","working","testing","development","historical","unverified"]),sort:new Set(["editorial","name","status"])};
export function readState(query=""){
 const p=new URLSearchParams(query);
 const selected=(key,allowed)=>allowed.has(p.get(key))?p.get(key):"all";
 return {q:(p.get("q")||"").slice(0,160),cat:p.get("category")||"all",
 author:selected("author",choices.author),school:selected("school",choices.school),
 status:selected("status",choices.status),
 sort:choices.sort.has(p.get("sort"))?p.get("sort"):"editorial",
 page:Math.min(99,Math.max(1,Number.parseInt(p.get("page")||"1",10)||1))};
}
export function queryFromState(s){
 const p=new URLSearchParams();
 if(s.q?.trim())p.set("q",s.q.trim());
 for(const [field,key] of [["cat","category"],["author","author"],["school","school"],["status","status"],["sort","sort"]]){
  const value=s[field];if(value&&value!=="all"&&value!=="editorial")p.set(key,value);
 }
 if(s.page>1)p.set("page",String(s.page));
 return p.toString();
}
export function selectRecords(data,state,scope="all"){
 const query=String(state.q||"").trim();
 const found=data.filter(x=>{
  if(scope!=="all"&&x.cat!==scope)return false;
  if(scope==="all"&&state.cat!=="all"&&x.cat!==state.cat)return false;
  if(state.author!=="all"&&x.audience!==state.author)return false;
  if(state.school!=="all"&&x.school!==state.school)return false;
  if(state.status!=="all"&&x.status!==state.status)return false;
  return true;
 });
 const ranked=query?rankProducts(found,query):found;
 if(state.sort==="name")ranked.sort((a,b)=>a.title.localeCompare(b.title,"ru"));
 if(state.sort==="status"&&!query){const order={working:0,testing:1,development:2,unverified:3,historical:4};ranked.sort((a,b)=>(order[a.status]??9)-(order[b.status]??9));}
 return ranked;
}
export function paginate(rows,page=1,size=PAGE_SIZE){
 const maxPage=Math.max(1,Math.ceil(rows.length/size));
 const current=Math.min(Math.max(1,page),maxPage),visible=rows.slice(0,current*size);
 return {visible,hasMore:visible.length<rows.length,current,maxPage};
}
export function cardBadges(record){
 const labels=[];
 if(record.audience==="student")labels.push("Ученическая работа");
 if(record.school==="direct")labels.push("Для школы №14");
 return labels;
}
export function productHref(record,from=""){
 const returnPath=String(from||"");
 if(!returnPath.startsWith("/ai-portfolio/")||returnPath.startsWith("//")||returnPath.includes(".."))return record.detail;
 return record.detail+"?from="+encodeURIComponent(returnPath);
}
