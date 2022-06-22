module.exports = {
  extension: ['ts'],
  spec: 'test/**/*.spec.ts',
  loader: 'ts-node/esm',
  logVerbose: 'true',
  'experimental-specifier-resolution': 'node',
  require: 'source-map-support/register'
};
