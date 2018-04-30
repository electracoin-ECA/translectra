import BaseController from '..'
import Country from '../../models/Country'

const HTTP_STATUS_CODE_OK = 200
const HTTP_STATUS_CODE_CREATED = 201
const HTTP_STATUS_CODE_ACCEPTED = 202
const HTTP_STATUS_CODE_BAD_REQUEST = 400
const HTTP_STATUS_CODE_NOT_FOUND = 404

export default class CountryController extends BaseController {
  get() {
    this.isJson = true

    const sortData = {}
    sortData[this.req.query.sortBy] = Number(this.req.query.sortOrder)

    Country
      .find({
        $or: [
          { name:{ $regex: new RegExp( this.req.query.query !== undefined ? this.req.query.query : '', 'i') } },
        ],
      })
      .sort(sortData)
      .limit(this.req.query.limit !== undefined ? Number(this.req.query.limit) : 25)
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

    const { name } = this.req.body
    const nowDate = Date.now()

    const country = new Country({
      name,
      createdAt: nowDate,
      updatedAt: nowDate,
    })

    country.save((err) => {
      if (err !== null) {
        this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

        return
      }

      this.res.status(HTTP_STATUS_CODE_CREATED).json({})
    })
  }

  put() {
    this.isJson = true

    Country.findByIdAndUpdate(
      this.req.params.countryId,
      {
        name: this.req.body.name,
        updatedAt: Date.now(),
      },
      (err) => {
        if (err !== null) {
          this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

          return
        }

        this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({})
      })
  }

  delete() {
    this.isJson = true

    Country.remove({ _id: this.req.params.countryId }, err => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({})
    })
  }
}
