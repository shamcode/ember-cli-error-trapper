/* eslint-env node */
'use strict';

const path = require( 'path' );
const mergeTrees = require( 'broccoli-merge-trees' );
const concat = require( 'broccoli-concat' );
const Funnel = require( 'broccoli-funnel' );
const { map } = require( 'broccoli-stew' );

function requirePlugin( pluginName ) {
  let plugin = require( pluginName );

  plugin = plugin.__esModule ? plugin.default : plugin;

  // adding `baseDir` ensures that broccoli-babel-transpiler does not
  // issue a warning and opt out of caching
  let pluginPath = require.resolve( `${pluginName}/package` );
  let pluginBaseDir = path.dirname( pluginPath );
  plugin.baseDir = () => pluginBaseDir;

  return plugin;
}

function hasPlugin( plugins, name ) {
  for ( let maybePlugin of plugins ) {
    let plugin = Array.isArray( maybePlugin ) ? maybePlugin[ 0 ] : maybePlugin;
    let pluginName = typeof plugin === 'string' ? plugin : plugin.name;

    if ( pluginName === name ) {
      return true;
    }
  }

  return false;
}

module.exports = {
  name: 'ember-cli-error-trapper',

  _getParentOptions() {
    let options;

    // The parent can either be an Addon or a Project. If it's an addon,
    // we want to use the app instead. This public method probably wasn't meant
    // for this, but it's named well enough that we can use it for this purpose.
    if ( this.parent && !this.parent.isEmberCLIProject ) {
      options = this.parent.options = this.parent.options || {};
    } else {
      options = this.app.options = this.app.options || {};
    }

    return options;
  },

  _errorTrapperDir() {
    return path.dirname( require.resolve( 'error-trapper' ) );
  },

  treeForPublic( tree ) {
    const trees = [];

    if ( undefined !== tree ) {
      trees.push( tree );
    }

    const errorTrapperPreBuildTree = path.join( this._errorTrapperDir(), 'lib' );

    trees.push( concat( errorTrapperPreBuildTree, {
      inputFiles: [
        'esprima-bundle.js'
      ],
      outputFile: '/assets/esprima-bundle.js'
    } ) );

    return mergeTrees( trees );
  },

  treeForVendor( tree ) {
    const trees = [];

    if ( undefined !== tree ) {
      trees.push( tree );
    }


    let errorTrapperTree = new Funnel( this._errorTrapperDir(), {
      include: [ 'index.js' ],
      destDir: 'error-trapper',
    } );

    // Wrap module
    errorTrapperTree = map( errorTrapperTree, ( content ) => {
      return `(function(define){${content}})((function() {
      function newDefine() {
          return define.apply(null, arguments);
      }
      ;newDefine.amd = true;
      return newDefine;})());`;
    } );

    trees.push( errorTrapperTree );

    return mergeTrees( trees, { overwrite: true } );
  },

  included( app ) {
    this._super.included.apply( this, arguments );

    let parentOptions = this._getParentOptions();

    if ( !this._registeredWithBabel ) {

      let BabelMacros = requirePlugin( 'babel-macros' );

      // Create babel options if they do not exist
      parentOptions.babel = parentOptions.babel || {};

      // Create and pull off babel plugins
      let plugins = parentOptions.babel.plugins = parentOptions.babel.plugins || [];

      if ( !hasPlugin( 'babel-macros' ) ) {
        plugins.unshift( BabelMacros );
      }

      this._registeredWithBabel = true;
    }

    app.import( 'vendor/error-trapper/index.js' );
  }
};
