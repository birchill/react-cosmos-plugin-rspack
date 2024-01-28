import * as path from 'node:path';
import type { CosmosConfig } from 'react-cosmos';
import type { Configuration, ResolveOptions } from '@rspack/core';

import { resolveFromSilent } from '../utils/resolveSilent.js';

export function getRspackConfigResolve(
  cosmosConfig: CosmosConfig,
  rspackConfig: Configuration
): ResolveOptions {
  return resolveLocalReactDeps(cosmosConfig, rspackConfig.resolve);
}

function resolveLocalReactDeps(
  cosmosConfig: CosmosConfig,
  resolve: ResolveOptions = {}
): ResolveOptions {
  const { rootDir } = cosmosConfig;

  let alias = resolve.alias || {};

  // Preserve existing React aliases (eg. when using Preact)
  let reactAlias = hasAlias(alias, 'react');
  let reactDomAlias = hasAlias(alias, 'react-dom');

  if (reactAlias && reactDomAlias) {
    console.log('[Cosmos] React and React DOM aliases found in rspack config');
    return resolve;
  }

  if (reactAlias) {
    console.log('[Cosmos] React alias found in rspack config');
  } else {
    const reactPath = resolveFromSilent(rootDir, 'react');
    if (!reactPath)
      throw new Error(`[Cosmos] Local dependency not found: react`);
    alias = addAlias(alias, 'react', path.dirname(reactPath));
  }

  if (reactDomAlias) {
    console.log('[Cosmos] React DOM alias found in rspack config');
  } else {
    const reactDomPath = resolveFromSilent(rootDir, 'react-dom');
    if (!reactDomPath)
      throw new Error(`[Cosmos] Local dependency not found: react-dom`);
    alias = addAlias(alias, 'react-dom', path.dirname(reactDomPath));
  }

  return { ...resolve, alias };
}

function hasAlias(alias: ResolveOptions['alias'], name: string) {
  if (!alias) return false;

  const exactName = `${name}$`;
  const keys = Object.keys(alias);
  return keys.includes(name) || keys.includes(exactName);
}

function addAlias(
  alias: ResolveOptions['alias'],
  name: string,
  value: string | false | string[]
) {
  return { ...alias, [name]: value };
}
