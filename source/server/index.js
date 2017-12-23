import 'babel-polyfill'
import Command from 'commander'
import { Log, Path, Process } from 'mablung'

import Package from '../package.json'
import Server from './server'

Command
  .version(Package.version)

Command
  .command('run')
  .description('Run the server')
  .option('--address <address>', `Listening IPv4 or IPv6 address, defaults to ${Server.DEFAULT_ADDRESS}`)
  .option('--databaseUrl <url>', `Database URL, defaults to ${Server.DEFAULT_DATABASE_URL}`)
  .option('--logPath <path>', 'Log file path, defaults to console')
  .option('--modulesPath <path>', `Modules path, defaults to ${Path.trim(Server.DEFAULT_MODULES_PATH)}`)
  .option('--port <number>', `Listening port, defaults to ${Server.DEFAULT_PORT}`)
  .option('--staticPath <path>', `Static file path, defaults to ${Path.trim(Server.DEFAULT_STATIC_PATH)}`)
  .option('--s3', `S3 servers are used for testing, defaults to ${false}`)
  .action(async (options) => {

    if (options.logPath) {
      Log.addFile(options.logPath)
    } else {
      Log.addConsole()
    }

    try {

      let server = Server.createServer({
        'address' : options.address || Server.DEFAULT_ADDRESS,
        'databaseUrl' : options.databaseUrl || Server.DEFAULT_DATABASE_URL,
        'modulesPath' : options.modulesPath || Server.DEFAULT_MODULES_PATH,
        'port' : options.port || Server.DEFAULT_PORT,
        'staticPath' : options.staticPath || Server.DEFAULT_STATIC_PATH,
        'isS3': !!options.s3
      })

      Process.on('SIGHUP', () => {

        Log.debug('- Process.once(\'SIGHUP\', () => { ... })')

        if (options.logPath) {
          Log.removeFile(options.logPath)
          Log.addFile(options.logPath)
        }

      })

      Process.once('SIGINT', async () => {

        Log.debug('- Process.once(\'SIGINT\', async () => { ... })')

        await server.stop()
        Process.exit(1)

      })

      Process.once('SIGTERM', async () => {

        Log.debug('- Process.once(\'SIGTERM\', async () => { ... })')

        await server.stop()
        Process.exit(1)

      })

      Process.once('uncaughtException', async (error) => {

        Log.error('- Process.once(\'uncaughtException\', async (error) => { ... })')
        Log.error(`-   error.message='${error.message}'`)
        Log.error(`-   error.stack=\n\n${error.stack}\n`)

        await server.stop()
        Process.exit(2)

      })

      await server.start()

    }
    catch (error) {

      Log.error('- catch (error) { ... }')
      Log.error(`-   error.message='${error.message}'`)
      Log.error(`-   error.stack ...\n\n${error.stack}\n`)

      Process.exit(2)

    }

  })

Command
  .parse(Process.argv)
