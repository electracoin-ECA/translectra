import BaseController from '..'
import Project from '../../models/Project'

export default class VersionController extends BaseController {
  get() {
    Project
      .find()
      .sort({ name: 1 })
      .exec((err, projects) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        this.render('management/version', { projects })
      })
  }
}
