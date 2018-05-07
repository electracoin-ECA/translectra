import mongoose from 'mongoose'

import BaseController from '..'
import Key from '../../models/Key'
import Project from '../../models/Project'

import {
  HTTP_STATUS_CODE_BAD_REQUEST,
  HTTP_STATUS_CODE_CREATED,
} from '..'

export default class ProjectController extends BaseController {
  get() {
    this.apiGet(Project, ['name'], ['author'])
  }

  post() {
    this.req.body.author = this.req.user._id
    this.apiPost(Project, ['name', 'author'])
  }

  put() {
    this.apiPost(Project, ['name'])
  }

  delete() {
    this.apiDelete(Project)
  }
}
