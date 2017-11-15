import BabelPolyfill from 'babel-polyfill'
import { Log, Path, Process } from 'mablung'

before(async function () {

  Log.addFile(Process.env.LOG_PATH)

  Log.debug(`- Process.env.DATABASE_URL='${Process.env.DATABASE_URL}'`)
  Log.debug(`- Process.env.LOG_PATH='${Process.env.LOG_PATH}'`)

})

after(async function () {
})
