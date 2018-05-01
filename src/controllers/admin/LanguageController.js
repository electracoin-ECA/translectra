import BaseController from '..'
import Country from '../../models/Country'

export default class LanguageController extends BaseController {
  get() {
    Country
      .find()
      .sort({ name: 1 })
      .exec((err, countries) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        this.render('admin/language', { countries })
      })
  }
}
