import BaseController from '..'

export default class DashboardController extends BaseController {
  get() {
    this.render('user/dashboard', { languages, projects })
  }
}
