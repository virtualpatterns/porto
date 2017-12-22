import { assert as Assert } from 'chai'
import Faker from 'faker'
import { Process } from 'mablung'

import Database from '../../server/database'

describe('insertUser ...', () => {

  let connection = null

  before(async () => {
    connection = await Database.open(Process.env.DATABASE_URL)
  })

  describe('insertUser', () => {

    describe('(when inserting a new user name)', () => {

      let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async () => {
        await connection.insertUser(name)
      })

      it('should create the user', async () => {
        Assert.ok(await connection.existsUser(name))
      })

      after(async () => {
        await connection.deleteUser(name)
      })

    })

    describe('(when inserting an existing user name)', () => {

      let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async () => {
        await connection.insertUser(name)
      })

      it('should throw an error', async () => {

        try {

          await connection.insertUser(name)

          Assert.fail()

        } catch (error) {
          // OK
        }

      })

      after(async () => {
        await connection.deleteUser(name)
      })

    })

  })

  describe('updateUser', () => {

    describe('(when updating to a new user name)', () => {

      let name0 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`
      let name1 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async () => {

        await connection.insertUser(name0)
        await connection.updateUser(name0, name1)

      })

      it('should update the user', async () => {
        Assert.ok(await connection.existsUser(name1))
      })

      after(async () => {
        await connection.deleteUser(name1)
      })

    })

    describe('(when updating to an existing user name)', () => {

      let name0 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`
      let name1 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async () => {

        await connection.insertUser(name0)
        await connection.insertUser(name1)

      })

      it('should throw an error', async () => {

        try {

          await connection.updateUser(name0, name1)

          Assert.fail()

        } catch (error) {
          // OK
        }

      })

      after(async () => {

        await connection.deleteUser(name1)
        await connection.deleteUser(name0)

      })

    })

  })

  describe('deleteUser', () => {

    describe('(when deleting a user that exists)', () => {

      let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async () => {

        await connection.insertUser(name)
        await connection.deleteUser(name)

      })

      it('should delete the user', async () => {
        Assert.ok(!await connection.existsUser(name))
      })

    })

    describe('(when deleting a user that does not exist)', () => {

      it('should not throw an error', async () => {
        await connection.deleteUser(`${Faker.name.lastName()}, ${Faker.name.firstName()}`)
      })

    })

  })

  describe('deleteAllUsers', () => {

    let name0 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`
    let name1 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`
    let name2 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

    before(async () => {

      await connection.insertUser(name0)
      await connection.insertUser(name1)
      await connection.insertUser(name2)

      await connection.deleteAllUsers()

    })

    it('should delete the first user', async () => {
      Assert.ok(!await connection.existsUser(name0))
    })

    it('should delete the second user', async () => {
      Assert.ok(!await connection.existsUser(name1))
    })

    it('should delete the third user', async () => {
      Assert.ok(!await connection.existsUser(name2))
    })

    after(async () => {

      await connection.restoreAllUsers()

      await connection.deleteUser(name2)
      await connection.deleteUser(name1)
      await connection.deleteUser(name0)

    })

  })

  describe('restoreAllUsers', () => {

    let name0 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`
    let name1 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`
    let name2 = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

    before(async () => {

      await connection.insertUser(name0)
      await connection.insertUser(name1)
      await connection.insertUser(name2)

      await connection.deleteAllUsers()
      await connection.restoreAllUsers()

    })

    it('should restore the first user', async () => {
      Assert.ok(await connection.existsUser(name0))
    })

    it('should restore the second user', async () => {
      Assert.ok(await connection.existsUser(name1))
    })

    it('should restore the third user', async () => {
      Assert.ok(await connection.existsUser(name2))
    })

    after(async () => {

      await connection.deleteUser(name2)
      await connection.deleteUser(name1)
      await connection.deleteUser(name0)

    })

  })

  describe('existsUser', () => {

    describe('(when the user does not exist)', () => {

      it('should be false', async () => {
        Assert.ok(!await connection.existsUser(`${Faker.name.lastName()}, ${Faker.name.firstName()}`))
      })

    })

    describe('(when the user exists)', () => {

      let name = `${Faker.name.lastName()}, ${Faker.name.firstName()}`

      before(async () => {
        await connection.insertUser(name)
      })

      it('should be true', async () => {
        Assert.ok(await connection.existsUser(name))
      })

      after(async () => {
        await connection.deleteUser(name)
      })

    })

  })

  after(async () => {
    await connection.close()
  })

})
