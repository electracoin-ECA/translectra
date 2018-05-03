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
projectSchema.path('versions').validate(v => v && v.length > 0, `You must create at least one version for each project.`)
projectSchema.path('versions').validate(
  v => /^v\d+\.\d+.\d+$/.test(v),
  `The project versions must be of form "vX.Y.Z" (X, Y & Z being numbers).`
)

export default mongoose.model('Project', projectSchema)
