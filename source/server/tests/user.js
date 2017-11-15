import Assert from 'assert'
import Faker from 'faker'
import { Process } from 'mablung'

import Database from '../library/database'

describe('user (database)', () => {

  before(async function () {
    await Database.open(Process.env.DATABASE_URL)
  })

  describe('insertUser', () => {

    describe('(when the user name is new)', () => {

      let userId = null
      let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async function () {
        userId = await Database.insertUser(name)
      })

      it('should create the user', async function () {
        Assert.ok(await Database.existsUser(name))
      })

      after(async function () {
        await Database.deleteUser(name)
      })

    })

    describe('(when the user name exists)', () => {

      let userId = null
      let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async function () {
        userId = await Database.insertUser(name)
      })

      it('should throw an error', async function () {

        try {
          await Database.insertUser(name)
          Assert.fail()
        }
        catch (error) {}

      })

      after(async function () {
        await Database.deleteUser(name)
      })

    })

  })

  describe.only('updateUser', () => {

    describe('(when the user name does not exist)', () => {

      let userId = null

      let name0 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`
      let name1 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async function () {

        userId = await Database.insertUser(name0)
        await Database.updateUser(name0, name1)

      })

      it('should update the user', async function () {
        Assert.ok(await Database.existsUser(name1))
      })

      after(async function () {
        await Database.deleteUser(name1)
      })

    })

    describe('(when the user name exists)', () => {

      let userId0 = null
      let name0 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      let userId1 = null
      let name1 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async function () {

        userId0 = await Database.insertUser(name0)
        userId1 = await Database.insertUser(name1)

      })

      it('should throw an error', async function () {

        try {
          await Database.updateUser(name0, name1)
          Assert.fail()
        }
        catch (error) {}

      })

      after(async function () {

        await Database.deleteUser(name1)
        await Database.deleteUser(name0)

      })

    })

  })

  describe('deleteUser', () => {

    describe('(when the user exists)', () => {

      let userId = null
      let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async function () {
        userId = await Database.insertUser(name)
        await Database.deleteUser(name)
      })

      it('should delete the user', async function () {
        Assert.ok(!await Database.existsUser(name))
      })

    })

    describe('(when the user does not exist)', () => {

      it('should not throw an error', async function () {
        await Database.deleteUser(`${Faker.name.lastName()}, ${Faker.name.firstName()}`)
      })

    })

  })

  describe('existsUser', () => {

    describe('(when the user does not exist)', () => {

      it('should be false', async function () {
        Assert.ok(!await Database.existsUser(`${Faker.name.lastName()}, ${Faker.name.firstName()}`))
      })

    })

    describe('(when the user exists)', () => {

      let userId = null
      let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async function () {
        userId = await Database.insertUser(name)
      })

      it('should be true', async function () {
        Assert.ok(await Database.existsUser(name))
      })

      after(async function () {
        await Database.deleteUser(name)
      })

    })

  })

  after(async function () {
    await Database.close()
  })

})
