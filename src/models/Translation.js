import mongoose from 'mongoose'

import Key from './Key'
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
  isAccepted: {
    type: Boolean,
    default: false,
  },
  version: {
    type: Number,
    required: true,
    validate: {
      validator: v => v >= 1 || Math.floor(v) === v,
      message: `The translation version must be an integer greater or equal to 1.`,
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

export default mongoose.model('Translation', translationSchema)
