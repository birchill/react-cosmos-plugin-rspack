import type { CosmosConfig } from 'react-cosmos';
import type { Configuration, ModuleOptions, RuleSetRule } from '@rspack/core';
import { resolveRspackClientPath } from './resolveRspackClientPath.js';
import { resolveRspackLoaderPath } from './resolveRspackLoaderPath.js';

export function getRspackConfigModule(
  cosmosConfig: CosmosConfig,
  rspackConfig: Configuration
): ModuleOptions {
  return {
    ...rspackConfig.module,
    rules: getRules(cosmosConfig, rspackConfig),
  };
}

function getRules(cosmosConfig: CosmosConfig, { module }: Configuration) {
  const existingRules = (module && module.rules) || [];
  return [...existingRules, getUserImportsLoaderRule(cosmosConfig)];
}

function getUserImportsLoaderRule(cosmosConfig: CosmosConfig): RuleSetRule {
  return {
    loader: resolveRspackLoaderPath(),
    include: resolveRspackClientPath('userImports'),
    options: { cosmosConfig },
  };
}
