import BaseController from '..'
import User from '../../models/User'

export default class UserController extends BaseController {
  get() {
    this.render('admin/user')
  }
}
