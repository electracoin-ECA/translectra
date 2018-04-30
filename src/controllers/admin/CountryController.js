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

  post() {
    const { name } = this.req.body
    const nowDate = Date.now()

    const country = new Country({
      name,
      createdAt: nowDate,
      updatedAt: nowDate,
    })

    country.save((err) => {
      this.flashMongooseErrors(err, country)
      this.res.redirect('/admin/country')
    })
  }
}
