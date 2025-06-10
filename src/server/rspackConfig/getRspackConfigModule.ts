import type { CosmosConfig } from 'react-cosmos';
import type { CosmosMode } from 'react-cosmos-core';
import type { Configuration, ModuleOptions, RuleSetRule } from '@rspack/core';
import { resolveRspackClientPath } from './resolveRspackClientPath.js';
import { resolveRspackLoaderPath } from './resolveRspackLoaderPath.js';

export function getRspackConfigModule(
  config: CosmosConfig,
  rspackConfig: Configuration,
  mode: CosmosMode
): ModuleOptions {
  return {
    ...rspackConfig.module,
    rules: getRules(config, rspackConfig, mode),
  };
}

function getRules(
  config: CosmosConfig,
  { module }: Configuration,
  mode: CosmosMode
) {
  const existingRules = (module && module.rules) || [];
  return [...existingRules, getUserImportsLoaderRule(config, mode)];
}

function getUserImportsLoaderRule(
  config: CosmosConfig,
  mode: CosmosMode
): RuleSetRule {
  return {
    include: resolveRspackClientPath('userImports'),
    use: {
      loader: resolveRspackLoaderPath(),
      options: { config, mode },
    },
  };
}
