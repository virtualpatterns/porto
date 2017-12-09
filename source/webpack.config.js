import WebPack from 'webpack'
import WebPackMonitor from 'webpack-monitor'

module.exports = {
  'devtool': 'eval-source-map',
  'entry': {
    'index': [
      'babel-polyfill',
      `${__dirname}/www/scripts/index.js`
    ]
  },
  'node': {
    'fs': 'empty',
    'process': 'mock'
  },
  'output': {
    'filename': '[name].js',
    'path': `${__dirname}/www/scripts/bundles`
  },
  plugins: [
    new WebPack.IgnorePlugin(/^winston|\.\/process$/),
    new WebPackMonitor({
      'capture': true,
      'target': `${__dirname}/www/scripts/bundles/monitor.json`,
      'launch': false
    }),
  ]
}
