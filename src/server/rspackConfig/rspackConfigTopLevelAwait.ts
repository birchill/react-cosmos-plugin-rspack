import type { Configuration } from '@rspack/core';

export function ensureRspackConfigTopLevelAwait(
  baseWebpackConfig: Configuration
): Configuration['experiments'] {
  const experiments = baseWebpackConfig.experiments || {};
  if (!experiments.topLevelAwait) {
    experiments.topLevelAwait = true;
  }

  return experiments;
}
