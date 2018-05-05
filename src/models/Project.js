import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'
import R from 'ramda'

import User from './User'
import Version from './Version'

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `The project name is a required field.`],
    unique: [true, `This project name is already taken.`],
  },
  versions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, `The project author is a required field.`],
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
projectSchema.path('versions').validate(
  versions => Array.isArray(versions) && versions.length > 0,
  `You must create at least one version for each project.`
)

export default mongoose.model('Project', projectSchema)
