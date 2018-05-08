import mongoose from 'mongoose'

import Key from './Key'
import Project from './Project'
import Language from './Language'
import Translation from './Translation'

const keyLanguageSchema = new mongoose.Schema({
  key: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Key',
    required: true,
  },
  version: {
    type: Number,
    validate: {
      validator: v => v >= 1 && Math.floor(v) === v,
      message: `The key language version must be an integer greater or equal to 1.`,
    },
  },
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true,
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
  }],
  translations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Translation',
    unique: true,
  }],
  isDone: {
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

keySchema.path('projects').validate(v => v && v.length > 0, `You must attach at least one project to a key language.`)

export default mongoose.model('KeyLanguage', keyLanguageSchema)
