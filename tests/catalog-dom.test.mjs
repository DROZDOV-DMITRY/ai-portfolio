import test from "node:test";
import assert from "node:assert/strict";
import {JSDOM} from "jsdom";
const cards=Array.from({length:14},(_,i)=>({
 id:String(i),title:i===0?"Ёж":i===1?"Комикс":"Разработка "+i,
 subtitle:"Описание",problem:"Задача "+i,cat:i===1?"education":"it",category:i===1?"Образование":"IT",
 audience:i===1?"student":"author",school:i===1?"direct":"none",status:"working",
 statusLabel:"Работает со слов автора",kind:"Ассистент",cover:"meta",num:String(i+1).padStart(2,"0"),
 version:"—",detail:"/ai-portfolio/agent/item-"+i+"/",tags:""
}));
const fixture='<!doctype html><div id="catalog"><input id="search"><form id="hero-search-form"></form>'+
 '<div id="count"></div><div id="cards"></div><div id="pager"><span id="pager-status"></span><button id="load-more">Ещё</button></div>'+
 '<select id="sort"><option value="editorial">Порядок</option><option value="name">Имя</option><option value="status">Статус</option></select>'+
 '<select id="status"><option value="all">Все</option><option value="working">Работает</option></select>'+
 '<input type="radio" name="author" value="all" checked><input type="radio" name="author" value="student">'+
 '<input type="radio" name="school" value="all" checked><input type="radio" name="school" value="direct">'+
 '<button id="clear-filters"></button><button id="filter-toggle"></button><aside id="sidebar"></aside></div>';
test("DOM: cards, paging, Cyrillic search and URL restore",async()=>{
 const dom=new JSDOM(fixture,{url:"https://portfolio.test/ai-portfolio/",pretendToBeVisual:true});
 global.window=dom.window;global.document=dom.window.document;
 dom.window.PORTFOLIO_RECORDS=cards;
 dom.window.PORTFOLIO_SCOPE="all";
 await import("../public/assets/catalog.js?dom_test=first");
 const $=id=>dom.window.document.getElementById(id);
 assert.equal(dom.window.document.querySelectorAll(".product-card").length,12);
 assert.equal($("pager").hidden,false);
 $("load-more").click();
 assert.equal(dom.window.document.querySelectorAll(".product-card").length,14);
 assert.match(dom.window.location.search,/page=2/);
 const search=$("search");search.value="ЕЖ";
 search.dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 assert.equal(dom.window.document.querySelectorAll(".product-card").length,1);
 assert.match(dom.window.document.querySelector(".product-name").textContent,/Ёж/);
 assert.match(dom.window.location.search,/q=/);
 search.value="несуществующее";search.dispatchEvent(new dom.window.Event("change",{bubbles:true}));
 assert.match($("cards").textContent,/Совпадений нет/);
 dom.window.history.replaceState(null,"","/ai-portfolio/?author=student");
 dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate"));
 assert.equal(dom.window.document.querySelectorAll(".product-card").length,1);
 assert.match($("cards").textContent,/Ученическая работа/);
 assert.match($("cards").textContent,/Для школы №14/);
 dom.window.close();
 delete global.window;delete global.document;
});
