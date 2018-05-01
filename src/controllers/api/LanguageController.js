import BaseController from '..'
import Country from '../../models/Country'
import Language from '../../models/Language'

const HTTP_STATUS_CODE_OK = 200
const HTTP_STATUS_CODE_CREATED = 201
const HTTP_STATUS_CODE_ACCEPTED = 202
const HTTP_STATUS_CODE_BAD_REQUEST = 400
const HTTP_STATUS_CODE_NOT_FOUND = 404
const LIMIT_DEFAULT = 25
const LIMIT_MAX = 100

export default class LanguageController extends BaseController {
  get() {
    this.isJson = true

    const limit = this.req.query.limit !== undefined ? Number(this.req.query.limit) : LIMIT_DEFAULT
    const sortData = {}
    sortData[this.req.query.sortBy] = Number(this.req.query.sortOrder)

    Language
      .find({
        $or: [
          { name:{ $regex: new RegExp( this.req.query.query !== undefined ? this.req.query.query : '', 'i') } },
          { code:{ $regex: new RegExp( this.req.query.query !== undefined ? this.req.query.query : '', 'i') } },
        ],
      })
      .sort(sortData)
      .limit(limit > LIMIT_MAX ? LIMIT_MAX : limit)
      .populate('country')
      .exec((err, countries) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        this.res.status(HTTP_STATUS_CODE_OK).json(countries)
      })
  }

  post() {
    this.isJson = true

    const { country: countryId, name, code } = this.req.body
    const nowDate = Date.now()

    Country.findById(countryId, (err, country) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      const language = new Language({
        country,
        name,
        code,
        createdAt: nowDate,
        updatedAt: nowDate,
      })

      language.save((err) => {
        if (err !== null) {
          this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

          return
        }

        this.res.status(HTTP_STATUS_CODE_CREATED).json({})
      })
    })

  }

  put() {
    this.isJson = true

    const { country: countryId, name, code } = this.req.body
    const nowDate = Date.now()

    Country.findById(countryId, (err, country) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      Language.findByIdAndUpdate(
        this.req.params.languageId,
        {
          country,
          name,
          code,
          updatedAt: Date.now(),
        },
        (err) => {
          if (err !== null) {
            this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

            return
          }

          this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({})
        })
    })
  }

  delete() {
    this.isJson = true

    Language.remove({ _id: this.req.params.languageId }, err => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({})
    })
  }
}
