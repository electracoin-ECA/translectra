import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'
import R from 'ramda'

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `The project name is a required field.`],
    unique: [true, `This project name is already taken.`],
  },
  versions: [String],
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
projectSchema.path('versions').validate(
  versions => Array.isArray(versions) && versions.length > 0,
  `You must create at least one version for each project.`
)
projectSchema.path('versions').validate(
  versions => !Boolean(versions.filter(version => !/^v\d+\.\d+.\d+$/.test(version)).length),
  `The project versions must be of form "vX.Y.Z" (X, Y & Z being numbers).`
)
projectSchema.path('versions').validate(
  versions => versions.length === R.uniq(versions).length,
  `You can't have duplicates in your project versions.`
)

export default mongoose.model('Project', projectSchema)
