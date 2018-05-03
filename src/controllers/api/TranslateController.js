import BaseController from '..'
import Key from '../../models/Key'
// import Project from '../../models/Project'
// import Translation from '../../models/Translation'

const HTTP_STATUS_CODE_OK = 200
const HTTP_STATUS_CODE_CREATED = 201
const HTTP_STATUS_CODE_ACCEPTED = 202
const HTTP_STATUS_CODE_BAD_REQUEST = 400
const HTTP_STATUS_CODE_NOT_FOUND = 404
const LIMIT_DEFAULT = 10

export default class TranslateController extends BaseController {
  get() {
    this.isJson = true

    Key
      .find({
        $or: [
          { name: { $regex: new RegExp( this.req.query.query !== undefined ? this.req.query.query : '', 'i') } },
          { value: { $regex: new RegExp( this.req.query.query !== undefined ? this.req.query.query : '', 'i') } },
        ],
      })
      .sort({ updatedAt: -1 })
      .limit(LIMIT_DEFAULT)
      .populate('projects')
      .populate('translations')
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
      author: userId,
      translations: [],
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
}
