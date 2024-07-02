import { createRequire } from 'node:module';
import * as path from 'node:path';

export function requireFrom(fromDirectory: string, moduleId: string) {
  // Inspired by https://github.com/sindresorhus/import-from
  const require = createRequire(path.resolve(fromDirectory, 'noop.js'));
  return require(moduleId);
}
