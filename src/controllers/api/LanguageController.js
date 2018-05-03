import BaseController from '..'

export default class LanguageController extends BaseController {
  get() {
    this.apiGet(Language, ['name', 'code'], ['country'])
  }

  post() {
    this.apiPost(Language, ['country', 'name', 'code'])
  }

  put() {
    this.apiPut(Language, ['country', 'name', 'code'])
  }

  delete() {
    this.apiDelete(Country)
  }
}
