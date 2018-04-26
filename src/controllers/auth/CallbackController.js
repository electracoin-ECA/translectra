import * as passport from 'passport'

import BaseController from '..'
import { User } from '../../models/User'

export default class CallbackController extends BaseController {
  get() {
    this.render('auth/login')

    passport.authenticate('google', (err, user) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      this.req.logIn(user, err => {
        if (err !== null) {
          this.answerError(err)

          return
        }
      })

      this.res.redirect('/')
    })(this.req, this.res, this.next)
  }
}
