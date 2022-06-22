module.exports = {
  extension: ['ts', 'tsx'],
  spec: 'test/**/*.spec.{ts,tsx}',
  loader: 'ts-node/esm',
  logVerbose: 'true',
  'experimental-specifier-resolution': 'node',
  require: ['source-map-support/register', 'jsdom-global/register']
};
