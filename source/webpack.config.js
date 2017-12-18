import WebPack from 'webpack'

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
    new WebPack.IgnorePlugin(/^winston|\.\/process$/)
  ]
}
