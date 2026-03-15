// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages passes SITE and BASE via env; Vercel uses defaults
const site = process.env.SITE || 'https://watson-works.vercel.app';
const base = process.env.BASE || '/';

export default defineConfig({
  site,
  base,
});
