import BaseController from '..'
import Key from '../../models/Key'
import KeyLanguage from '../../models/KeyLanguage'
import Translation from '../../models/Translation'

import {
  HTTP_STATUS_CODE_ACCEPTED,
  HTTP_STATUS_CODE_OK,
  HTTP_STATUS_CODE_BAD_REQUEST,
  HTTP_STATUS_CODE_CREATED,
  HTTP_STATUS_CODE_FORBIDDEN,
  HTTP_STATUS_CODE_NOT_FOUND,
} from '..'

export default class TranslateController extends BaseController {
  get() {
    this.isJson = true

    const conditions = {
      language: this.req.query.languageId,
      isDone: Boolean(Number(this.req.query.isDone)),
    }
    if (typeof this.req.query.projectId === 'string' && this.req.query.projectId.length > 0) {
      conditions.projects = { $elemMatch: { $eq: this.req.query.projectId } }
    }

    let query = KeyLanguage
      .find(conditions)
      .sort(`${this.req.query.sortOrder === '-1' ? '-' : ''}${this.req.query.sortBy}`)
      .limit(10)
      .populate('key')
      .populate('projects', 'name')
      .populate({
        path: 'translations',
        populate: {
          path: 'author',
          select: 'name',
        },
      })
      .exec((err, items) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        this.res.status(HTTP_STATUS_CODE_OK).json(items)
      })
  }

  post() {
    this.isJson = true

    KeyLanguage.findById(this.req.body.keyLanguageId, (err, keyLanguage) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      if (keyLanguage === null) {
        this.answerError('Not Found', HTTP_STATUS_CODE_NOT_FOUND)

        return
      }

      this.create(Translation, {
        key: keyLanguage.key,
        language: this.req.body.language,
        value: this.req.body.value,
        author: this.req.user._id,
        upVotes: [],
        downVotes: [],
        version: keyLanguage.version,
      })
        .then(({ _id }) => {
          keyLanguage.translations.push(_id)
          keyLanguage.save(err => {
            if (err !== null) {
              this.answerError(err)

              return
            }

            this.res.status(HTTP_STATUS_CODE_CREATED).json({})
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

  put() {
    this.isJson = true

    if (this.req.params.action === 'accept') {
      if (!this.req.user.isManager) {
        this.answerError('Forbidden', HTTP_STATUS_CODE_FORBIDDEN)

        return
      }

      KeyLanguage
        .findById(this.req.body.keyLanguageId)
        .populate('translations')
        .exec((err, keyLanguage) => {
          if (err !== null) {
            this.answerError(err)

            return
          }

          if (keyLanguage.translations.filter(({ _id }) => String(_id) === this.req.params.id).length === 0) {
            this.answerError('Bad Request', HTTP_STATUS_CODE_BAD_REQUEST)

            return
          }

          Promise.all([
            ...this.req.body.isAccepted
              ? keyLanguage.translations
                .filter(({ isAccepted }) => isAccepted)
                .map(({ _id }) => this.update(Translation, _id, { isAccepted: false }))
              : [],
            this.update(KeyLanguage, keyLanguage.id, { isDone: this.req.body.isAccepted }),
          ])
            .then(() => this.apiPut(Translation, ['isAccepted']))
            .catch(this.answerError.bind(this))
      })

      return
    }

    if (['upVote', 'downVote'].includes(this.req.params.action)) {
      Translation.findById(this.req.params.id, (err, translation) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        if (translation === null) {
          this.answerError('Not Found', HTTP_STATUS_CODE_NOT_FOUND)

          return
        }

        if (String(translation.author) === this.req.user.id) {
          this.answerError('Forbidden', HTTP_STATUS_CODE_FORBIDDEN)

          return
        }

        const downVotes = translation.downVotes.filter(userId => String(userId) !== this.req.user.id)
        const upVotes = translation.upVotes.filter(userId => String(userId) !== this.req.user.id)

        if (
          this.req.params.action === 'upVote' &&
          translation.upVotes.filter(userId => String(userId) === this.req.user.id).length === 0
        ) {
          upVotes.push(this.req.user.id)
        }
        if (
          this.req.params.action === 'downVote' &&
          translation.downVotes.filter(userId => String(userId) === this.req.user.id).length === 0
        ) {
          downVotes.push(this.req.user.id)
        }

        this.update(Translation, translation._id, { upVotes, downVotes })
          .then(() => this.res.status(HTTP_STATUS_CODE_ACCEPTED).json({}))
          .catch(this.answerError.bind(this))
      })

      return
    }

    this.answerError('Bad Request', HTTP_STATUS_CODE_BAD_REQUEST)
  }
}
