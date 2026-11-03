import {visibleRecords} from "../../lib/catalog.js";
export const prerender=true;
export function GET(){
 const products=visibleRecords().map(r=>({
  id:r.id,title:r.title,href:r.detail,category:r.category,
  description:r.public_pitch||r.subtitle,
  keywords:(r.tags||"").slice(0,200)
 }));
 return new Response(JSON.stringify({schema:1,brand:"AI LAB",products}),{
  status:200,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"public, max-age=300"}
 });
}
