import passport from 'passport'

import AdminCountryController from './controllers/admin/CountryController'
import AuthCallbackController from './controllers/auth/CallbackController'
import AuthLogOutController from './controllers/auth/LogOutController'
import WebHomeController from './controllers/web/HomeController'

import isAdmin from './middlewares/isAdmin'

const routes = [
  /* ========================================
    Admin
  */
  {
    path: '/admin/country',
    method: 'get',
    middleware: isAdmin,
    controller: AdminCountryController,
  },

  /* ========================================
    Auth
  */
  {
    path: '/auth/callback',
    method: 'get',
    middleware: passport.authenticate('google', { failureRedirect: '/' }),
    controller: AuthCallbackController,
  },
  {
    path: '/auth/login',
    method: 'get',
    call: passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    }),
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
