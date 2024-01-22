import rspack from '@rspack/core';
import type { Options as HtmlWebpackPluginOptions } from 'html-webpack-plugin';
import { CosmosConfig } from 'react-cosmos';

import { omit } from '../utils/omit.js';
import { requireFromSilent } from '../utils/requireSilent.js';

import { RENDERER_FILENAME } from './constants.js';
import { hasPlugin, isInstanceOfRspackPlugin } from './plugins.js';

// prettier-ignore
export type HtmlWebpackPlugin = rspack.RspackPluginInstance & {
  constructor: HtmlWebpackPluginConstructor;
} & (
  | { options: HtmlWebpackPluginOptions; userOptions: undefined } // html-webpack-plugin < 5
  | { userOptions: HtmlWebpackPluginOptions; options: undefined } // html-webpack-plugin >= 5
  );

type HtmlWebpackPluginConstructor = new (
  options?: HtmlWebpackPluginOptions
) => HtmlWebpackPlugin;

export function ensureHtmlWebackPlugin(
  { rootDir }: CosmosConfig,
  plugins: rspack.RspackPluginInstance[]
): rspack.RspackPluginInstance[] {
  if (hasPlugin(plugins, 'HtmlWebpackPlugin')) {
    return plugins.map((plugin) =>
      isHtmlWebpackPlugin(plugin) ? changeHtmlPluginFilename(plugin) : plugin
    );
  }

  const htmlWebpackPlugin = getHtmlWebpackPlugin(rootDir);
  if (!htmlWebpackPlugin) {
    return plugins;
  }

  return [
    ...plugins,
    new htmlWebpackPlugin({
      title: 'React Cosmos',
      filename: RENDERER_FILENAME,
    }),
  ];
}

export function getHtmlWebpackPlugin(rootDir: string) {
  return requireFromSilent(
    rootDir,
    'html-webpack-plugin'
  ) as HtmlWebpackPluginConstructor;
}

function isHtmlWebpackPlugin(
  plugin: rspack.RspackPluginInstance
): plugin is HtmlWebpackPlugin {
  return isInstanceOfRspackPlugin(plugin, 'HtmlWebpackPlugin');
}

function changeHtmlPluginFilename(htmlPlugin: HtmlWebpackPlugin) {
  if (!isIndexHtmlWebpackPlugin(htmlPlugin)) {
    return htmlPlugin;
  }

  const options = htmlPlugin.userOptions || htmlPlugin.options;
  const safeOptions = omit(options, ['chunks']);

  return new htmlPlugin.constructor({
    ...safeOptions,
    filename: RENDERER_FILENAME,
  });
}

function isIndexHtmlWebpackPlugin(htmlPlugin: HtmlWebpackPlugin) {
  const { filename } = htmlPlugin.userOptions || htmlPlugin.options;
  return (
    filename === 'index.html' ||
    typeof filename !== 'string' ||
    filename.endsWith('/index.html')
  );
}
