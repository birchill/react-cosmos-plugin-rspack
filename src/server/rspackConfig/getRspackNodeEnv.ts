export function getRspackNodeEnv() {
  // Disallow non dev/prod environments, like "test" inside Jest, because
  // they are not supported by rspack
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}
