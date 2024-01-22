import type { CosmosConfig } from 'react-cosmos';
import type rspack from '@rspack/core';

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
  plugins: void | rspack.RspackPluginInstance[],
  pluginName: string
) {
  return (
    plugins &&
    plugins.filter((p) => isInstanceOfRspackPlugin(p, pluginName)).length > 0
  );
}

export function isInstanceOfRspackPlugin(
  plugin: rspack.RspackPluginInstance,
  constructorName: string
) {
  return plugin.constructor && plugin.constructor.name === constructorName;
}

export function ignoreEmptyRspackPlugins(
  plugins: rspack.Configuration['plugins'] = []
) {
  return plugins.filter(Boolean) as rspack.RspackPluginInstance[];
}

function removeTrailingSlash(url: string) {
  return url.replace(/\/$/, '');
}
