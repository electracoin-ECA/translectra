import BaseController from '..'

export default class UserController extends BaseController {
  get() {
    this.render('admin/user')
  }
}
