import { assert as Assert } from 'chai'
import { Process } from 'mablung'
import _Request from 'axios'

import Server from '../../server/server'

const Request = _Request.create({ 'baseURL': `http://${Process.env.ADDRESS}:${Process.env.PORT}` })

describe('(urls)', () => {

  let staticPaths = Process.env.STATIC_PATH.split(':')
  staticPaths.forEach((staticPath) => {

    describe(`(when the static path is '${staticPath}')`, () => {

      before(async () => {

        await Server.start(
          Process.env.ADDRESS,
          Process.env.PORT,
          staticPath,
          Process.env.MODULES_PATH,
          Process.env.DATABASE_URL)

      })

      describe('200 OK', () => {

        let urls = [
          '/',
          '/favicon.ico',
          '/www',
          '/www/index.html',
          '/www/vendor/material/list/dist/mdc.list.min.css'
        ]

        describe('HEAD', () => {

          urls.forEach((url) => {
            it(`${url} should respond with 200 OK`, async () => {
              Assert.equal((await Request.head(url)).status, 200)
            })
          })

        })

        describe('GET', () => {

          urls.forEach((url) => {
            it(`${url} should respond with 200 OK`, async () => {
              Assert.equal((await Request.get(url)).status, 200)
            })
          })

        })

      })

      describe('404 Not Found', () => {

        let urls = [
          '/index.html'
        ]

        describe('HEAD', () => {

          urls.forEach((url) => {
            it(`${url} should respond with 404 Not Found`, async () => {

              try {

                await Request.head(url)

                Assert.fail()

              } catch (error) {
                // Log.inspect('error', error)
                Assert.equal(error.response.status, 404)
              }

            })
          })

        })

        describe('GET', () => {

          urls.forEach((url) => {
            it(`${url} should respond with 404 Not Found`, async () => {

              try {

                await Request.get(url)

                Assert.fail()

              } catch (error) {
                Assert.equal(error.response.status, 404)
              }

            })
          })

        })

      })

      after(async () => {
        await Server.stop()
      })

    })

  })

})
