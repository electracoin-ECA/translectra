import mongoose from 'mongoose'

import Language from './Language'
import User from './User'

const translationSchema = new mongoose.Schema({
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
  versions: [{
    type: String,
    unique: [true, `You can't have duplicates in your project version names.`],
    validate: {
      validator: v => v.length === 0 || /^v\d+\.\d+.\d+$/.test(v),
      message: `The project versions must be of form "vX.Y.Z" (X, Y & Z being numbers).`,
    },
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

export default mongoose.model('Translation', translationSchema)
