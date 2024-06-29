import { createRequire } from 'node:module';

export function resolveRspackLoaderPath() {
  const require = createRequire(import.meta.url);
  return require.resolve('./userImportsLoader.cjs');
}
