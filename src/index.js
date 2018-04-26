import * as dotenv from 'dotenv'
import { Lexpress } from 'lexpress'
import * as path from 'path'

import routes from './routes'

dotenv.config()

const commonConfig = {
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
