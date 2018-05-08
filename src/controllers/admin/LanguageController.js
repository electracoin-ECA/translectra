import BaseController from '..'

export default class LanguageController extends BaseController {
  get() {
    this.render('admin/languages')
  }
}
