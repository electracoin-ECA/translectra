import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: [true, 'This country name is already taken.'],
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
