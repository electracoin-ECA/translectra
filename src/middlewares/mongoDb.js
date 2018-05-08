import log from '@inspired-beings/log'
import mongoose from 'mongoose'

export default function(req, res, next) {
  if (mongoose.connection.readyState !== 0) {
    next()

    return
  }

  mongoose.connect(process.env.MONGODB_URI)
    .then(() => next())
    .catch(log.err)
}
