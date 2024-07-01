import type { PluginBuild } from 'esbuild';
import { defineConfig } from 'tsup';

export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  entry: { 'ui/build': 'src/ui/WebpackRendererError.tsx' },
  esbuildPlugins: [
    importAsGlobals({
      react: 'React',
      'react-dom': 'ReactDOM',
      'react-plugin': 'ReactPlugin',
    }),
  ],
  format: 'esm',
  splitting: false,
});

// From https://github.com/evanw/esbuild/issues/337#issuecomment-954633403
function importAsGlobals(mapping: Record<string, string>) {
  // https://stackoverflow.com/a/3561711/153718
  const escRe = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const filter = new RegExp(
    Object.keys(mapping)
      .map((mod) => `^${escRe(mod)}$`)
      .join('|')
  );

  return {
    name: 'global-imports',
    setup(build: PluginBuild) {
      build.onResolve({ filter }, (args) => {
        if (!mapping[args.path]) {
          throw new Error('Unknown global: ' + args.path);
        }
        return {
          path: args.path,
          namespace: 'external-global',
        };
      });

      build.onLoad(
        {
          filter,
          namespace: 'external-global',
        },
        async (args) => {
          const global = mapping[args.path];
          return {
            contents: `module.exports = ${global};`,
            loader: 'js',
          };
        }
      );
    },
  };
}
