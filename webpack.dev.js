const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-eval-source-map',
  devServer: {
    port: 8081,
    compress: true,
    contentBase: common.externals.paths.dist,
    watchContentBase: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: [
      // {
      //   context: ['/www.ecb.europa.eu/'],
      //   target: 'https://www.ecb.europa.eu',
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '/www\\.ecb\\.europa\\.eu': ''
      //   }
      // }
      {
        context: ['/xml.meteoservice.ru/'],
        target: 'https://xml.meteoservice.ru',
        changeOrigin: true,
        pathRewrite: {
          '/xml\\.meteoservice\\.ru': ''
        }
      }
    ]
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map'
    })
  ]
});
