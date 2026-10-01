const mongoose = require('mongoose')

const companies = [
  'TCS',
  'Infosys',
  'Wipro',
  'Accenture',
  'Cognizant',
  'Capgemini',
  'IBM',
  'HCLTech',
  'Microsoft',
  'Amazon',
]

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  studentId: { type: String, required: true, trim: true, unique: true },
  department: { type: String, required: true, trim: true },
  year: { type: String, required: true, enum: ['1st year', '2nd year', '3rd year', '4th year'] },
  section: { type: String, required: true, trim: true },
  bloodGroup: { type: String, required: true, enum: ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'] },
  phone: { type: String, required: true, match: /^\d{7,15}$/ },
  fatherName: { type: String, required: true, trim: true },
  motherName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  arrears: {
    type: Number,
    required: true,
    min: 0,
    validate: { validator: Number.isInteger, message: 'Arrears must be a whole number.' },
  },
  companies: {
    type: [{ type: String, enum: companies }],
    default: [],
    validate: {
      validator(value) {
        return value.length <= 4 && new Set(value).size === value.length
      },
      message: 'Choose up to four unique companies.',
    },
  },
}, { timestamps: true })

module.exports = mongoose.models.Registration || mongoose.model('Registration', registrationSchema)