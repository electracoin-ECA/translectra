import passport from 'passport'

import AuthCallbackController from './controllers/auth/CallbackController'
import AuthLogOutController from './controllers/auth/LogOutController'

import WebHomeController from './controllers/web/HomeController'

const routes = [
  /* ========================================
    Auth
  */
  {
    path: '/auth/callback',
    method: 'get',
    controller: AuthCallbackController,
  },
  {
    path: '/auth/login',
    method: 'get',
    middleware: passport.authenticate('google', { scope: 'https://www.google.com/m8/feeds' }),
  },
  {
    path: '/auth/logout',
    method: 'get',
    controller: AuthLogOutController,
  },

  /* ========================================
    Website
  */
  {
    path: '/',
    method: 'get',
    controller: WebHomeController,
  },
]

export default routes
