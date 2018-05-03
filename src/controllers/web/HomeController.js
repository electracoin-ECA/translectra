import BaseController from '..'
import Language from '../../models/Language'
import Project from '../../models/Project'

export default class HomeController extends BaseController {
  get() {
    Project
      .find()
      .sort({ name: 1 })
      .exec((err, projects) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        Language
          .find()
          .sort({ name: 1 })
          .exec((err, languages) => {
            if (err !== null) {
              this.answerError(err)

              return
            }

            this.render('web/home', { languages, projects })
          })
      })
  }
}
