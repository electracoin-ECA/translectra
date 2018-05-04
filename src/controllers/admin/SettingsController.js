import BaseController from '..'
import Setting from '../../models/Setting'

export default class SettingsController extends BaseController {
  get() {
    Setting
      .find()
      .sort({ name: 1 })
      .exec((err, settings) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        this.render('admin/settings', { settings })
      })
  }
}
