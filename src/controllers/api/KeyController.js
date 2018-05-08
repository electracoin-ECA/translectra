import BaseController from '..'
import Key from '../../models/Key'
import KeyLanguage from '../../models/KeyLanguage'
import Language from '../../models/Language'

import {
  HTTP_STATUS_CODE_ACCEPTED,
  HTTP_STATUS_CODE_OK,
  HTTP_STATUS_CODE_BAD_REQUEST,
  HTTP_STATUS_CODE_CREATED,
  HTTP_STATUS_CODE_FORBIDDEN,
  HTTP_STATUS_CODE_NOT_FOUND,
} from '..'

export default class KeyController extends BaseController {
  get() {
    this.apiGet(Key, ['name', 'value'], ['projects', 'author'])
  }

  post() {
    this.create(Key, {
      name: this.req.body.name,
      projects: this.req.body.projects,
      note: this.req.body.note,
      url: this.req.body.url,
      value: this.req.body.value,
      author: this.req.user.id,
    })
      .then(key => {
        Language.find((err, languages) => {
          if (err !== null) {
            this.answerError(err)

            return
          }

          Promise.all(languages.map(language => this.create(KeyLanguage, {
            key: key.id,
            version: key.version,
            language: language.id,
            projects: this.req.body.projects,
          })))
            .then(() => this.res.status(HTTP_STATUS_CODE_CREATED).json({}))
            .catch(this.answerError.bind(this))
        })
      })
      .catch(err => {
        if (err.errors !== undefined && err.errors.value !== undefined) {
          this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

          return
        }

        this.answerError(err)
      })
  }

  put() {
    Key.findById(this.req.params.id, (err, key) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      if (key === null) {
        this.answerError('Not Found', HTTP_STATUS_CODE_NOT_FOUND)

        return
      }

      let isDone = key.isDone
      let translations = key.translations
      let version = key.version
      if (this.req.params.action !== undefined) {
        if (this.req.params.action !== 'upgrade') {
          this.answerError('Bad Request', HTTP_STATUS_CODE_BAD_REQUEST)

          return
        }

        isDone = false
        translations = []
        version += 1
      }

      this.update(Key, this.req.params.id, {
        name: this.req.body.name,
        projects: this.req.body.projects,
        note: this.req.body.note,
        url: this.req.body.url,
        value: this.req.body.value,
        version,
      })
        .then(key => {
          Language.find({ key: key.id }, (err, languages) => {
            if (err !== null) {
              this.answerError(err)

              return
            }

            Promise.all(languages.map(language => this.update(KeyLanguage, {
              version: version,
              language: language.id,
              projects: this.req.body.projects,
              translations,
              isDone,
            })))
              .then(() => this.res.status(HTTP_STATUS_CODE_CREATED).json({}))
              .catch(this.answerError.bind(this))
          })
        })
        .catch(err => {
          if (err.errors !== undefined && err.errors.value !== undefined) {
            this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json(err.errors)

            return
          }

          this.answerError(err)
        })
    })
  }

  delete() {
    this.isJson = true

    this.removeKeys([this.req.params.id])
      .then(() => this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({}))
      .catch(this.answerError.bind(this))
  }
}
