import { defineConfig } from 'astro/config';
import { builtPages, testRegistry } from './src/i18n/registry';

// The pages of the other languages are two routes, the home pages (src/i18n/locale-home.astro) and the country pages
// (src/i18n/locale-page.astro), added only when the registry has a ready language. Two routes, not one, so a home page
// carries only the home page's styles and a country page only the country page's. With none ready, nothing is added and
// the build is the English site alone.
// A test registry never builds into dist/, the folder the deploy publishes: this stops `npx astro build` and any other
// way of starting a build, not only `npm run build`. The test script always passes its own --outDir.
const localeRoutes = {
  name: 'locale-routes',
  hooks: {
    'astro:config:setup': ({ injectRoute, config, command }) => {
      if (testRegistry && command === 'build' && config.outDir.href === new URL('./dist/', config.root).href) {
        throw new Error(`I18N_TEST_REGISTRY is set (${testRegistry}) and the build would write to dist/. A test build runs only through scripts/test-build.mjs, into its own folder.`);
      }
      const built = builtPages().filter((p) => p.locale !== 'en');
      if (built.some((p) => p.page === 'home')) {
        injectRoute({ pattern: '/[locale]', entrypoint: './src/i18n/locale-home.astro' });
      }
      if (built.some((p) => p.page !== 'home')) {
        injectRoute({ pattern: '/[locale]/[slug]', entrypoint: './src/i18n/locale-page.astro' });
      }
    },
  },
};

export default defineConfig({
  site: 'https://einvoiceops.eu',
  trailingSlash: 'always',
  integrations: [localeRoutes],
});
