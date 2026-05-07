import type { CosmosConfig } from 'react-cosmos';
import type {
  Configuration,
  rspack,
  RspackPluginFunction,
  RspackPluginInstance,
} from '@rspack/core';

import { getRspackNodeEnv } from './getRspackNodeEnv.js';

export function getGlobalsPlugin(
  { publicUrl }: CosmosConfig,
  userRspack: typeof rspack,
  devServerOn: boolean
) {
  const cleanPublicUrl = removeTrailingSlash(publicUrl);
  return new userRspack.DefinePlugin({
    // "if (__DEV__)" blocks get stripped when compiling a static export build
    __DEV__: JSON.stringify(devServerOn),
    'process.env.NODE_ENV': JSON.stringify(getRspackNodeEnv()),
    'process.env.PUBLIC_URL': JSON.stringify(cleanPublicUrl),
  });
}

export function hasPlugin(
  plugins: void | RspackPluginInstance[],
  pluginName: string
) {
  return (
    plugins &&
    plugins.filter((p) => isInstanceOfRspackPlugin(p, pluginName)).length > 0
  );
}

export function isInstanceOfRspackPlugin(
  plugin: RspackPluginInstance,
  constructorName: string
) {
  return plugin.constructor && plugin.constructor.name === constructorName;
}

export function ignoreEmptyRspackPlugins(
  plugins: Configuration['plugins'] = []
) {
  return plugins.filter(Boolean) as Array<
    RspackPluginInstance | RspackPluginFunction
  >;
}

function removeTrailingSlash(url: string) {
  return url.replace(/\/$/, '');
}
