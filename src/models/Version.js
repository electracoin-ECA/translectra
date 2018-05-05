import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

import Project from './Project'
import User from './User'

const versionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, `The version project is a required field.`],
  },
  name: {
    type: String,
    required: [true, `The version name is a required field.`],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
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

export default mongoose.model('Version', versionSchema)
