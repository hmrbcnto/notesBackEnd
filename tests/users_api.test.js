const bcrypt = require('bcrypt')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const helper = require('../utils/test_helper')


beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({
        username: 'root',
        passwordHash
    })

    await user.save()
})

const api = supertest(app)

describe('when there is initially one user in the db', () => {


    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'malsdasd',
            name: 'Malsi Dasdasi',
            password: 'asdasdsd'
        }

        await api
                .post('/api/users')
                .send(newUser)
                .expect(200)
                .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        const usernames = usersAtEnd.map(user => user.username)

        expect(usernames).toContain(newUser.username)
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    })

    test('creation fails with proper status code and message if username is already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username:'root',
            name:'superuser',
            password:'salainen'
        }

        await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()

        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})

