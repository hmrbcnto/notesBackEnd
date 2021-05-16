const notesRouter = require('express').Router()
const { response } = require('express')
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = req => {
    const authorization = req.get('Authorization')
    if(authorization && authorization.toLowerCase().startsWith('bearer ')){
        return authorization.substring(7)
    }
    return null
}


notesRouter.get('/', async (req, res) => {
    const notes = await Note.find({})
    res.json(notes)
})

notesRouter.get('/:id', async (req, res) => {
    const noteToView = await Note
                                .findById(req.params.id)
                                .populate('user', {name: 1, username: 1})
    if(noteToView){
        res.json(noteToView.toJSON())
    }
    else{
        res.status(404).end()
    }
})

notesRouter.post('/', async (req, res, next) => {
    const body = req.body
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    console.log('token is ', token)
    console.log('detok is ', decodedToken)
    if(!token || !decodedToken.userId){
        return res.status(401).json( {error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.userId)

    const note = new Note({
        content: body.content,
        important: body.important,
        date: new Date(),
        user: user.id
    })

    const savedNote = await note.save()
    user.notes = user.notes.concat(savedNote._id)

    await user.save()

    res.json(savedNote.toJSON())
})

notesRouter.delete('/:id', async (req, res, next) => {
    await Note.findByIdAndRemove(req.params.id)
    res.status(204).end()
})

notesRouter.put('/:id', (req, res, next) => {
    const body = req.body

    const note = {
        content: body.content,
        important: body.important
    }

    Note.findByIdAndUpdate(req.params.id, note, { new: true })
        .then(updatedNote => {
            res.json(updatedNote)
        })
        .catch(error => next(error))
})

module.exports = notesRouter