import 'babel-polyfill'
import Jake from 'jake'
import { Log } from 'mablung'

namespace('configuration', () => {

  desc('Copy default configuration')
  task('default', [], {}, () => {
    Log.debug('- Copying default configuration ...')
    Jake.cpR('./source/www/configurations/default.json', './source/www/configuration.json', { 'silent': true })
  })

  desc('Copy anonymouse configuration')
  task('anonymouse', [], {}, () => {
    Log.debug('- Copying anonymouse configuration ...')
    Jake.cpR('./source/www/configurations/anonymouse.json', './source/www/configuration.json', { 'silent': true })
  })

  desc('Copy static configuration')
  task('static', [], {}, () => {
    Log.debug('- Copying static configuration ...')
    Jake.cpR('./source/www/configurations/static.json', './source/www/configuration.json', { 'silent': true })
  })

})
