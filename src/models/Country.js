import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'The country name is a required field.'],
    unique: [true, 'This country name already exists.'],
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

countrySchema.plugin(mongooseUniqueValidator)

export default mongoose.model('Country', countrySchema)
