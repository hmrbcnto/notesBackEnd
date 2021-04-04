const mongoose = require('mongoose')

if(process.argv.length < 3){
    console.log("Please provide the password as an argument: node mongo.js <password>")
    process.exit(1)
}

const password = process.argv[2]
const database = 'note-app'

const url =
`mongodb+srv://hmrbcnt:${password}@fullstackopenmongodb.lqee8.mongodb.net/${database}?retryWrites=true&w=majority`

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean
})

const Note = mongoose.model('Note', noteSchema)

// const note = new Note({
//     content:'Jonas Bayot',
//     date: new Date(),
//     important: true,
// })

Note.find({}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close
})

// note.save().then(result => {
//     console.log('Note has been saved!')
//     console.log(result)
//     mongoose.connection.close()
// })