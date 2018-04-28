import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

const LanguageSchema = new mongoose.Schema({
  parent: {
    type: Schema.Types.ObjectId,
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
    match: /^[a-z]{2}-[A-Z]{2}$/,
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

LanguageSchema.plugin(mongooseUniqueValidator)

export default mongoose.model('Language', LanguageSchema)
