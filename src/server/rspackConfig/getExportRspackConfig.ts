import * as path from 'node:path';
import type { CosmosConfig } from 'react-cosmos';
import type { Configuration, rspack } from '@rspack/core';

import { createRspackCosmosConfig } from '../cosmosConfig/createRspackCosmosConfig.js';
import { getUserRspackConfig } from './getUserRspackConfig.js';
import { getRspackConfigModule } from './getRspackConfigModule.js';
import { getRspackConfigResolve } from './getRspackConfigResolve.js';
import { ensureHtmlPlugin } from './htmlPlugin.js';
import { getGlobalsPlugin, ignoreEmptyRspackPlugins } from './plugins.js';
import { resolveRspackClientPath } from './resolveRspackClientPath.js';
import { ensureRspackConfigTopLevelAwait } from './rspackConfigTopLevelAwait.js';

export async function getExportRspackConfig(
  cosmosConfig: CosmosConfig,
  userRspack: typeof rspack
): Promise<Configuration> {
  const baseRspackConfig = await getUserRspackConfig(cosmosConfig);
  return {
    ...baseRspackConfig,
    entry: getEntry(),
    output: getOutput(cosmosConfig),
    module: getRspackConfigModule(cosmosConfig, baseRspackConfig),
    resolve: getRspackConfigResolve(cosmosConfig, baseRspackConfig),
    plugins: getPlugins(cosmosConfig, baseRspackConfig, userRspack),
    experiments: getExperiments(baseRspackConfig),
  };
}

function getEntry() {
  // The React devtools hook needs to be imported before any other module that
  // might import React
  const devtoolsHook = resolveRspackClientPath('reactDevtoolsHook');
  const clientIndex = resolveRspackClientPath('index');
  return [devtoolsHook, clientIndex];
}

function getOutput(cosmosConfig: CosmosConfig) {
  const { exportPath, publicUrl } = cosmosConfig;
  const { includeHashInOutputFilename } =
    createRspackCosmosConfig(cosmosConfig);

  return {
    path: path.join(exportPath, publicUrl),
    filename: includeHashInOutputFilename
      ? '[name].[contenthash].js'
      : '[name].js',
    publicPath: publicUrl,
  };
}

function getPlugins(
  cosmosConfig: CosmosConfig,
  baseRspackConfig: Configuration,
  userRspack: typeof rspack
) {
  const existingPlugins = ignoreEmptyRspackPlugins(baseRspackConfig.plugins);
  const globalsPlugin = getGlobalsPlugin(cosmosConfig, userRspack, false);
  // react-cosmos-plugin-webpack configures the NoEmitOnErrorsPlugin, but rspack
  // doesn't appear to support that.

  return ensureHtmlPlugin([...existingPlugins, globalsPlugin]);
}

function getExperiments(baseWebpackConfig: Configuration) {
  return ensureRspackConfigTopLevelAwait(baseWebpackConfig);
}
