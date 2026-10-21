import { defineConfig } from 'astro/config';
import { builtPages } from './src/i18n/registry';

// The pages of the other languages are one route (src/i18n/locale-page.astro), added only when the registry has a ready
// language. With none ready, nothing is added and the build is the English site alone.
const localeRoutes = {
  name: 'locale-routes',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      if (builtPages().some((p) => p.locale !== 'en')) {
        injectRoute({ pattern: '/[locale]/[...slug]', entrypoint: './src/i18n/locale-page.astro' });
      }
    },
  },
};

export default defineConfig({
  site: 'https://einvoiceops.eu',
  trailingSlash: 'always',
  integrations: [localeRoutes],
});
