import moment from 'moment'
import * as R from 'ramda'
import React from 'react'

import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter'

export default class Table extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      openedKeyLanguageId: '',
    }
  }

  submit(event) {
    event.preventDefault()

    this.props.onSubmit(this.state.openedKeyLanguageId, this.$translationValueTextarea.value)
  }

  toggleTranslationForm(keyId) {
    this.setState({
      openedKeyLanguageId: this.state.openedKeyLanguageId === keyId ? '' : keyId,
    })
  }

  renderForm(keyId) {
    const hasError = this.props.errors.value !== undefined

    return (
      <tr key={`${keyId}-form`}>
        <td className='border-top-0 p-0' colSpan='6'>
          <form
            autoComplete='off'
            className='form bg-light p-2 border mb-2'
            noValidate
            onSubmit={this.submit.bind(this)}
          >
            <div className='form-group'>
              <textarea
                autoCapitalize='off'
                autoCorrect='off'
                className={['form-control', hasError ? 'is-invalid' : ''].join(' ').trim()}
                disabled={this.props.isLoading}
                ref={node => this.$translationValueTextarea = node}
                spellCheck='false'
              />
              <div className='invalid-feedback'>{hasError && this.props.errors.value.message}</div>
            </div>
            <button
              children='Submit'
              className='btn btn-sm btn-primary'
              disabled={this.props.isLoading}
              type='submit'
            />
          </form>
        </td>
      </tr>
    )
  }

  renderTranslations(keyId, translations) {
    const translationsWithScore = translations.map(translation => ({
      ...translation,
      score: translation.upVotes.length - translation.downVotes.length,
    }))

    const translationsWithScoreSorted = R.sortWith([
      R.descend(R.prop('isAccepted')),
      R.descend(R.prop('score')),
    ])(translationsWithScore)

    return (
      <tr key={`${keyId}-translations`}>
        <td className='border-top-0 p-2' colSpan='6'>
          {translationsWithScoreSorted.map(translation => {
            const voteUpActionClass = translation.author._id !== this.props.userId
              ? translation.upVotes.includes(this.props.userId) ? 'translation__action-on' : 'translation__action-off'
              : 'translation__icon text-secondary'
            const voteDownActionClass = translation.author._id !== this.props.userId
              ? translation.downVotes.includes(this.props.userId) ? 'translation__action-on' : 'translation__action-off'
              : 'translation__icon text-secondary'
            const acceptActionClass = this.props.isManager
              ? translation.isAccepted ? 'translation__action-on' : 'translation__action-off'
              : translation.isAccepted ? 'translation__icon text-success' : 'translation__icon text-light'

            return (
              <div className='mb-3' key={translations._id}>
                <div className='d-flex justify-content-between bg-light border p-1'>
                  <div className=''>{translation.value}</div>
                  <div className='d-flex flex-column align-items-center pr-0 no-select' style={{ minWidth: '2rem' }}>
                    <i
                      children='arrow_drop_up'
                      className={`material-icons ${voteUpActionClass}`}
                      onClick={() => translation.author._id !== this.props.userId
                        ? this.props.onVote(translation._id, 1)
                        : void 0
                      }
                    />
                    <div>{translation.score}</div>
                    <i
                      children='arrow_drop_down'
                      className={`material-icons ${voteDownActionClass}`}
                      onClick={() => translation.author._id !== this.props.userId
                        ? this.props.onVote(translation._id, -1)
                        : void 0
                      }
                    />
                    <i
                      children='check'
                      className={`material-icons ${acceptActionClass}`}
                      onClick={() => this.props.isManager
                        ? this.props.onAccept(keyId, translation._id, !translation.isAccepted)
                        : void 0
                      }
                    />
                  </div>
                </div>
                <div className='mt-1 text-secondary no-select' style={{ fontSize: '12px' }}>
                  {`${capitalizeFirstLetter(moment(translation.createdAt).fromNow())} by ${translation.author.name}.`}
                </div>
              </div>
            )
          })}
        </td>
      </tr>
    )
  }

  renderRow(keyLanguage) {
    const buttonClass = this.props.isLoading ? 'text-muted' : 'text-primary'

    return [
      <tr className='text-secondary' key={keyLanguage._id} style={{ fontSize: '12px' }}>
        <td key={`${keyLanguage._id}-name`}>{keyLanguage.key.name}</td>
        <td key={`${keyLanguage._id}-version`}>v{keyLanguage.version}</td>
        <td key={`${keyLanguage._id}-updatedAt`}>{moment(keyLanguage.createdAt).fromNow()}</td>
        {keyLanguage.note !== undefined && keyLanguage.note.length !== 0
          ? (
            <td
              className='text-center text-info list__iconCell list__iconCell-action'
              key={`${keyLanguage._id}-note`}
              title={keyLanguage.key.note}
            >
              <i children='note' className='material-icons' />
            </td>
          )
          : <td className='list__iconCell' key={`${keyLanguage._id}-note`} />
        }
        {keyLanguage.key.url !== undefined && keyLanguage.key.url.length !== 0
          ? (
            <td
              className='text-center text-info list__iconCell list__iconCell-action'
              key={`${keyLanguage._id}-url`}
              onClick={() => window.open(keyLanguage.key.url, '_blank')}
            >
              <i className='material-icons'>link</i>
            </td>
          )
          : <td className='list__iconCell' key={`${keyLanguage._id}-url`} />
        }
        <td
          className='text-right text-info'
          key={`${keyLanguage._id}-translate`}
          rowSpan='2'
        >
          <button
            children='Translate'
            className='btn btn-sm btn-success'
            disabled={keyLanguage.isDone || this.isLoading}
            onClick={() => this.toggleTranslationForm(keyLanguage._id)}
            type='button'
          />
        </td>
      </tr>,
      <tr key={`${keyLanguage._id}-projects`}>
        <td className='pt-0 border-top-0' colSpan='5' style={{ lineHeight: 1 }}>
          {keyLanguage.projects.map(({ _id, name: _name }) =>
            <span children={_name} className='badge badge-info no-select mr-1' key={_id} />,
          )}
        </td>
      </tr>,
      <tr key={`${keyLanguage._id}-value`}>
        <td className='font-weight-bold pt-0 border-top-0' colSpan='6'>
          {keyLanguage.key.value}
        </td>
      </tr>,
      keyLanguage._id === this.state.openedKeyLanguageId && this.renderForm(keyLanguage._id),
      keyLanguage.translations.length !== 0 && this.renderTranslations(keyLanguage._id, keyLanguage.translations),
    ]
  }

  render() {
    return (
      <table className='table table-sm'>
        <thead>
          <tr className={`no-select${this.props.isLoading ? ' text-muted' : ''}`}>
            <th key='name' scope='col'>Name</th>
            <th key='version' scope='col'>Version</th>
            <th key={'updatedAt'} scope='col'>
              Created
              <i className='material-icons'>arrow_drop_down</i>
            </th>
            <th key='note' scope='col' />
            <th key='url' scope='col' />
            <th key='translate' scope='col' />
          </tr>
        </thead>
        <tbody>
          {this.props.items.map(this.renderRow.bind(this))}
        </tbody>
      </table>
    )
  }
}
