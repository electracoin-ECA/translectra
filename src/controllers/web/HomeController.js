import BaseController from '..'
import KeyLanguage from '../../models/KeyLanguage'
import Language from '../../models/Language'
import Project from '../../models/Project'

export default class HomeController extends BaseController {
  get() {
    Promise.all([
      this.findWhere(Project, {}, 'name'),
      this.findWhere(Language, {}, 'name'),
      this.findWhere(KeyLanguage, {}),
    ])
      .then(([_projects, _languages, _keysLanguages]) => {
        const languages = _languages.map(_language => ({
          id: _language.id,
          name: _language.name,
          count: _keysLanguages
            .filter(_keyLanguage => String(_keyLanguage.language) === _language.id)
            .length,
          doneCount: _keysLanguages
            .filter(_keyLanguage => String(_keyLanguage.language) === _language.id && _keyLanguage.isDone)
            .length,
        }))

        const projects = _projects.map(_project => ({
          id: _project.id,
          name: _project.name,
          count: _keysLanguages
            .filter(_keyLanguage =>
              _keyLanguage.projects.map(_projectId => String(_projectId)).includes(_project.id)
            )
            .length,
          doneCount: _keysLanguages
            .filter(_keyLanguage =>
              _keyLanguage.projects.map(_projectId => String(_projectId)).includes(_project.id) &&
              _keyLanguage.isDone
            )
            .length,
        }))

        this.render('web/home', { languages, projects })
      })
      .catch(this.answerError.bind(this))
  }
}
