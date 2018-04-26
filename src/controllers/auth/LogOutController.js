import { BaseController } from 'lexpress'

export default class LogOutController extends BaseController {
  get() {
    this.req.logout()
    this.res.redirect('/')
  }
}
