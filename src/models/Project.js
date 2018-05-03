import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `The project name is a required field.`],
    unique: [true, `This project name is already taken.`],
  },
  versions: [{
    type: String,
    unique: [true, `You can't have duplicates in your project version names.`],
    validate: {
      validator: v => v.length === 0 || /^v\d+\.\d+.\d+$/.test(v),
      message: `The project versions must be of form "vX.Y.Z" (X, Y & Z being numbers).`,
    },
  }],
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
