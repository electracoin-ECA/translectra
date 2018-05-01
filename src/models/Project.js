import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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

projectSchema.plugin(mongooseUniqueValidator)

export default mongoose.model('Project', projectSchema)
