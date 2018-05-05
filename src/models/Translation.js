import mongoose from 'mongoose'

import Key from './Key'
import Language from './Language'
import User from './User'
import Version from './Version'

const translationSchema = new mongoose.Schema({
  key: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Key',
    required: true,
  },
  versions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
  }],
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Language',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  value: {
    type: String,
    required: [true, 'The translation value is a required field.'],
  },
  upVotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  downVotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isAccepted: {
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

translationSchema.path('versions').validate(
  versions => Array.isArray(versions) && versions.length > 0,
  `You must attach at least one version for each translation.`
)

export default mongoose.model('Translation', translationSchema)
