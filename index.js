'use strict';
const path = require('path');
const loaderPath = require.resolve('html-webpack-plugin/lib/loader.js');

function HtmlWebpackMultiBuildPlugin(options) {
    this.options = options;
    this.js = [];
}

HtmlWebpackMultiBuildPlugin.prototype = {
    apply: function(compiler) {
        if (compiler.hooks) {
            // webpack 4 support
            compiler.hooks.compilation.tap('HtmlWebpackMultiBuildPlugin', compilation => {
                compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tapAsync(
                    'HtmlWebpackMultiBuildPlugin',
                    this.beforeHtmlGeneration.bind(this),
                );
            });
        } else {
            compiler.plugin('compilation', compilation => {
                compilation.plugin('html-webpack-plugin-before-html-generation', this.beforeHtmlGeneration.bind(this));
            });
        }
    },

    beforeHtmlGeneration: function(data, cb) {
        this.js = this.js.concat(data.assets.js);
        if (data.plugin.options.multiBuildMode) {
            data.plugin.options.template = loaderPath + '!' + path.join(__dirname, 'template.ejs')
        }
        data.assets.js = this.js;
        data.plugin.options.modernScripts = this.js.filter((value) => value.indexOf('legacy') === -1);
        data.plugin.options.legacyScripts = this.js.filter((value) => value.indexOf('legacy') > 0);
        cb(null, data);
    },
};

module.exports = HtmlWebpackMultiBuildPlugin;