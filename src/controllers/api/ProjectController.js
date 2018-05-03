import BaseController from '..'
import Project from '../../models/Project'

export default class ProjectController extends BaseController {
  get() {
    this.apiGet(Project, ['name'])
  }

  post() {
    this.apiPut(Project, ['name', 'versions'])
  }

  put() {
    this.apiPut(Project, ['name', 'versions'])
  }

  delete() {
    this.apiDelete(Project)
  }
}
