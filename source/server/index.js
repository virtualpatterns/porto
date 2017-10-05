import BabelPolyfill from 'babel-polyfill'
import Command from 'commander'
import { Log, Path, Process } from 'mablung'

import Package from '../package.json'
import Server from './server'

const ADDRESS = '0.0.0.0'
const DATABASE_URL = 'mysql://localhost/porto'
const LOG_PATH = Path.join(Process.cwd(), `${Package.name}.log`)
const PORT = 8080
const STATIC_PATH = Path.join(__dirname, '../www')

Command
  .version(Package.version)

Command
  .command('run')
  .description('Run the server')
  .option('--address <address>', `Listening IPv4 or IPv6 address, defaults to ${ADDRESS}`)
  .option('--databaseUrl <url>', `Database URL, defaults to ${DATABASE_URL}`)
  .option('--port <number>', `Listening port, defaults to ${PORT}`)
  .option('--staticPath <path>', `Static file path, defaults to ${Path.trim(STATIC_PATH)}`)
  .option('--logPath <path>', `Log file path, defaults to ${Path.trim(LOG_PATH)}`)
  .action(async (options) => {

    Log.addConsole()
    Log.addFile(options.logPath || LOG_PATH)

    try {

      Process.on('SIGHUP', () => {

        Log.debug('- Process.once(\'SIGHUP\', () => { ... })')

        Log.removeFile(options.logPath || LOG_PATH)
        Log.addFile(options.logPath || LOG_PATH)

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
        Log.error(`    error.message='${error.message}'`)
        Log.error(`    error.stack=\n\n${error.stack}\n`)

        await Server.stop()
        Process.exit(1)

      })

      await Server.start(options.address || ADDRESS, options.port || PORT, options.staticPath || STATIC_PATH, options.databaseUrl || DATABASE_URL)

    }
    catch (error) {

      Log.error('- catch (error) { ... }')
      Log.error(`    error.message='${error.message}'`)
      Log.error(`    error.stack ...\n\n${error.stack}\n`)

      Process.exit(1)

    }

  })

Command
  .parse(Process.argv)
