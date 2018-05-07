import mongoose from 'mongoose'

import BaseController from '..'
import Key from '../../models/Key'
import Project from '../../models/Project'

export default class ProjectController extends BaseController {
  get() {
    this.apiGet(Project, ['name'], ['author'])
  }

  post() {
    this.req.body.author = this.req.user._id
    this.apiPost(Project, ['name', 'author'])
  }

  put() {
    this.apiPut(Project, ['name'])
  }

  delete() {
    this.isJson = true

    Key.find({ projects: { $elemMatch: { $eq: this.req.params.id } } }, (err, keys) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      this.removeKeys(keys.map(({ _id }) => _id))
        // We remove the project
        .then(() => this.apiDelete(Project))
        .catch(this.answerError.bind(this))
    })
  }
}
