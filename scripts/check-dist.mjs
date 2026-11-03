import assert from "node:assert/strict";
import {existsSync, readFileSync, readdirSync} from "node:fs";
import {join} from "node:path";
import records from "../src/data/demo-records.json" with {type:"json"};
import categories from "../src/data/categories.json" with {type:"json"};
const mode=process.argv[2];
assert(["public","preview"].includes(mode),"Expected mode public or preview");
const root=mode==="preview"?"dist-preview":"dist";
const approved=records.filter(r=>r.visibility==="public"&&r.publication_status==="approved_public"&&r.content_review==="approved"&&r.privacy_review==="approved");
const shown=mode==="preview"?records:approved;
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);}
const outputs=walk(root);
const html=readFileSync(join(root,"index.html"),"utf8");
const products=outputs.filter(p=>/\/(agent|project)\/[^/]+\/index\.html$/.test(p.replaceAll("\\","/")));
const cats=outputs.filter(p=>/\/category\/[^/]+\/index\.html$/.test(p.replaceAll("\\","/")));
assert.equal(products.length,shown.length,"Product count "+mode);
assert.equal(cats.length,categories.length,"Category count "+mode);
assert(existsSync(join(root,"about","index.html")),"Missing about page");
assert(readFileSync(join(root,"404.html"),"utf8").includes('name="q"'),"404 search missing");
assert(html.includes('id="cards"')&&html.includes('id="search"'),"Catalog UI missing");
for(const record of records){
 const logo=join(root,"marks",record.id+".svg");
 assert(existsSync(logo),"Product logo missing: "+record.id);
}
for(const category of categories){
 assert(existsSync(join(root,"marks","category-"+category.slug+".svg")),"Category logo missing: "+category.slug);
}
for(const forbidden of ["statusLabel","result_state","evidence_note","limitations","editorial_review","source_basis","publication_status"]){
 assert(!html.includes('"'+forbidden+'":'),"Internal metadata leaked into homepage: "+forbidden);
}
for(const category of categories){
 const page=readFileSync(join(root,"category",category.slug,"index.html"),"utf8");
 assert(!page.includes('"statusLabel":'),"Readiness metadata leaked into category: "+category.slug);
}
if(mode==="preview")assert(html.includes('class="direction-grid"'),"New category gallery missing");

for(const item of shown)assert(existsSync(join(root,item.route_kind,item.slug,"index.html")),"Missing "+item.id);
if(mode==="public"){
 assert(!html.includes("РЕДАКЦИОННЫЙ ПРЕДПРОСМОТР"),"Preview in public HTML");
 const publicText=outputs.filter(p=>/\.(?:html|js|json|xml|txt|css)$/i.test(p)).map(p=>readFileSync(p,"utf8")).join("\n");
 for(const item of records.filter(x=>!approved.includes(x)))assert(!publicText.includes(item.title),"Draft leaked: "+item.id);
}else {
 assert(html.includes("РЕДАКЦИОННЫЙ ПРЕДПРОСМОТР"),"Preview banner absent");
 for(const [id,file] of [["course","course-logo.webp"],["dissert","school-ai-mark.svg"]]){
  const r=records.find(x=>x.id===id);
  const content=readFileSync(join(root,r.route_kind,r.slug,"index.html"),"utf8");
  assert(content.includes("showcase/"+file),"Original proof image not rendered in "+id);
  assert(content.includes("ПОДТВЕРЖДЁННЫЕ МАТЕРИАЛЫ"),"Proof gallery missing for "+id);
  assert(!content.includes("ВНУТРЕННИЙ ИСТОЧНИК"),"Internal proof unexpectedly rendered");
 }
}
console.log("Verified "+mode+" output: "+products.length+" cards, "+cats.length+" categories");
