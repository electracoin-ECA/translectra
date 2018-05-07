import * as dotenv from 'dotenv'
import * as lexpress from 'lexpress'
import R from 'ramda'

import Key from '../models/Key'
import Translation from '../models/Translation'

dotenv.config()

export const HTTP_STATUS_CODE_OK = 200
export const HTTP_STATUS_CODE_CREATED = 201
export const HTTP_STATUS_CODE_ACCEPTED = 202
export const HTTP_STATUS_CODE_BAD_REQUEST = 400
export const HTTP_STATUS_CODE_NOT_FOUND = 404
const LIMIT_DEFAULT = 25
const LIMIT_MAX = 100
const VERSION = require('../../package.json').version

export default class BaseController extends lexpress.BaseController {
  render(view, data) {
    data = data || {}
    const global = {
      me: this.req.user,
      version: VERSION,
      websiteName: process.env.WEBSITE_NAME,
    }

    this.res.render(view, { ...data, flash: this.req.flash(), global })
  }

  create(Model, data) {
    return new Promise((resolve, reject) => {
      const modelInstance = new Model({
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      modelInstance.save((err, item) => {
        if (err !== null) {
          reject(err)

          return
        }

        resolve(item)
      })
    })
  }

  update(Model, id, data) {
    return new Promise((resolve, reject) => {
      Model.findByIdAndUpdate(
        id,
        {
          ...data,
          updatedAt: Date.now(),
        },
        // http://mongoosejs.com/docs/validation.html#update-validators
        // https://www.npmjs.com/package/mongoose-unique-validator#find--updates
        {
          context: 'query',
          runValidators: true,
        },
        (err, item) => {
          if (err !== null) {
            reject(err)

            return
          }

          resolve(item)
        })
    })
  }

  remove(Model, idOrIds) {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds]

    return new Promise((resolve, reject) => {
      Model.remove({ _id: { $in: ids } }, (err, items) => {
        if (err !== null) {
          reject(err)

          return
        }

        resolve(items)
      })
    })
  }

  apiGet(Model, searchFields, populationFields) {
    populationFields = populationFields || []
    this.isJson = true

    const conditions = searchFields.reduce((prev, searchField) => {
      const nextOr = {}
      nextOr[searchField] = { $regex: new RegExp( this.req.query.query !== undefined ? this.req.query.query : '', 'i') }
      prev.$or.push(nextOr)

      return prev
    }, { $or: [] })
    const limit = this.req.query.limit !== undefined ? Number(this.req.query.limit) : LIMIT_DEFAULT

    let query = Model
      .find(conditions)
      .sort(`${this.req.query.sortOrder === '-1' ? '-' : ''}${this.req.query.sortBy}`)
      .limit(limit > LIMIT_MAX ? LIMIT_MAX : limit)

    populationFields.forEach(populationField => query = query.populate(populationField, 'name'))

    query.exec((err, items) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      this.res.status(HTTP_STATUS_CODE_OK).json(items)
    })
  }

  apiPost(Model, fields) {
    this.isJson = true

    const modelData = fields.reduce((prev, field) => {
      prev[field] = this.req.body[field]

      return prev
    }, {})

    this.create(Model, modelData)
      .then(() => this.res.status(HTTP_STATUS_CODE_CREATED).json({}))
      .catch(err => this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors))
  }

  apiPut(Model, fields) {
    this.isJson = true

    const modelData = fields.reduce((prev, field) => {
      prev[field] = this.req.body[field]

      return prev
    }, {})

    this.update(Model, this.req.params.id, modelData)
      .then(() => this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({}))
      .catch(err => this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors))
  }

  apiDelete(Model) {
    this.isJson = true

    this.remove(Model, this.req.params.id)
      .then(() => this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({}))
      .catch(err => this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err))
  }

  removeKeys(ids) {
    return new Promise((resolve, reject) => {
      Key.find({ _id: { $in: ids } }, (err, keys) => {
        if (err !== null) {
          reject(err)

          return
        }

        return Promise.all([
          // We remove the project from the related keys
          ...keys.map(({ translations }) => this.remove(Translation, translations)),
          this.remove(Key, ids),
        ])
      })
    })
  }
}
