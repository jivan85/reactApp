const express = require('express')
const app = express()
const Person = require('./models/person')
const morgan = require('morgan')
app.use(express.json())
const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req,res)
  ].join(' ')
})  )
const persons = [];


app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
    })
})

app.get('/info', (request, response) => {
  response.send(`Phonebook has info for ${persons.length} people.<br/>${new Date()}`)
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 12).padStart(12, 0)
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name||!body.number) {
    return response.status(400).json({ 
      error: 'name or number missing' 
    })
  }

  if(persons.filter(person=>person.name===body.name).length>0){
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savePerson=>{
    response.json(savedPerson)
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})