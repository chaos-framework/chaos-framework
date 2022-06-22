const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      webpackConfig.resolve.symlinks = true;
      webpackConfig.resolve.alias.react = path.resolve('./node_modules/react');
      return webpackConfig;
    }
  }
};
