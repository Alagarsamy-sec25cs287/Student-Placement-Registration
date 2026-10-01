require('dotenv').config()

const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')
const Registration = require('./models/Registration')

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '16kb' }))

app.get('/api/registrations', async (request, response) => {
  try {
    const registrations = await Registration.find().sort({ updatedAt: -1 }).lean()
    response.json({ registrations })
  } catch (error) {
    console.error('Unable to load registrations:', error.message)
    response.status(500).json({ message: 'Unable to load registrations.' })
  }
})

app.post('/api/registrations', async (request, response) => {
  try {
    const registration = new Registration(request.body)
    await registration.validate()
    if (registration.arrears === 0 && registration.companies.length !== 4) {
      response.status(400).json({ message: 'Eligible students must select exactly four company preferences.' })
      return
    }
    if (registration.arrears > 0 && registration.companies.length > 0) {
      response.status(400).json({ message: 'Students with standing arrears cannot select company preferences.' })
      return
    }

    const fields = registration.toObject()
    delete fields._id
    delete fields.__v
    delete fields.createdAt
    delete fields.updatedAt

    const savedRegistration = await Registration.findOneAndUpdate(
      { studentId: registration.studentId },
      { $set: fields },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )

    response.status(200).json({ registration: savedRegistration })
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      response.status(400).json({ message: error.message })
      return
    }
    if (error.code === 11000) {
      response.status(409).json({ message: 'A registration with this student ID already exists.' })
      return
    }

    console.error('Unable to save registration:', error.message)
    response.status(500).json({ message: 'Unable to save registration.' })
  }
})

async function startServer() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is required in server/.env')
  }

  await mongoose.connect(process.env.MONGO_URI)
  app.listen(port, () => console.log(`Registration API listening on port ${port}`))
}

startServer().catch((error) => {
  console.error('Unable to start the registration API:', error.message)
  process.exit(1)
})