import BaseController from '..'
import Project from '../../models/Project'
import User from '../../models/User'

export default class KeyController extends BaseController {
  get() {
    User
      .find()
      .sort({ displayName: 1 })
      .exec((err, users) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        Project
          .find()
          .sort({ name: 1 })
          .exec((err, projects) => {
            if (err !== null) {
              this.answerError(err)

              return
            }

            this.render('management/keys', { projects, users })
          })
      })
  }
}
