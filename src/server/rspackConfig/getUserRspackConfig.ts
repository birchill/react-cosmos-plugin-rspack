import rspack from '@rspack/core';
import * as path from 'node:path';
import {
  CosmosConfig,
  getCliArgs,
  importModule,
  moduleExists,
} from 'react-cosmos';

import { createRspackCosmosConfig } from '../cosmosConfig/createRspackCosmosConfig.js';
import { getDefaultRspackConfig } from './getDefaultRspackConfig.js';
import { getRspackNodeEnv } from './getRspackNodeEnv.js';

type RspackConfig =
  | rspack.Configuration
  // Mirror rspack/webpack API for config functions
  // https://webpack.js.org/configuration/configuration-types/#exporting-a-function
  | ((
      env: unknown,
      _argv: {}
    ) => rspack.Configuration | Promise<rspack.Configuration>);

type RspackOverride = (
  baseConfig: rspack.Configuration,
  env: string
) => rspack.Configuration;

export async function getUserRspackConfig(cosmosConfig: CosmosConfig) {
  const baseRspackConfig = await getBaseRspackConfig(cosmosConfig);
  const { overridePath } = createRspackCosmosConfig(cosmosConfig);

  if (!overridePath || !moduleExists(overridePath)) {
    console.log(
      `[Cosmos] Learn how to override rspack config for cosmos: https://github.com/react-cosmos/react-cosmos/tree/main/docs#webpack-config-override`
    );
    return baseRspackConfig;
  }

  const relPath = path.relative(process.cwd(), overridePath);
  console.log(`[Cosmos] Overriding rspack config at ${relPath}`);

  const module = await importModule<{ default: RspackOverride }>(overridePath);
  const rspackOverride = module.default;

  return rspackOverride(baseRspackConfig, getRspackNodeEnv());
}

async function getBaseRspackConfig(cosmosConfig: CosmosConfig) {
  const { rootDir } = cosmosConfig;
  const { configPath } = createRspackCosmosConfig(cosmosConfig);

  if (!configPath || !moduleExists(configPath)) {
    console.log('[Cosmos] Using default webpack config');
    return getDefaultRspackConfig(rootDir);
  }

  const relPath = path.relative(process.cwd(), configPath);
  console.log(`[Cosmos] Using rspack config found at ${relPath}`);

  const module = await importModule<{ default: RspackConfig }>(configPath);
  const rspackConfig = module.default;

  // XXX Check if this holds for rspack
  // The --env flag matches the webpack CLI convention
  // https://webpack.js.org/api/cli/#env
  const cliArgs = getCliArgs();
  return typeof rspackConfig === 'function'
    ? await rspackConfig(cliArgs.env || getRspackNodeEnv(), cliArgs)
    : rspackConfig;
}
