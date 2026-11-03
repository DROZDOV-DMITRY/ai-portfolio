import test from "node:test";
import assert from "node:assert/strict";
import {rankProducts,searchRank,normalizeSearch} from "../public/assets/catalog-search.mjs";
const products=[
 {id:"hr",title:"Отдел кадров",public_pitch:"Кадровые документы и процессы",category:"Право",tags:"отдел кадров",problem:"Оформление документов"},
 {id:"gigaam-fast",title:"GigaAM быстро",public_pitch:"Локальная расшифровка аудио",category:"IT",tags:"транскрибация"},
 {id:"career",title:"Профориентация для школьников",public_pitch:"Профессиональные пробы для школьников",category:"Образование",tags:"профессия"},
 {id:"reels-ideas",title:"Reels-идеи",public_pitch:"Короткие видеоролики",category:"Медиа",tags:"ролик рилс"},
 {id:"dissert",title:"Диссертация",public_pitch:"Научная программа школы",category:"Исследования",tags:"статья"},
 {id:"davinci",title:"DaVinci Resolve",public_pitch:"Монтаж видео",category:"Медиа",tags:"цветокоррекция"},
 {id:"home-cook",title:"Домашний повар",public_pitch:"Рецепты и кухня",category:"Быт",tags:"готовить еду"}
];
test("Search intent finds HR for 'сделать приказ'",()=>{
 assert.equal(rankProducts(products,"хочу составить приказ об отпуске")[0].id,"hr");
});
test("audio transcription discovers GigaAM",()=>{
 assert.equal(rankProducts(products,"сделай текст из записи аудио")[0].id,"gigaam-fast");
});
test("career intent discovers guidance product",()=>{
 assert.equal(rankProducts(products,"кем стать после школы")[0].id,"career");
});
test("creative short video intent",()=>{
 assert.equal(rankProducts(products,"придумать короткий рилс для рекламы")[0].id,"reels-ideas");
});
test("ru typo tolerance",()=>{
 assert.equal(rankProducts(products,"дисертация")[0].id,"dissert");
});
test("no hallucination for unrelated search",()=>{
 assert.deepEqual(rankProducts(products,"квантовые желтые обои для спутников"),[]);
});
test("normalizer folds Ё and whitespace",()=>{
 assert.equal(normalizeSearch("  ЁЛКА!   И  РОСТ  "),"елка и рост");
});
test("different cases find same product",()=>{
 assert.equal(rankProducts(products,"ПРИКАЗ")[0].id,"hr");
});
