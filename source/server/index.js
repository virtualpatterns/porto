import 'babel-polyfill'
import Command from 'commander'
import { Log, Path, Process } from 'mablung'

import Package from '../package.json'
import DynamicServer from './dynamic-server'
import StaticServer from './static-server'

const ADDRESS = '0.0.0.0'
const DATABASE_URL = 'mysql://localhost/porto'
const IS_STATIC = false
// const LOG_PATH = Path.join(Process.cwd(), 'porto.log')
const MODULES_PATH = Path.join(__dirname, '../node_modules')
const PORT = 8080
const STATIC_PATH = Path.join(__dirname, '../www')

Command
  .version(Package.version)

Command
  .command('run')
  .description('Run the server')
  .option('--address <address>', `Listening IPv4 or IPv6 address, defaults to ${ADDRESS}`)
  .option('--databaseUrl <url>', `Database URL, defaults to ${DATABASE_URL}`)
  .option('--isStatic', `Static servers are used for testing, defaults to ${IS_STATIC}`)
  .option('--logPath <path>', 'Log file path, defaults to console') // ${Path.trim(LOG_PATH)}
  .option('--modulesPath <path>', `Modules path, defaults to ${Path.trim(MODULES_PATH)}`)
  .option('--port <number>', `Listening port, defaults to ${PORT}`)
  .option('--staticPath <path>', `Static file path, defaults to ${Path.trim(STATIC_PATH)}`)
  .action(async (options) => {

    if (options.logPath) {
      Log.addFile(options.logPath)
    } else {
      Log.addConsole()
    }

    try {

      const Server = options.isStatic ? StaticServer : DynamicServer

      Process.on('SIGHUP', () => {

        Log.debug('- Process.once(\'SIGHUP\', () => { ... })')

        if (options.logPath) {
          Log.removeFile(options.logPath)
          Log.addFile(options.logPath)
        }

      })

      Process.once('SIGINT', async () => {

        Log.debug('- Process.once(\'SIGINT\', async () => { ... })')

        await Server.stop()
        Process.exit()

      })

      Process.once('SIGTERM', async () => {

        Log.debug('- Process.once(\'SIGTERM\', async () => { ... })')

        await Server.stop()
        Process.exit()

      })

      Process.once('uncaughtException', async (error) => {

        Log.error('- Process.once(\'uncaughtException\', async (error) => { ... })')
        Log.error(`-   error.message='${error.message}'`)
        Log.error(`-   error.stack=\n\n${error.stack}\n`)

        await Server.stop()
        Process.exit(1)

      })

      await Server.start(
        options.address || ADDRESS,
        options.port || PORT,
        options.staticPath || STATIC_PATH,
        options.modulesPath || MODULES_PATH,
        options.databaseUrl || DATABASE_URL)

    }
    catch (error) {

      Log.error('- catch (error) { ... }')
      Log.error(`-   error.message='${error.message}'`)
      Log.error(`-   error.stack ...\n\n${error.stack}\n`)

      Process.exit(1)

    }

  })

Command
  .parse(Process.argv)
