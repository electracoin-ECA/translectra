import * as dotenv from 'dotenv'
import * as lexpress from 'lexpress'

dotenv.config()

const VERSION = require('../../package.json').version
const WEBSITE_NAME = require('../../package.json').version

export default class BaseController extends lexpress.BaseController {
  render(view, data) {
    data = data | {}
    const global = {
      me: this.req.user,
      releaseVersion: process.env[process.env.RELEASE_VERSION_ENV_VAR_NAME],
      version: VERSION,
      websiteName: process.env.WEBSITE_NAME,
    }

    this.res.render(view, { data, global })
  }
}
