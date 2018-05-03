import BaseController from '..'
import Country from '../../models/Country'

export default class CountryController extends BaseController {
  get() {
    this.apiGet(Country, ['name'])
  }

  post() {
    this.apiPost(Country, ['name'])
  }

  put() {
    this.apiPut(Country, ['name'])
  }

  delete() {
    this.apiDelete(Country)
  }
}
