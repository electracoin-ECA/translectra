import BaseController from '..'

export default class HomeController extends BaseController {
  get() {
    this.render('web/home')
  }
}
