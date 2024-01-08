import rspack from '@rspack/core';
import * as path from 'node:path';
import { DevServerPluginArgs, serveStaticDir } from 'react-cosmos';
import { ServerMessage } from 'react-cosmos-core';
// import webpackHotMiddleware from 'webpack-hot-middleware';

/*
import { createWebpackCosmosConfig } from './cosmosConfig/createWebpackCosmosConfig.js';
*/
import { getRspack } from './getRspack.js';
import { getDevRspackConfig } from './rspackConfig/getDevRspackConfig.js';

type RspackConfig = rspack.Configuration & {
  devServer: {
    contentBase: string;
  };
};

export async function rspackDevServerPlugin({
  cosmosConfig,
  platform,
  expressApp,
  sendMessage,
}: DevServerPluginArgs) {
  if (platform !== 'web') {
    return;
  }

  const userRspack = getRspack(cosmosConfig.rootDir);
  if (!userRspack) {
    return;
  }

  // XXX Up to here
  const webpackConfig = (await getDevRspackConfig(
    cosmosConfig
  )) as RspackConfig;

  // Serve static path derived from devServer.contentBase webpack config
  if (cosmosConfig.staticPath === null) {
    const webpackDerivedStaticPath = getWebpackStaticPath(webpackConfig);
    if (webpackDerivedStaticPath !== null) {
      serveStaticDir(
        expressApp,
        path.resolve(cosmosConfig.rootDir, webpackDerivedStaticPath),
        cosmosConfig.publicUrl
      );
    }
  }

  function sendBuildMessage(msg: ServerMessage) {
    sendMessage(msg);
  }

  const rspackCompiler = userRspack(webpackConfig);
  rspackCompiler.hooks.invalid.tap('Cosmos', (filePath) => {
    if (typeof filePath === 'string') {
      const relFilePath = path.relative(process.cwd(), filePath);
      console.log('[Cosmos] webpack build invalidated by', relFilePath);
    } else {
      console.log('[Cosmos] webpack build invalidated by unknown file');
    }
    sendBuildMessage({ type: 'buildStart' });
  });
  rspackCompiler.hooks.failed.tap('Cosmos', () => {
    sendBuildMessage({ type: 'buildError' });
  });
  const onCompilationDone: Promise<void> = new Promise((resolve) => {
    rspackCompiler.hooks.done.tap('Cosmos', (stats) => {
      resolve();
      if (stats.hasErrors()) {
        sendBuildMessage({ type: 'buildError' });
      } else {
        sendBuildMessage({ type: 'buildDone' });
      }
    });
  });

  console.log('[Cosmos] Building webpack...');

  // Why import WDM here instead of at module level? Because it imports webpack,
  // which might not be installed in the user's codebase. If this were to happen
  // the Cosmos server would crash with a cryptic import error. See import here:
  // https://github.com/webpack/webpack-dev-middleware/blob/eb2e32bab57df11bdfbbac19474eb16817d504fe/lib/fs.js#L8
  // Instead, prior to importing WDM we check if webpack is installed and fail
  // gracefully if not.
  const wdmModule = await import('webpack-dev-middleware');
  const wdmInst = wdmModule.default(rspackCompiler as any, {
    // publicPath is the base path for the webpack assets and has to match
    // webpack.output.publicPath
    publicPath: cosmosConfig.publicUrl,
  });

  expressApp.use(wdmInst);

  const { hotReload } = createWebpackCosmosConfig(cosmosConfig);
  if (hotReload) {
    expressApp.use(webpackHotMiddleware(rspackCompiler));
  }

  await onCompilationDone;

  return async () => {
    await new Promise((res) => wdmInst.close(res));
  };
}

function getWebpackStaticPath({ devServer }: RspackConfig) {
  return devServer && typeof devServer.contentBase === 'string'
    ? devServer.contentBase
    : null;
}
