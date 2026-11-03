import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const assets = [
  ["public/brand/mark.svg", null],
  ["public/brand/mark-light.svg", null],
  ["public/brand/mark-dark.svg", null],
  ["public/brand/favicon-16.png", [16, 16]],
  ["public/brand/favicon-32.png", [32, 32]],
  ["public/brand/apple-touch-icon.png", [180, 180]],
  ["public/brand/mark-512.png", [512, 512]],
  ["public/brand/og-cover.png", [1200, 630]],
  ["public/brand/favicon.ico", null],
];
const pages = [
  "src/pages/index.astro",
  "src/pages/category/[slug].astro",
  "src/components/ProductDetail.astro",
  "src/pages/404.astro",
];
const errors = [];
for (const [relative, dimensions] of assets) {
  const absolute = resolve(root, relative);
  if (!existsSync(absolute) || statSync(absolute).size === 0) {
    errors.push(`Brand asset missing or empty: ${relative}`);
    continue;
  }
  if (dimensions) {
    const bytes = readFileSync(absolute);
    if (bytes.length < 24 || bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
      errors.push(`Not a PNG: ${relative}`);
      continue;
    }
    const found = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
    if (found[0] !== dimensions[0] || found[1] !== dimensions[1]) {
      errors.push(`Unexpected PNG dimensions: ${relative} (${found.join("x")})`);
    }
  }
}
for (const relative of pages) {
  const absolute = resolve(root, relative);
  if (!existsSync(absolute)) {
    errors.push(`Page template missing: ${relative}`);
    continue;
  }
  const content = readFileSync(absolute, "utf8");
  if (!content.includes("/ai-portfolio/brand/mark.svg"))
    errors.push(`Logo missing from page: ${relative}`);
  if (!content.includes("/ai-portfolio/brand/favicon-32.png"))
    errors.push(`Favicon missing from page: ${relative}`);
  if (!content.includes("/ai-portfolio/brand/og-cover.png"))
    errors.push(`Social preview missing from page: ${relative}`);
  if (!content.includes('noindex,nofollow'))
    errors.push(`Staging robots guard missing: ${relative}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Brand validation passed: ${assets.length} files, ${pages.length} page templates`);
}
