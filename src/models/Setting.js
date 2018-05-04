import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
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

export default mongoose.model('Setting', settingSchema)
