import records from "../data/demo-records.json";
import categories from "../data/categories.json";
export const isEditorialPreview = process.env.CATALOG_EDITORIAL_PREVIEW === "1";
export const isApproved = r => r.visibility === "public" &&
  r.publication_status === "approved_public" &&
  r.content_review === "approved" && r.privacy_review === "approved";
export const approvedPublicRecords = () => records.filter(isApproved);
export const visibleRecords = () => isEditorialPreview ? records : approvedPublicRecords();
export const previewRecords = () => visibleRecords();
export const categoryRecords = slug => visibleRecords().filter(r => r.cat === slug);
export const categoryBySlug = slug => categories.find(c => c.slug === slug);
export const relatedRecords = record => visibleRecords()
  .filter(r => r.id !== record.id && r.cat === record.cat && r.status !== "historical").slice(0, 3);
