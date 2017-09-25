/* eslint-env node */
'use strict';

const path = require('path');

function requirePlugin(pluginName) {
  let plugin = require(pluginName);

  plugin = plugin.__esModule ? plugin.default : plugin;

  // adding `baseDir` ensures that broccoli-babel-transpiler does not
  // issue a warning and opt out of caching
  let pluginPath = require.resolve(`${pluginName}/package`);
  let pluginBaseDir = path.dirname(pluginPath);
  plugin.baseDir = () => pluginBaseDir;

  return plugin;
}

function hasPlugin(plugins, name) {
  for (let maybePlugin of plugins) {
    let plugin = Array.isArray(maybePlugin) ? maybePlugin[0] : maybePlugin;
    let pluginName = typeof plugin === 'string' ? plugin : plugin.name;

    if (pluginName === name) {
      return true;
    }
  }

  return false;
}

module.exports = {
  name: 'ember-cli-error-trapper',

  _getParentOptions: function() {
    let options;

    // The parent can either be an Addon or a Project. If it's an addon,
    // we want to use the app instead. This public method probably wasn't meant
    // for this, but it's named well enough that we can use it for this purpose.
    if (this.parent && !this.parent.isEmberCLIProject) {
      options = this.parent.options = this.parent.options || {};
    } else {
      options = this.app.options = this.app.options || {};
    }

    return options;
  },

  included(app) {
    this._super.included.apply(this, arguments);

    let parentOptions = this._getParentOptions();

    if (!this._registeredWithBabel) {

      let BabelMacros = requirePlugin('babel-macros');

      // Create babel options if they do not exist
      parentOptions.babel = parentOptions.babel || {};

      // Create and pull off babel plugins
      let plugins = parentOptions.babel.plugins = parentOptions.babel.plugins || [];

      if (!hasPlugin('babel-macros')) {
        plugins.unshift(BabelMacros);
      }

      this._registeredWithBabel = true;
    }
  }
};
