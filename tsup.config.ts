import { defineConfig } from 'tsup';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  entry: {
    'server/rspackServerPlugin': 'src/server/rspackServerPlugin.ts',
    'client/index': 'src/client/index.ts',
    'client/reactDevtoolsHook': 'src/client/reactDevtoolsHook.ts',
    'client/userImports': 'src/client/userImports.ts',
    'client/errorOverlay/reactErrorOverlay':
      'src/client/errorOverlay/reactErrorOverlay.ts',
  },
  external: ['react', './userImports.js'],
  format: 'esm',
  splitting: false,
  clean: true,
});
