import 'babel-polyfill'
import Jake from 'jake'

namespace('configurations', () => {

  desc('Copy default configuration')
  task('default', [], {}, () => {
    Jake.cpR('./source/www/configurations/default.json', './source/www/configuration.json', { 'silent': true })
  })

})
