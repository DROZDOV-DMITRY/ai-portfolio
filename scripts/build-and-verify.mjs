import {spawnSync} from "node:child_process";
const npm=process.platform==="win32"?"npm.cmd":"npm";
function run(args,env=process.env){
 const p=spawnSync(npm,args,{env,stdio:"inherit",shell:process.platform==="win32"});
 if(p.status!==0)process.exit(p.status||1);
}
run(["run","check:brand"]);run(["run","check:content"]);run(["run","check:showcase"]);run(["run","check:marks"]);run(["run","test:catalog"]);
for(const mode of ["public","preview"]){
 console.log("\nBuilding "+mode+" output...");
 run(["run","build:raw"],{...process.env,CATALOG_EDITORIAL_PREVIEW:mode==="preview"?"1":"0"});
 run(["run","check:dist","--",mode]);
}
console.log("Isolated builds passed. Only dist/ may be used for eventual publication.");
