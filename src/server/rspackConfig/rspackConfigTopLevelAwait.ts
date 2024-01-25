import rspack from '@rspack/core';

export function ensureRspackConfigTopLevelAwait(
  baseWebpackConfig: rspack.Configuration
): rspack.Configuration['experiments'] {
  const experiments = baseWebpackConfig.experiments || {};
  if (!experiments.topLevelAwait) {
    experiments.topLevelAwait = true;
  }

  return experiments;
}
