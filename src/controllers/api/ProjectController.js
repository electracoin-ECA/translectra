import BaseController from '..'
import Project from '../../models/Project'

const HTTP_STATUS_CODE_OK = 200
const HTTP_STATUS_CODE_CREATED = 201
const HTTP_STATUS_CODE_ACCEPTED = 202
const HTTP_STATUS_CODE_BAD_REQUEST = 400
const HTTP_STATUS_CODE_NOT_FOUND = 404
const LIMIT_DEFAULT = 25
const LIMIT_MAX = 100

export default class ProjectController extends BaseController {
  get() {
    this.isJson = true

    const limit = this.req.query.limit !== undefined ? Number(this.req.query.limit) : LIMIT_DEFAULT
    const sortData = {}
    sortData[this.req.query.sortBy] = Number(this.req.query.sortOrder)

    Project
      .find({
        $or: [
          { name:{ $regex: new RegExp( this.req.query.query !== undefined ? this.req.query.query : '', 'i') } },
        ],
      })
      .sort(sortData)
      .limit(limit > LIMIT_MAX ? LIMIT_MAX : limit)
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

    const project = new Project({
      name,
      createdAt: nowDate,
      updatedAt: nowDate,
    })

    project.save((err) => {
      if (err !== null) {
        this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

        return
      }

      this.res.status(HTTP_STATUS_CODE_CREATED).json({})
    })
  }

  put() {
    this.isJson = true

    project.findByIdAndUpdate(
      this.req.params.projectId,
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

    Project.remove({ _id: this.req.params.projectId }, err => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({})
    })
  }
}
