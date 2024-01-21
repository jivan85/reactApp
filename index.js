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

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if(person){
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error=>next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result=> {
      response.status(204).end()
    })
    .catch(error=>next(error))
})


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

  person.save().then(savedPerson=>{
    response.json(savedPerson)
  })
})

app.put('/api/persons/:id', (request, response) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
  })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// handler of requests with result to errors
app.use(errorHandler)