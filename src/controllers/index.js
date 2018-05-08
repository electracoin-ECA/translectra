import * as dotenv from 'dotenv'
import * as lexpress from 'lexpress'
import R from 'ramda'

import Key from '../models/Key'
import KeyLanguage from '../models/KeyLanguage'
import Translation from '../models/Translation'

dotenv.config()

export const HTTP_STATUS_CODE_OK = 200
export const HTTP_STATUS_CODE_CREATED = 201
export const HTTP_STATUS_CODE_ACCEPTED = 202
export const HTTP_STATUS_CODE_BAD_REQUEST = 400
export const HTTP_STATUS_CODE_FORBIDDEN = 403
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

  find(Model, searchFields, populationFields) {
    populationFields = populationFields || []

    return new Promise((resolve, reject) => {
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

      populationFields.forEach(populationField => {
        if (typeof populationField === 'string') {
          query.populate(populationField, 'name')

          return
        }

        const populateQuery = { path: populationField.name }
        if (!populationField.isFull) populateQuery.select = 'name'
        if (populationField.subPopulation !== undefined) {
          populateQuery.populate = {
            path: populationField.subPopulation,
            select: 'name',
          }
        }
        query.populate(populateQuery)
      })

      query.exec((err, items) => {
        if (err !== null) {
          reject(err)

          return
        }

        resolve(items)
      })
    })
  }

  findWhere(Model, conditions, sortBy) {
    return new Promise((resolve, reject) => {
      Model
        .find(conditions)
        .sort(`${sortBy}`)
        .exec((err, items) => {
          if (err !== null) {
            reject(err)

            return
          }

          resolve(items)
        })
    })
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

  removeWhere(Model, conditions) {
    return new Promise((resolve, reject) => {
      Model.remove(conditions, (err, items) => {
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

    this.find(Model, searchFields, populationFields)
      .then(items => this.res.status(HTTP_STATUS_CODE_OK).json(items))
      .catch(this.answerError.bind(this))
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
    return Promise.all([
      this.removeWhere(Key, { id: { $in: ids } }),
      this.removeWhere(KeyLanguage, { key: { $in: ids } }),
      this.removeWhere(Translation, { key: { $in: ids } }),
    ])
  }
}
