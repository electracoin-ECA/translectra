import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

import Project from './Project'
import User from './User'

const keySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, `The key name is a required field.`],
    unique: true,
    validate: {
      validator: v => /^[a-z]+[a-z_]+[a-z]+$/.test(v),
      message: `
        A key code can only contain lowercase letters and underscores.
        It must be contain at least 3 characters and can't start or finish with an underscore.
      `,
    },
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }],
  url: {
    type: String,
    validate: {
      validator: v => v.length === 0 || /^https:\/\//.test(v),
      message: `The key URL must start with "https://".`,
    },
  },
  note: {
    type: String,
  },
  value: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  version: {
    type: Number,
    default: 1,
    validate: {
      validator: v => v >= 1 && Math.floor(v) === v,
      message: `The key version must be an integer greater or equal to 1.`,
    },
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

keySchema.path('projects').validate(v => v && v.length > 0, `You must attach at least one project to a key.`)
// keySchema.path('url').validate(
//   function(v) {
//     return (typeof this.value === 'string' && this.value.length > 0) || (typeof v === 'string' && v.length > 0)
//   },
//   `You must fill either the URL or the value of a key.`
// )
keySchema.path('value').validate(
  function(v) {
    return (typeof this.url === 'string' && this.url.length > 0) || (typeof v === 'string' && v.length > 0)
  },
  `You must fill either the URL or the value of a key.`
)
keySchema.plugin(mongooseUniqueValidator, { message: `This key {PATH} already exists.` })

export default mongoose.model('Key', keySchema)
