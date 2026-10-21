// Lets a test import the site's .ts files. Node strips the types itself, but the site writes imports without the .ts ending,
// so this adds a resolve hook that tries the ending when a relative import has none.
import { register } from 'node:module';

const hooks = `
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
export async function resolve(specifier, context, next) {
  if (/^\\.\\.?\\//.test(specifier) && !/\\.[a-z]+$/i.test(specifier) && context.parentURL) {
    const url = new URL(specifier + '.ts', context.parentURL);
    if (existsSync(fileURLToPath(url))) return next(url.href, context);
  }
  return next(specifier, context);
}
`;

let done = false;
export async function importTs(fileUrl) {
  if (!done) {
    register(`data:text/javascript,${encodeURIComponent(hooks)}`);
    done = true;
  }
  return import(fileUrl);
}
