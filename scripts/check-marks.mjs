import {existsSync,readFileSync} from "node:fs";
import assert from "node:assert/strict";
import records from "../src/data/demo-records.json" with {type:"json"};
import categories from "../src/data/categories.json" with {type:"json"};
const seen=new Set();
for(const r of records){
 const file="public/marks/"+r.id+".svg";
 assert(existsSync(file),"Missing product icon: "+r.id);
 assert(r.logo_path==="/ai-portfolio/marks/"+r.id+".svg","Logo path mismatch: "+r.id);
 const svg=readFileSync(file,"utf8");
 assert(svg.startsWith("<svg")&&svg.includes("<path")&&svg.includes('viewBox="0 0 128 128"'),"Invalid emblem: "+r.id);
 assert(!seen.has(svg),"Duplicate SVG: "+r.id);seen.add(svg);
}
for(const c of categories)assert(existsSync("public/marks/category-"+c.slug+".svg"),"Missing category mark: "+c.slug);
assert.equal(records.length,68);assert.equal(categories.length,8);
console.log("Identity QA passed: 68 distinct product SVGs and 8 category marks");
