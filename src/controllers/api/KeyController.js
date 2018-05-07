import BaseController from '..'
import Key from '../../models/Key'

import { HTTP_STATUS_CODE_ACCEPTED } from '..'

export default class KeyController extends BaseController {
  get() {
    this.apiGet(Key, ['name', 'value'], ['projects', 'author'])
  }

  post() {
    this.req.body.author = this.req.user._id
    this.apiPost(Key, ['name', 'projects', 'note', 'url', 'value', 'author'])
  }

  put() {
    this.apiPut(Key, ['name', 'projects', 'note', 'url', 'value'])
  }

  delete() {
    this.isJson = true

    this.removeKeys(this.req.params.id)
      .then(() => this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({}))
      .catch(this.answerError.bind(this))
  }
}
