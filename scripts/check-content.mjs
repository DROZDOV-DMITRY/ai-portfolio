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
