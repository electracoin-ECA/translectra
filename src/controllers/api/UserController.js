import BaseController from '..'
import User from '../../models/User'

export default class UserController extends BaseController {
  get() {
    this.apiGet(User, ['name', 'email'])
  }

  put() {
    this.apiPut(User, ['isAdmin', 'isManager'])
  }

  delete() {
    this.apiDelete(User)
  }
}
