import BaseController from '..'
import Key from '../../models/Key'
import Project from '../../models/Project'

const HTTP_STATUS_CODE_OK = 200
const HTTP_STATUS_CODE_CREATED = 201
const HTTP_STATUS_CODE_ACCEPTED = 202
const HTTP_STATUS_CODE_BAD_REQUEST = 400
const HTTP_STATUS_CODE_NOT_FOUND = 404
const LIMIT_DEFAULT = 25
const LIMIT_MAX = 100

export default class KeyController extends BaseController {
  get() {
    this.isJson = true

    const limit = this.req.query.limit !== undefined ? Number(this.req.query.limit) : LIMIT_DEFAULT
    const sortData = {}
    sortData[this.req.query.sortBy] = Number(this.req.query.sortOrder)

    Key
      .find({
        $or: [
          { name: { $regex: new RegExp( this.req.query.query !== undefined ? this.req.query.query : '', 'i') } },
          { value: { $regex: new RegExp( this.req.query.query !== undefined ? this.req.query.query : '', 'i') } },
        ],
      })
      .sort(sortData)
      .limit(limit > LIMIT_MAX ? LIMIT_MAX : limit)
      .populate('createdBy')
      .populate('projects')
      .exec((err, keys) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        this.res.status(HTTP_STATUS_CODE_OK).json(keys)
      })
  }

  post() {
    this.isJson = true

    const userId = this.req.user._id
    const { name, projects, note, url, value } = this.req.body
    const nowDate = Date.now()

    const key = new Key({
      name,
      projects,
      note,
      url,
      value,
      createdBy: userId,
      createdAt: nowDate,
      updatedAt: nowDate,
    })

    key.save((err) => {
      if (err !== null) {
        this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

        return
      }

      this.res.status(HTTP_STATUS_CODE_CREATED).json({})
    })
  }

  put() {
    this.isJson = true

    const userId = this.req.user._id
    const { name, projects, note, url, value } = this.req.body
    const nowDate = Date.now()

    Key.findByIdAndUpdate(
      this.req.params.keyId,
      {
        name,
        projects,
        note,
        url,
        value,
        createdBy: userId,
        updatedAt: Date.now(),
      },
      (err) => {
        if (err !== null) {
          this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

          return
        }

        this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({})
      }
    )
  }

  delete() {
    this.isJson = true

    Key.remove({ _id: this.req.params.keyId }, err => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({})
    })
  }
}
