import * as dotenv from 'dotenv'
import * as lexpress from 'lexpress'

dotenv.config()

const VERSION = require('../../package.json').version

export default class BaseController extends lexpress.BaseController {
  render(view, data) {
    data = data || {}
    const global = {
      me: this.req.user,
      version: VERSION,
      websiteName: process.env.WEBSITE_NAME,
    }

    this.res.render(view, { ...data, flash: this.req.flash(), global })
  }
}
