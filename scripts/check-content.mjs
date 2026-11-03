import records from "../src/data/demo-records.json" with { type: "json" };
import categories from "../src/data/categories.json" with { type: "json" };

const failures=[];
const uniq=new Set();
const ids=new Set();
const cats=new Set(categories.map(c=>c.slug));
const allowed=new Set(["working","testing","development","historical","unverified"]);
const needed=["id","title","subtitle","cat","kind","status","statusLabel","version","slug","route_kind","detail","problem","long_description","capabilities","limitations","result_state","source_basis","publication_status","visibility","content_review","privacy_review"];
for(const [i,r] of records.entries()){
  const check=(ok,msg)=>{if(!ok)failures.push(`#${i+1} ${r.id||"UNKNOWN"}: ${msg}`)};
  for(const key of needed)check(r[key]!==undefined && r[key]!==null && String(r[key]).trim().length>0,`Missing field ${key}`);

  for(const key of ["audience_description","evidence_note","editorial_version","editorial_review"])
    check(typeof r[key]==="string" && r[key].trim().length >= 15,`Editorial field incomplete: ${key}`);
  check(typeof r.editorial_scenario==="object" && r.editorial_scenario!==null,"Missing editorial scenario");
  if(r.editorial_scenario)for(const key of ["input","process","output"])
    check(typeof r.editorial_scenario[key]==="string" && r.editorial_scenario[key].trim().length >= 14,`Missing scenario part: ${key}`);
  const editorialText=[r.audience_description,r.evidence_note,r.editorial_scenario?.input,r.editorial_scenario?.process,r.editorial_scenario?.output].join(" ");
  check(!/https?:\/\/|(?:[A-Za-z]:\\)|(?:bearer\s+[\w.-]+)|(?:api[_ -]?key\s*[:=])/i.test(editorialText),"Private information in editorial metadata");
  check(!ids.has(r.id),"Duplicate ID");ids.add(r.id);
  check(cats.has(r.cat),"Unknown category");
  check(allowed.has(r.status),"Unrecognized status");
  check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug),"Invalid slug");
  check(!uniq.has(r.detail),"Duplicate URL");uniq.add(r.detail);
  check(["agent","project"].includes(r.route_kind),"Invalid route kind");
  check(r.detail===`/ai-portfolio/${r.route_kind}/${r.slug}/`,"Route mismatch");
  check(Array.isArray(r.capabilities)&&r.capabilities.length===3,"Expected exactly three capabilities");
  const ready = r.visibility === "public" && r.publication_status === "approved_public" && r.content_review === "approved" && r.privacy_review === "approved";
  const hidden = r.visibility !== "public" && r.publication_status !== "approved_public";
  check(ready || hidden,"Inconsistent publication approval");
  check(["draft","private","public"].includes(r.visibility),"Unknown visibility");
  check(r.access_mode==="description_only","Unexpected public access");
  check(!Object.keys(r).some(k=>/(url|email|phone|token|password|secret|credential|private_path)/i.test(k)),"Sensitive property name");
  const text=[r.title,r.subtitle,r.long_description,r.problem,r.capabilities,r.limitations,r.result_state,r.tags].flat().join(" ");
  check(!/https?:\/\/|@\w+\.|(?:[A-Za-z]:\\)|(?:api[_ -]?key)|(?:password)|(?:secret)|(?:bearer\s+[\w.-]+)/i.test(text),"Potential private reference");
  check(r.authorship!=="student"||r.audience==="student","Student authorship must be labeled");
  check(r.audience!=="student"||r.authorship==="student","Student attribution mismatch");
}
if(records.length<30)failures.push("Content set unexpectedly small");
if(failures.length){console.error(failures.join("\n"));process.exitCode=1}
else console.log("Content validation passed: "+records.length+" records and "+cats.size+" categories");
