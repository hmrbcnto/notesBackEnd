const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note')
const helper = require('../utils/test_helper')

beforeEach(async () => {
    await Note.deleteMany({})

    const noteObjects = helper.initialNotes.map(note => new Note(note))
    const promiseArray = noteObjects.map(note => note.save())
    await Promise.all(promiseArray)
})

const api = supertest(app)

describe('when there is initially some notes saved', () => {
    test('notes are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type',/application\/json/)
    })

    test('all notes are returned', async () => {
        const response = await api.get('/api/notes')
    
        expect(response.body).toHaveLength(helper.initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
        const response = await api.get('/api/notes')
        const notesContent = response.body.map(note => note.content)

        expect(notesContent).toContain("Browser can execute only Javascript")
    })

    describe('viewing a specific note', () => {
        test('succeeds with valid id', async () => {
            const notesAtStart = await helper.notesInDb()
    
            const noteToView = notesAtStart[0]
    
            const result = await api
                                    .get(`/api/notes/${noteToView.id}`)
                                    .expect(200)
                                    .expect('Content-Type', /application\/json/)
            
            const processedNoteToView = JSON.parse(JSON.stringify(noteToView))
            
            expect(result.body).toEqual(processedNoteToView)
        })
    
        test('fails with status code 404 for nonexisting ids', async () => {
            const validNonExistingId = await helper.nonExistingId()
    
            await api
                    .get(`/api/notes/${validNonExistingId}`)
                    .expect(404)
        })
    
        test('fails with status code 400 for invalid ids', async () => {
            const invalidId = '5a3d5da5445'
    
            await api
                    .get(`/api/notes/${invalidId}`)
                    .expect(400)
        })
    })

    describe('addition of a new note', () => {
        test('succeeds with valid data', async () => {
            const newNote = {
                content: 'async/await simplifies making async calls',
                important: true
            }
        
            await api
                    .post('/api/notes')
                    .send(newNote)
                    .expect(200)
                    .expect('Content-Type', /application\/json/)
            
            const notesAtEnd = await helper.notesInDb()
            expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)
        
            const contents = notesAtEnd.map(note => note.content)
        
            expect(contents).toContain('async/await simplifies making async calls')
        })
    
        test('fails with status code 400 if data invalid', async () => {
            const newNote = {
                important: true
            }
    
            await api
                    .post('/api/notes')
                    .send(newNote)
                    .expect(400)
    
            const notesAtEnd = await helper.notesInDb()
    
            expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
        })
    })
    
    describe('deletion of a note',  () => {
        test('succeeds with error 204 if successful', async () => {
            const notesAtStart = await helper.notesInDb()
            const toDelete = notesAtStart[0]
    
            await api
                    .delete(`/api/notes/${notesAtStart[0].id}`)
                    .expect(204)
            
            const notesAtEnd = await helper.notesInDb()
    
            expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)
    
            const contentAtEnd = notesAtEnd.map(note => note.content)
            expect(contentAtEnd).not.toContain(toDelete.content)
        })
    
    
    })


})







test('a note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()
    const noteToDelete = notesAtStart[0]

    await api
            .delete(`/api/notes/${noteToDelete.id}`)
            .expect(204)
    
    const notesAtEnd = await helper.notesInDb()
    expect(notesAtEnd).toHaveLength(notesAtStart.length-1)

    const contents = notesAtEnd.map(r => r.content)
    expect(contents).not.toContain(noteToDelete.content)
})

afterAll(() => {
    mongoose.connection.close()
})