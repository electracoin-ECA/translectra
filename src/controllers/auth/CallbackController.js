import * as passport from 'passport'

import BaseController from '..'
import { User } from '../../models/User'

export default class CallbackController extends BaseController {
  get() {
    const redirectionPath = this.req.flash('redirectionPath')

    this.res.redirect(redirectionPath.length === 0 ? '/' : redirectionPath[0])
  }
}
