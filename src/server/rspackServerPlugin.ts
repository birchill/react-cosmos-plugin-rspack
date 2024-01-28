import { CosmosServerPlugin } from 'react-cosmos';
import { rspackConfigPlugin } from './rspackConfigPlugin.js';
import { rspackDevServerPlugin } from './rspackDevServerPlugin.js';
// XXX Up to here
// import { rspackExportPlugin } from './rspackExportPlugin.js';

const rspackServerPlugin: CosmosServerPlugin = {
  name: 'rspack',
  config: rspackConfigPlugin,
  devServer: rspackDevServerPlugin,
  // export: rspackExportPlugin,
};

export default rspackServerPlugin;
