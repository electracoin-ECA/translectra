import BaseController from '..'

export default class ProjectController extends BaseController {
  get() {
    this.render('admin/project')
  }
}
