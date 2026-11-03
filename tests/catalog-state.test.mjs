import test from "node:test";
import assert from "node:assert/strict";
import {readState,queryFromState,selectRecords,paginate,cardBadges,productHref,normalize} from "../public/assets/catalog-core.mjs";
const rows=[
{id:"a",title:"Ёж",subtitle:"Учебная разработка",cat:"education",audience:"student",school:"direct",status:"working",detail:"/ai-portfolio/project/a/"},
{id:"b",title:"Договор",subtitle:"Помощь с текстами",problem:"Составить документ",cat:"docs",audience:"author",school:"none",status:"testing",detail:"/ai-portfolio/agent/b/"},
{id:"c",title:"Школа",subtitle:"Уроки",cat:"education",audience:"author",school:"support",status:"development",detail:"/ai-portfolio/project/c/"}
];
test("Cyrillic normalization",()=>assert.deepEqual(selectRecords(rows,{...readState(""),q:"ЕЖ"}).map(r=>r.id),["a"]));
test("filter intersection",()=>{
 const state={...readState(""),cat:"education",school:"direct",author:"student",status:"working"};
 assert.deepEqual(selectRecords(rows,state).map(r=>r.id),["a"]);
 state.author="author";assert.equal(selectRecords(rows,state).length,0);
});
test("category scopes rows",()=>assert.equal(selectRecords(rows,readState(""),"education").length,2));
test("URL query round-trip",()=>{
 const state={...readState(""),q:"Ёлка",status:"working",author:"student",page:3,sort:"name"};
 assert.deepEqual(readState("?"+queryFromState(state)),state);
});
test("invalid URL fallbacks",()=>{
 const s=readState("?status=nope&author=admin&page=-1");
 assert.equal(s.status,"all");assert.equal(s.page,1);
});
test("incremental pagination and bounds",()=>{
 const data=Array.from({length:31},(_,i)=>({id:i}));
 assert.deepEqual([paginate(data,1).visible.length,paginate(data,2).visible.length,paginate(data,3).visible.length],[12,24,31]);
 assert.equal(paginate(data,4).hasMore,false);
});
test("student and school badges coexist",()=>assert.deepEqual(cardBadges(rows[0]),["Ученическая работа","Для школы №14"]));
test("only safe return paths",()=>{
 assert(productHref(rows[0],"/ai-portfolio/?q=abc").includes("from="));
 assert.equal(productHref(rows[0],"https://evil.example/"),rows[0].detail);
 assert.equal(productHref(rows[0],"//evil.example/"),rows[0].detail);
});
test("empty search returns zero",()=>assert.equal(selectRecords(rows,{...readState(""),q:"нет результата"}).length,0));
