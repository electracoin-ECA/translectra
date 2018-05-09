import fs from 'fs'
import path from 'path'
import * as R from 'ramda'
import rimraf from 'rimraf'

import BaseController from '..'
import KeyLanguage from '../../models/KeyLanguage'
import Language from '../../models/Language'
import Project from '../../models/Project'
import zip from '../../helpers/zip'

export default class DownloadController extends BaseController {
  get() {
    Promise.all([
      this.findWhere(Language, {}, 'name'),
      this.findWhere(Project, { _id: this.req.query.projectId }),
    ])
      .then(([languages, projects]) => {
        if (projects.length === 0) {
          this.answerError('Not Found', 404)

          return
        }

        const downloadId = String(+Date.now())
        const project = projects[0]
        const outputMatrix = languages.reduce((prev, { code }) => {
          prev[code] = {}

          return prev
        }, {})

        KeyLanguage
          .find({ projects: { $elemMatch: { $eq: this.req.query.projectId } } })
          .populate('key')
          .populate('language')
          .populate('translations')
          .exec((err, keysLanguages) => {
            if (err !== null) {
              this.answerError(err)

              return
            }

            const keysLanguagesSorted = R.sortBy(R.ascend(R.path(['key', 'name'])))(keysLanguages)

            keysLanguagesSorted.forEach(keyLanguage => {
              if (!keyLanguage.isDone) {
                outputMatrix[keyLanguage.language.code][keyLanguage.key.name] = ''

                return
              }

              outputMatrix[keyLanguage.language.code][keyLanguage.key.name] = keyLanguage.translations
                .find(translation => translation.isAccepted === true)
                .value
            })

            const tempDirectoryPath = path.resolve(process.cwd(), 'public', 'temp')
            const outputDirectoryPath = path.resolve(tempDirectoryPath, downloadId, project.name)
            fs.mkdirSync(path.resolve(tempDirectoryPath, downloadId))
            fs.mkdirSync(outputDirectoryPath)
            languages.forEach(({ code }) => fs.writeFileSync(
              path.resolve(outputDirectoryPath, `${code}.json`),
              JSON.stringify(outputMatrix[code], null, 2)
            ))
            zip(outputDirectoryPath)
              .then(() => {
                this.res.download(`${outputDirectoryPath}.zip`, err => {
                  if (err !== undefined) {
                    this.answerError(err)

                    return
                  }

                  rimraf.sync(path.resolve(tempDirectoryPath, downloadId))
                })
              })
              .catch(this.answerError.bind(this))
            })
          })
          .catch(this.answerError.bind(this))
  }
}
