module.exports = { hooks: { beforePacking } };

function beforePacking(pkg) {
  // Remove development-only fields from published package
  delete pkg.devDependencies;
  delete pkg.engines;
  delete pkg['lint-staged'];
  delete pkg.prettier;
  delete pkg.scripts;

  // Add publication metadata
  pkg.publishedAt = new Date().toISOString();

  return pkg;
}
