import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

import Country from './Country'

const languageSchema = new mongoose.Schema({
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: v => v.length === 0 || /^[a-z]{2}-[A-Z]{2}$/.test(v),
      message: `The language code must be of form "xx-XX".`,
    },
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
})

languageSchema.plugin(mongooseUniqueValidator)

export default mongoose.model('Language', languageSchema)
