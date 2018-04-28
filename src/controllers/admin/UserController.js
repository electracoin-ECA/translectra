import BaseController from '..'
import User from '../../models/User'

export default class UserController extends BaseController {
  get() {
    User.find((err, users) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      this.render('admin/user', { users })
    })
  }
}
