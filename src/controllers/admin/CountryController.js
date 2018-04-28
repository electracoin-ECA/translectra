import BaseController from '..'

export default class CountryController extends BaseController {
  get() {
    this.render('admin/country')
  }
}
