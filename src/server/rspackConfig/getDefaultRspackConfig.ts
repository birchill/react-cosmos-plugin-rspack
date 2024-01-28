import rspack from '@rspack/core';

import { resolveFromSilent } from '../utils/resolveSilent.js';
import { RENDERER_FILENAME } from './constants.js';
import { getRspackNodeEnv } from './getRspackNodeEnv.js';
import { getHtmlWebpackPlugin } from './htmlPlugin.js';

// This config doesn't have entry and output set up because it's not meant to
// work standalone. An entry & output will be added to this base config.
export function getDefaultRspackConfig(rootDir: string): rspack.Configuration {
  // react-cosmos doesn't directly depend on any webpack loader.
  // Instead, it includes the ones already installed by the user.
  const postcssLoaderPath = resolveFromSilent(rootDir, 'postcss-loader');
  const mdxLoaderPath = resolveFromSilent(rootDir, '@mdx-js/loader');

  const rules: rspack.RuleSetRule[] = [];
  const plugins: rspack.RspackPluginInstance[] = [];

  // Add standard TS transformation
  rules.push({
    test: /\.(j|t)s$/,
    exclude: [/[\\/]node_modules[\\/]/],
    loader: 'builtin:swc-loader',
    options: {
      sourceMap: true,
      jsc: { parser: { syntax: 'typescript' } },
    },
    type: 'javascript/auto',
  });
  rules.push({
    test: /\.(j|t)sx$/,
    loader: 'builtin:swc-loader',
    exclude: [/[\\/]node_modules[\\/]/],
    options: {
      sourceMap: true,
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: true,
        },
        transform: { react: { runtime: 'automatic' } },
      },
    },
    type: 'javascript/auto',
  });

  // Style loading
  rules.push({
    test: /\.css?$/,
    exclude: [/[\\/]node_modules[\\/]/],
    use: postcssLoaderPath ? [{ loader: postcssLoaderPath }] : undefined,
    type: 'css',
  });

  if (mdxLoaderPath) {
    rules.push({
      test: /\.mdx$/,
      loader: mdxLoaderPath,
      exclude: [/[\\/]node_modules[\\/]/],
    });
  }

  const htmlWebpackPlugin = getHtmlWebpackPlugin(rootDir);
  if (htmlWebpackPlugin) {
    plugins.push(
      new htmlWebpackPlugin({
        title: 'React Cosmos',
        filename: RENDERER_FILENAME,
      })
    );
  }

  const config: rspack.Configuration = {
    // Besides other advantages, cheap-module-source-map is compatible with
    // React.componentDidCatch https://github.com/facebook/react/issues/10441
    devtool: 'cheap-module-source-map',
    resolve: {
      extensionAlias: {
        '.js': ['.ts', '.tsx', '.js'],
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
      rules,
    },
    plugins,
    stats: {
      preset: 'errors-only',
      builtAt: true,
    },
    infrastructureLogging: { level: 'warn' },
    experiments: {
      topLevelAwait: true,
    },
  };

  return {
    ...config,
    mode: getRspackNodeEnv(),
    optimization: {
      // Cosmos reads component names at run-time, so it is crucial to not
      // minify even when building with production env (ie. when exporting)
      // https://github.com/react-cosmos/react-cosmos/issues/701
      minimize: false,
    },
  };
}