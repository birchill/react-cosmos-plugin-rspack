import { createRequire } from 'node:module';

export function resolveRspackLoaderPath() {
  console.log('resolveRspackLoaderPath');
  const require = createRequire(import.meta.url);
  console.log(require.resolve('./userImportsLoader.cjs'));
  return require.resolve('./userImportsLoader.cjs');
}
