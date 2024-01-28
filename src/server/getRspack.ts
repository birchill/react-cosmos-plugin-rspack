import type rspack from '@rspack/core';

import { requireFromSilent } from './utils/requireSilent.js';

export function getRspack(rootDir: string) {
  const userRspack = requireFromSilent(
    rootDir,
    '@rspack/core'
  ) as typeof rspack;
  if (!userRspack) {
    console.warn('[Cosmos] rspack dependency missing!');
    console.log(
      'Install using "yarn add --dev @rspack/core" or "npm install --save-dev @rspack/core"'
    );
    return;
  }

  return userRspack.rspack;
}
