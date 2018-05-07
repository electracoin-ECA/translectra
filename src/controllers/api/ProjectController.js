import mongoose from 'mongoose'

import BaseController from '..'
import Key from '../../models/Key'
import Project from '../../models/Project'
import Version from '../../models/Version'

import {
  HTTP_STATUS_CODE_BAD_REQUEST,
  HTTP_STATUS_CODE_CREATED,
} from '..'

export default class ProjectController extends BaseController {
  get() {
    this.apiGet(Project, ['name'], ['author', 'versions'])
  }

  post() {
    this.isJson = true

    // Validate project fields
    const project = new Project({ name: this.req.body.name })
    const err = project.validateSync()
    if (err !== null && err.errors !== undefined && err.errors.name !== undefined) {
      this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({ name: err.errors.name })

      return
    }
    if (this.req.body.versions.length === 0) {
      this.res.status(HTTP_STATUS_CODE_BAD_REQUEST)
        .json({ versions: { message: 'You must create at least one version for each project.' } })

      return
    }

    // Validate versions fields
    for (let name of this.req.body.versions) {
      const version = new Version({ name })
      const err = version.validateSync()
      if (err !== null && err.errors !== undefined && err.errors.name !== undefined) {
        this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({ versions: err.errors.name })

        return
      }
    }

    this.updateCollection(Version, project._id, this.req.body.versions)
      .then(versions => {
        project.set('author', this.req.user._id)
        project.set('versions', versions)
        project.set('createdAt', Date.now())
        project.set('updatedAt', Date.now())
        project.save((err, item) => {
          if (err !== null) {
            this.answerError(err)

            return
          }

          this.res.status(HTTP_STATUS_CODE_CREATED).json({})
        })
      })
      .catch(this.answerError.bind(this))
  }

  put() {
    this.isJson = true

    this.updateCollection(Version, this.req.params.id, this.req.body.versions)
      .then(versions => {
        this.req.body.author = this.req.user._id
        this.req.body.versions = versions
        this.apiPut(Project, ['name', 'versions', 'author'])
      })
      .catch(err => {
        if (err !== null && err.errors !== undefined && err.errors.name !== undefined) {
          this.res.status(HTTP_STATUS_CODE_BAD_REQUEST).json({ versions: err.errors.name })

          return
        }

        this.answerError(err)
      })
  }

  delete() {
    this.isJson = true

    Project.findById(this.req.params.id, (err, project) => {
      if (err !== null) {
        this.answerError(err)

        return
      }

      Key.find({ versions: { $in: project.versions } }, (err, keys) => {
        if (err !== null) {
          this.answerError(err)

          return
        }

        Promise.all([
          // We remove the project and its versions from the related keys
          ...keys.map(({ _id, projects, versions }) => this.update(Key, _id, {
            projects: projects.filter(projectId => projectId != project.id),
            versions: versions.filter(versionId => !project.versions.includes(versionId)),
          })),
          // We remove the project versions
          this.remove(Version, project.versions),
        ])
          // We remove the project
          .then(() => this.apiDelete(Project))
          .catch(this.answerError.bind(this))
      })
    })
  }
}
