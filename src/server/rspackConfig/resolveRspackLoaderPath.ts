import { createRequire } from 'node:module';

// NOTE: This is ESM code that can't run in Jest yet, which means that this
// module always needs to be mocked in tests until Jest adds ESM support.

export function resolveRspackLoaderPath() {
  console.log('resolveRspackLoaderPath');
  const require = createRequire(import.meta.url);
  console.log(require.resolve('./userImportsLoader.cjs'));
  return require.resolve('./userImportsLoader.cjs');
}
