import type { Configuration } from '@rspack/core';
import * as path from 'node:path';
import {
  type CosmosConfig,
  getCliArgs,
  importModule,
  moduleExists,
} from 'react-cosmos';

import { createRspackCosmosConfig } from '../cosmosConfig/createRspackCosmosConfig.js';
import { getDefaultRspackConfig } from './getDefaultRspackConfig.js';
import { getRspackNodeEnv } from './getRspackNodeEnv.js';

type RspackConfig =
  | Configuration
  // Mirror rspack/webpack API for config functions
  // https://webpack.js.org/configuration/configuration-types/#exporting-a-function
  | ((env: unknown, _argv: {}) => Configuration | Promise<Configuration>);

type RspackOverride = (baseConfig: Configuration, env: string) => Configuration;

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
    console.log('[Cosmos] Using default rspack config');
    return getDefaultRspackConfig(rootDir);
  }

  const relPath = path.relative(process.cwd(), configPath);
  console.log(`[Cosmos] Using rspack config found at ${relPath}`);

  const module = await importModule<{ default: RspackConfig }>(configPath);
  const rspackConfig = module.default;

  const cliArgs = getCliArgs();
  return typeof rspackConfig === 'function'
    ? // When cliargs.env is falsey, react-cosmos-plugin-webpack passes the result
      // of getRspackNodeEnv() which is the string "production" or "development"
      // but that doesn't seem to be what webpack does:
      //
      // https://github.com/webpack/webpack-cli/blob/79a969fb02c870667d8a3b7035405566d2b4d088/packages/webpack-cli/src/webpack-cli.ts#L1903C35-L1903C43
      await rspackConfig(cliArgs.env || {}, cliArgs)
    : rspackConfig;
}
