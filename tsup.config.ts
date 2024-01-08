import { defineConfig } from 'tsup';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  entry: {
    'server/rspackServerPlugin': 'src/server/rspackServerPlugin.ts',
  },
  format: 'esm',
  splitting: false,
  clean: true,
});
