import * as path from 'node:path';
import { CosmosConfig, fileExists } from 'react-cosmos';

import { resolveLoose } from '../utils/resolveLoose.js';

type RspackCosmosConfig = {
  configPath: null | string;
  overridePath: null | string;
  includeHashInOutputFilename: boolean;
  hotReload: boolean;
  // Related to, but separate from, the 'hotReload' option.
  // Matches to the 'reload' config option in webpack-hot-middleware.
  // If false, location reload will *not* occur when rspack gets stuck updating code.
  reloadOnFail: boolean;
};

type RspackCosmosConfigInput = Partial<RspackCosmosConfig>;

export function createRspackCosmosConfig(
  cosmosConfig: CosmosConfig
): RspackCosmosConfig {
  const { rootDir } = cosmosConfig;
  const configInput: RspackCosmosConfigInput = cosmosConfig.rspack || {};

  return {
    configPath: getRspackConfigPath(configInput, rootDir),
    overridePath: getRspackOverridePath(configInput, rootDir),
    includeHashInOutputFilename: getIncludeHashInOutputFilename(configInput),
    hotReload: getHotReload(configInput),
    reloadOnFail: getReloadOnFail(configInput),
  };
}

function getRspackConfigPath(
  { configPath }: RspackCosmosConfigInput,
  rootDir: string
) {
  if (typeof configPath === 'undefined') {
    return resolveLoose(rootDir, 'rspack.config.js');
  }

  // User can choose to prevent automatical use of an existing rspack.config.js
  // file (relative to the root dir) by setting configPath to null
  if (!configPath) {
    return null;
  }

  const absPath = resolveLoose(rootDir, configPath);
  if (!fileExists(absPath)) {
    const relPath = path.relative(process.cwd(), absPath);
    throw new Error(`rspack config not found at path: ${relPath}`);
  }

  return absPath;
}

function getRspackOverridePath(
  { overridePath }: RspackCosmosConfigInput,
  rootDir: string
) {
  if (typeof overridePath === 'undefined') {
    return resolveLoose(rootDir, 'rspack.override.js');
  }

  // User can choose to prevent automatical use of an existing rspack.override.js
  // file (relative to the root dir) by setting overridePath to null
  if (!overridePath) {
    return null;
  }

  const absPath = resolveLoose(rootDir, overridePath);
  if (!fileExists(absPath)) {
    const relPath = path.relative(process.cwd(), absPath);
    throw new Error(`rspack override module not found at path: ${relPath}`);
  }

  return absPath;
}

// Default value is False to not break backwards compatibility
// In future releases it's better to mark this as @deprecated and set
// output.filename to "[name].[contenthash].js" by default
function getIncludeHashInOutputFilename({
  includeHashInOutputFilename = false,
}: RspackCosmosConfigInput) {
  return includeHashInOutputFilename;
}

function getHotReload({ hotReload = true }: RspackCosmosConfigInput) {
  return hotReload;
}

function getReloadOnFail({ reloadOnFail = false }: RspackCosmosConfigInput) {
  return reloadOnFail;
}
