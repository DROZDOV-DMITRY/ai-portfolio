import records from "../data/demo-records.json";
import categories from "../data/categories.json";
export function previewRecords(){ return records; }
export function categoryRecords(slug){ return records.filter(r => r.cat === slug); }
export function categoryBySlug(slug){ return categories.find(c => c.slug === slug); }
export function approvedPublicRecords(){
  return records.filter(r => r.visibility === "public" && r.publication_status === "approved_public" &&
    r.content_review === "approved" && r.privacy_review === "approved");
}
export function assertPublicationAllowed(){
  if(records.some(r => r.publication_status !== "approved_public")) throw new Error("PUBLICATION_BLOCKED: staging content");
}
