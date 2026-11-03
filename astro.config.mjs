import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://drozdov-dmitry.github.io',
  base: '/ai-portfolio/',
  output: 'static',
  outDir: process.env.CATALOG_EDITORIAL_PREVIEW === '1' ? './dist-preview' : './dist',
  trailingSlash: 'always',
});
