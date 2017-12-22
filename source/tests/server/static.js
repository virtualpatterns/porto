import { assert as Assert } from 'chai'
import { Process } from 'mablung'
import _Request from 'axios'

const Request = _Request.create({ 'baseURL': Process.env.SERVER_URL })

describe('(urls)', () => {

  describe('200 OK', () => {

    let urls = [
      '/',
      '/favicon.ico',
      '/www',
      '/www/index.html',
      '/www/vendor/material/list/dist/mdc.list.min.css'
    ]

    describe('HEAD', () => {

      for (let url of urls) {

        it(`${url} should respond with 200 OK`, async () => {
          Assert.equal((await Request.head(url)).status, 200)
        })

      }

    })

    describe('GET', () => {

      for (let url of urls) {

        it(`${url} should respond with 200 OK`, async () => {
          Assert.equal((await Request.get(url)).status, 200)
        })

      }

    })

  })

  describe('404 Not Found', () => {

    let urls = [
      '/index.html'
    ]

    describe('HEAD', () => {

      for (let url of urls) {

        it(`${url} should respond with 404 Not Found`, async () => {

          try {

            await Request.head(url)

            Assert.fail()

          } catch (error) {
            // Log.inspect('error', error)
            Assert.equal(error.response.status, 404)
          }

        })

      }

    })

    describe('GET', () => {

      for (let url of urls) {

        it(`${url} should respond with 404 Not Found`, async () => {

          try {

            await Request.get(url)

            Assert.fail()

          } catch (error) {
            Assert.equal(error.response.status, 404)
          }

        })

      }

    })

  })

})
