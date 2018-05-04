import BaseController from '..'
import Version from '../../models/Version'

export default class VersionController extends BaseController {
  get() {
    this.apiGet(Version, ['name'], ['country'])
  }

  post() {
    this.apiPost(Version, ['project', 'name'])
  }

  put() {
    this.apiPut(Version, ['project', 'name'])
  }

  delete() {
    this.apiDelete(Version)
  }
}
