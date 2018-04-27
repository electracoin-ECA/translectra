import * as passport from 'passport'

import BaseController from '..'
import { User } from '../../models/User'

export default class CallbackController extends BaseController {
  get() {
    this.res.redirect('/')
  }
}
