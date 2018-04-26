import dotenv from 'dotenv'
import { Lexpress } from 'lexpress'
import passport from 'passport'
import passportGoogleOauth from 'passport-google-oauth'
import path from 'path'
import User from './models/User'
import routes from './routes'

dotenv.config()

passport.use(new passportGoogleOauth.OAuthStrategy(
  {
    consumerKey: process.env.GOOGLE_API_KEY,
    consumerSecret: process.env.GOOGLE_API_SECRET,
    callbackURL: `${process.env.WEBSITE_URL}/auth/callback`,
  },
  (accessToken, refreshToken, profile, cb) => {
    User.findOrCreate({
      googleId: profile.id,
      email: profile.email,
    }, cb)
  }
))

const commonConfig = {
  middlewares: [
    passport.initialize(),
    passport.session(),
  ],
  routes,
  staticPath: 'public',
  viewsEngine: 'pug',
  viewsPath: 'src/views',
}

const lexpress = new Lexpress(process.env.NODE_ENV === 'development'
  ? {
    ...commonConfig,
    ...{}
  }
  : {
    ...commonConfig,
    ...{}
  }
)

lexpress.start()
