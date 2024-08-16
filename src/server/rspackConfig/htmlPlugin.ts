import type {
  HtmlRspackPluginOptions,
  RspackPluginInstance,
} from '@rspack/core';
import rspack from '@rspack/core';

import { omit } from '../utils/omit.js';

import { RENDERER_FILENAME } from './constants.js';
import { hasPlugin, isInstanceOfRspackPlugin } from './plugins.js';

// prettier-ignore
type HtmlWebpackPlugin = RspackPluginInstance & {
  constructor: HtmlWebpackPluginConstructor;
} & (
  | { options: HtmlRspackPluginOptions; userOptions: undefined } // html-webpack-plugin < 5
  | { userOptions: HtmlRspackPluginOptions; options: undefined } // html-webpack-plugin >= 5
  );

type HtmlWebpackPluginConstructor = new (
  options?: HtmlRspackPluginOptions
) => HtmlWebpackPlugin;

export function ensureHtmlPlugin(
  plugins: RspackPluginInstance[]
): RspackPluginInstance[] {
  if (hasPlugin(plugins, 'HtmlWebpackPlugin')) {
    return plugins.map((plugin) =>
      isHtmlWebpackPlugin(plugin) ? changeHtmlPluginFilename(plugin) : plugin
    );
  }

  return [
    ...plugins.filter((plugin) => !isHtmlRspackPlugin(plugin)),
    new rspack.HtmlRspackPlugin({
      title: 'React Cosmos',
      filename: RENDERER_FILENAME,
    }),
  ];
}

function isHtmlWebpackPlugin(
  plugin: RspackPluginInstance
): plugin is HtmlWebpackPlugin {
  return isInstanceOfRspackPlugin(plugin, 'HtmlWebpackPlugin');
}

function isHtmlRspackPlugin(plugin: RspackPluginInstance): boolean {
  return isInstanceOfRspackPlugin(plugin, 'HtmlRspackPlugin');
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
