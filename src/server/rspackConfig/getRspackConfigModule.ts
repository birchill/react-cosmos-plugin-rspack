import { CosmosConfig } from 'react-cosmos';
import rspack from '@rspack/core';
import { resolveRspackClientPath } from './resolveRspackClientPath.js';
import { resolveRspackLoaderPath } from './resolveRspackLoaderPath.js';

export function getRspackConfigModule(
  cosmosConfig: CosmosConfig,
  rspackConfig: rspack.Configuration
): rspack.ModuleOptions {
  return {
    ...rspackConfig.module,
    rules: getRules(cosmosConfig, rspackConfig),
  };
}

function getRules(
  cosmosConfig: CosmosConfig,
  { module }: rspack.Configuration
) {
  const existingRules = (module && module.rules) || [];
  return [...existingRules, getUserImportsLoaderRule(cosmosConfig)];
}

function getUserImportsLoaderRule(
  cosmosConfig: CosmosConfig
): rspack.RuleSetRule {
  return {
    loader: resolveRspackLoaderPath(),
    include: resolveRspackClientPath('userImports'),
    options: { cosmosConfig },
  };
}
