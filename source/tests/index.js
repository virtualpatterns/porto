import 'babel-polyfill'
import Chai from 'chai'
import ChaiJSONSchema from 'chai-json-schema'
import { Log, Process } from 'mablung'

before(() => {

  Chai.use(ChaiJSONSchema)

  Log.addFile(Process.env.LOG_PATH)

  Log.debug(`- Process.env.ADDRESS='${Process.env.ADDRESS}'`)
  Log.debug(`- Process.env.DATABASE_URL='${Process.env.DATABASE_URL}'`)
  Log.debug(`- Process.env.LOG_PATH='${Process.env.LOG_PATH}'`)
  Log.debug(`- Process.env.MODULES_PATH='${Process.env.MODULES_PATH}'`)
  Log.debug(`- Process.env.PORT='${Process.env.PORT}'`)
  Log.debug(`- Process.env.STATIC_PATH='${Process.env.STATIC_PATH}'`)

})

after(() => {
})
