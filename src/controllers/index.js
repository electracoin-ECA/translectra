import * as dotenv from 'dotenv'
import * as lexpress from 'lexpress'

dotenv.config()

const HTTP_STATUS_CODE_OK = 200
const HTTP_STATUS_CODE_CREATED = 201
const HTTP_STATUS_CODE_ACCEPTED = 202
const HTTP_STATUS_CODE_BAD_REQUEST = 400
const HTTP_STATUS_CODE_NOT_FOUND = 404
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

    const modelInstance = new Model({
      ...modelData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    modelInstance.save((err) => {
      if (err !== null) {
        this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

        return
      }

      this.res.status(HTTP_STATUS_CODE_CREATED).json({})
    })
  }

  apiPut(Model, fields) {
    this.isJson = true

    const modelData = fields.reduce((prev, field) => {
      prev[field] = this.req.body[field]

      return prev
    }, {})

    Model.findByIdAndUpdate(
      this.req.params.id,
      {
        ...modelData,
        updatedAt: Date.now(),
      },
      // http://mongoosejs.com/docs/validation.html#update-validators
      // https://www.npmjs.com/package/mongoose-unique-validator#find--updates
      {
        context: 'query',
        runValidators: true,
      },
      (err) => {
        if (err !== null) {
          this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

          return
        }

        this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({})
      })
  }

  apiDelete(Model) {
    this.isJson = true

    Model.remove({ _id: this.req.params.id }, err => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({})
    })
  }
}
