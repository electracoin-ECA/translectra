import BaseController from '..'
import Country from '../../models/Country'

export default class CountryController extends BaseController {
  get() {
    Country.find((err, countries) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      const errors = {}

      this.render('admin/country', { countries })
    })
  }
}
