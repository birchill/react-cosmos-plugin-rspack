import virtual from '@rollup/plugin-virtual';
import { defineConfig } from 'tsdown';

export default defineConfig([
  // server
  {
    entry: {
      'server/rspackServerPlugin': 'src/server/rspackServerPlugin.ts',
    },
    deps: {
      neverBundle: ['./userImports.js'],
    },
  },

  // client
  {
    entry: {
      'client/index': 'src/client/index.ts',
      'client/reactDevtoolsHook': 'src/client/reactDevtoolsHook.ts',
      'client/userImports': 'src/client/userImports.ts',
      'client/errorOverlay/reactErrorOverlay':
        'src/client/errorOverlay/reactErrorOverlay.ts',
    },
    deps: {
      neverBundle: ['react'],
    },
    platform: 'browser',
  },

  // ui
  {
    define: {
      'process.env.NODE_ENV': '"production"',
    },
    entry: { 'ui/build': 'src/ui/WebpackRendererError.tsx' },
    plugins: [
      virtual({
        react: 'module.exports = React',
        'react-dom': 'module.exports = ReactDOM',
        'react-plugin': 'module.exports = ReactPlugin',
      }),
    ],
  },
]);
