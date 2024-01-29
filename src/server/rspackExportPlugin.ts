import type { ExportPluginArgs } from 'react-cosmos';
import type { Configuration, rspack, StatsCompilation } from '@rspack/core';

import { getRspack } from './getRspack.js';
import { getExportRspackConfig } from './rspackConfig/getExportRspackConfig.js';

export async function rspackExportPlugin({ cosmosConfig }: ExportPluginArgs) {
  const userRspack = getRspack(cosmosConfig.rootDir);
  if (!userRspack) {
    return;
  }

  const rspackConfig = await getExportRspackConfig(cosmosConfig, userRspack);
  try {
    await runRspackCompiler(userRspack, rspackConfig);
  } catch (err) {
    const rspackError = err as RspackCompilationError;
    if (rspackError.rspackErrors) {
      rspackError.rspackErrors.forEach((error) => {
        console.error(`${error}\n`);
      });
    }
    throw rspackError;
  }
}

function runRspackCompiler(
  userRspack: typeof rspack,
  rspackConfig: Configuration
) {
  return new Promise((resolve, reject) => {
    const compiler = userRspack(rspackConfig);
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
      } else if (stats?.hasErrors()) {
        const error = new RspackCompilationError();
        error.rspackErrors = stats.toJson().errors;
        reject(error);
      } else {
        resolve(stats);
      }
    });
  });
}

class RspackCompilationError extends Error {
  rspackErrors?: StatsCompilation['StatsError'][];
  constructor() {
    super('Rspack errors occurred');
  }
}
