// The sitemap: the home page, the country pages, the legal notice and the privacy policy, and the same pages in every
// ready language. A page that exists in more than one language lists all its versions as alternates (each version
// lists the others and itself, with x-default on the English one). With no language ready there are no alternates.
import type { APIRoute } from 'astro';
import { builtPages } from '../data/countries';

export const GET: APIRoute = ({ site }) => {
  const abs = (p: string) => new URL(p, site).href;
  const built = builtPages();
  const alternates = built.some((p) => p.locale !== 'en');
  const urls = built.map((p) => {
    const versions = built.filter((q) => q.page === p.page);
    const links = versions.length > 1
      ? versions.map((q) => `<xhtml:link rel="alternate" hreflang="${q.locale}" href="${abs(q.path)}"/>`)
        .concat(`<xhtml:link rel="alternate" hreflang="x-default" href="${abs(versions.find((q) => q.locale === 'en')!.path)}"/>`)
        .join('')
      : '';
    return `  <url><loc>${abs(p.path)}</loc>${links}</url>`;
  }).join('\n');
  const ns = alternates ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${ns}>\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
