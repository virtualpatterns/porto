import 'babel-polyfill'
import Chai from 'chai'
import ChaiJSONSchema from 'chai-json-schema'
import { Log, Process } from 'mablung'

const LOG_PATH = '/var/log/porto/porto-tests.log'

before(() => {

  Chai.use(ChaiJSONSchema)

  Log.addFile(LOG_PATH)

  Log.debug(`- Process.env.DATABASE_URL='${Process.env.DATABASE_URL}'`)
  Log.debug(`- Process.env.SERVER_URL='${Process.env.SERVER_URL}'`)
  Log.debug(`- Process.env.STATIC_URL='${Process.env.STATIC_URL}'`)

})

after(() => {
  Log.removeFile(LOG_PATH)
})
