const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const { response } = require('express')

loginRouter.post('/', async (req, res) => {
    const body = req.body

    const user = await User.findOne({ username: body.username })
    const passwordCorrect = user === null 
                                ? false
                                : await bcrypt.compare(body.password, user.passwordHash)
    
    if(!(user && passwordCorrect)){
        return response.status(401).json(
            { error: 'invalid username of password'}
        )
    }

    const userForToken = {
        username: user.username,
        userId: user.id
    }

    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 } )

    res
        .status(200)
        .send({token, username: user.username, name: user.name })
})

module.exports = loginRouter