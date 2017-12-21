import 'babel-polyfill'
import Chai from 'chai'
import ChaiJSONSchema from 'chai-json-schema'
import { Log, Process } from 'mablung'

before(() => {

  Chai.use(ChaiJSONSchema)

  Log.addConsole()

  Log.debug(`- Process.env.DATABASE_URL='${Process.env.DATABASE_URL}'`)
  Log.debug(`- Process.env.URL='${Process.env.URL}'`)

})

after(() => {
})
