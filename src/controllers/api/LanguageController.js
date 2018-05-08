import BaseController from '..'
import Key from '../../models/Key'
import KeyLanguage from '../../models/KeyLanguage'
import Language from '../../models/Language'
import Translation from '../../models/Translation'

import {
  HTTP_STATUS_CODE_ACCEPTED,
  HTTP_STATUS_CODE_OK,
  HTTP_STATUS_CODE_BAD_REQUEST,
  HTTP_STATUS_CODE_CREATED,
  HTTP_STATUS_CODE_FORBIDDEN,
  HTTP_STATUS_CODE_NOT_FOUND,
} from '..'

export default class LanguageController extends BaseController {
  get() {
    this.apiGet(Language, ['name', 'code'], ['country'])
  }

  post() {
    this.isJson = true

    this.create(Language, {
      name: this.req.body.name,
      code: this.req.body.code,
    })
      .then(language => {
        Key.find((err, keys) => {
          if (err !== null) {
            this.answerError(err)

            return
          }

          Promise.all(keys.map(key => this.create(KeyLanguage, {
            key: key.id,
            version: key.version,
            language: language.id,
            projects: key.projects,
          })))
            .then(() => this.res.status(HTTP_STATUS_CODE_CREATED).json({}))
            .catch(this.answerError.bind(this))
        })
      })
  }

  put() {
    this.apiPut(Language, ['name', 'code'])
  }

  delete() {
    KeyLanguage.find({ language: this.req.params.id }, (err, keysLanguages) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      const translationIds = keysLanguages.reduce((prev, { translations }) => [...prev, ...translations], [])

      Promise.all([
        this.removeWhere(KeyLanguage, { language: this.req.params.id }),
        this.remove(Translation, translationIds),
      ])
        .then(() => this.apiDelete(Language))
        .catch(this.answerError.bind(this))
    })
  }
}
