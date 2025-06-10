import * as path from 'node:path';
import { CosmosConfig, CosmosConfigPluginArgs } from 'react-cosmos';

import { RENDERER_FILENAME } from './rspackConfig/constants.js';

export async function rspackConfigPlugin({
  config,
}: CosmosConfigPluginArgs): Promise<CosmosConfig> {
  if (config.rendererUrl) {
    return config;
  }

  return {
    ...config,
    rendererUrl: path.join(config.publicUrl, RENDERER_FILENAME),
  };
}
