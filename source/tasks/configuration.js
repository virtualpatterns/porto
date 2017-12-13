import 'babel-polyfill'
import Jake from 'jake'
import { Log } from 'mablung'

namespace('configuration', () => {

  desc('Copy default configuration')
  task('default', [], {}, () => {
    Log.debug('- Copying default configuration ...')
    Jake.cpR('./source/www/configurations/default.json', './source/www/configuration.json', { 'silent': true })
  })

})
