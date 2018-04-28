import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

const CountrySchema = new mongoose.Schema({
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

CountrySchema.plugin(mongooseUniqueValidator)

export default mongoose.model('Country', CountrySchema)
