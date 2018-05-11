import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'
import R from 'ramda'

import User from './User'

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `The project name is a required field.`],
    unique: [true, `This project name is already taken.`],
  },
  type: {
    type: String,
    enum: ['DOCUMENTS', 'KEY-VALUE PAIRS'],
    required: [true, `The project type is a required field.`],
  },
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

export default mongoose.model('Project', projectSchema)
