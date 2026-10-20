// The sitemap: the home page, the country pages, the legal notice and the privacy policy.
import type { APIRoute } from 'astro';
import { countryPages } from '../data/countries';

export const GET: APIRoute = ({ site }) => {
  const paths = ['/', ...countryPages.map((c) => c.href), '/legal/', '/privacy/'];
  const urls = paths.map((p) => `  <url><loc>${new URL(p, site).href}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
