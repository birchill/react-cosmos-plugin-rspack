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
  config: CosmosConfig,
  userRspack: typeof rspack
): Promise<Configuration> {
  const baseRspackConfig = await getUserRspackConfig(config);
  return {
    ...baseRspackConfig,
    entry: getEntry(),
    output: getOutput(config),
    module: getRspackConfigModule(config, baseRspackConfig, 'export'),
    resolve: getRspackConfigResolve(config, baseRspackConfig),
    plugins: getPlugins(config, baseRspackConfig, userRspack),
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

function getOutput(config: CosmosConfig) {
  const { exportPath, publicUrl } = config;
  const { includeHashInOutputFilename } = createRspackCosmosConfig(config);

  return {
    path: path.join(exportPath, publicUrl),
    filename: includeHashInOutputFilename
      ? '[name].[contenthash].js'
      : '[name].js',
    publicPath: publicUrl,
  };
}

function getPlugins(
  config: CosmosConfig,
  baseRspackConfig: Configuration,
  userRspack: typeof rspack
) {
  const existingPlugins = ignoreEmptyRspackPlugins(baseRspackConfig.plugins);
  const globalsPlugin = getGlobalsPlugin(config, userRspack, false);
  const noEmitErrorsPlugin = new userRspack.NoEmitOnErrorsPlugin();

  return ensureHtmlPlugin([
    ...existingPlugins,
    globalsPlugin,
    noEmitErrorsPlugin,
  ]);
}

function getExperiments(baseWebpackConfig: Configuration) {
  return ensureRspackConfigTopLevelAwait(baseWebpackConfig);
}
