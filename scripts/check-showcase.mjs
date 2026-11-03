import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import assert from "node:assert/strict";
import records from "../src/data/demo-records.json" with {type:"json"};
const cases={
 course:{file:"public/showcase/course-logo.webp",sha:"65975f536a5dc77c2b37e3938d7cb7e1b44cd07d",image:"/ai-portfolio/showcase/course-logo.webp",prefix:"https://drozdov-dmitry.github.io/school-ai-courses/"},
 dissert:{file:"public/showcase/school-ai-mark.svg",sha:"6d6ac9ac68cabe15dbdcd15ec425fa8f3a7318ff",image:"/ai-portfolio/showcase/school-ai-mark.svg",prefix:"https://drozdov-dmitry.github.io/school-ai-ecosystem/"}
};
const shown=records.filter(x=>x.public_showcase);
assert.equal(shown.length,2,"Unexpected number of public showcases");
for(const r of records)assert(!("internal_source_evidence" in r),"Internal evidence unexpectedly in public source");
for(const rec of shown){
 const source=cases[rec.id];
 assert(source,"Unverified showcase in public catalog: "+rec.id);
 assert.equal(rec.public_showcase.image_src,source.image);
 assert(rec.public_showcase.action_href.startsWith(source.prefix),"Unknown action URL");
 assert(rec.public_showcase.image_note.includes("не снимок"),"Must not present original asset as screenshot");
 assert(rec.public_showcase.artifacts.length>=2,"Insufficient evidence artifacts");
 assert(rec.public_showcase.artifacts.every(a=>a.href.startsWith(source.prefix)),"Unexpected artifact link");
 assert(rec.visibility==="draft" && rec.content_review==="pending" && rec.privacy_review==="pending","Unapproved catalog record");
 assert(existsSync(source.file),"Missing original verified asset: "+source.file);
 const content=readFileSync(source.file),sha=createHash("sha1").update("blob "+content.length+"\0").update(content).digest("hex");
 assert.equal(sha,source.sha,"Image bytes do not match primary source SHA");
}
console.log("Source showcase QA passed: 2 original assets verified against GitHub blob hashes; no private document records embedded");
