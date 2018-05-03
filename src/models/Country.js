import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `The country name is a required field.`],
    unique: true,
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

countrySchema.plugin(mongooseUniqueValidator, { message: `This country {PATH} already exists.` })

export default mongoose.model('Country', countrySchema)
