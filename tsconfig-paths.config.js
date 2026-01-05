const tsConfig = require('./tsconfig.json');

module.exports = {
  baseUrl: tsConfig.compilerOptions.baseUrl || '.',
  paths: tsConfig.compilerOptions.paths || {},
};