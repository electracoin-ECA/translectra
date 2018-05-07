import BaseController from '..'
import User from '../../models/User'

export default class ProjectController extends BaseController {
  get() {
    User
      .find()
      .sort({ displayName: 1 })
      .exec((err, users) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        this.render('admin/projects', { users })
      })
  }
}
