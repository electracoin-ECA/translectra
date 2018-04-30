import BaseController from '..'
import Country from '../../models/Country'

export default class CountryController extends BaseController {
  get() {
    this.render('admin/country')
  }
}
