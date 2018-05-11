import axios from 'axios'
import React from 'react'

import Table from './table'

const API_URL = '/api/translate'
const FETCH_INTERVAL = 5000

export default class App extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      currentLanguageId: props.meta.languageId,
      currentProjectId: '',
      currentStatus: 'PENDING',
      formData: undefined,
      formErrors: {},
      formKey: 0,
      isFormOpen: false,
      isLoading: false,
      items: [],
    }
  }

  componentDidMount() {
    if (this.state.currentLanguageId.length !== 0) this.fetch(true)
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.currentLanguageId !== prevState.currentLanguageId ||
      this.state.currentProjectId !== prevState.currentProjectId ||
      this.state.currentStatus !== prevState.currentStatus
    ) {
      if (this.fetchTimeoutId !== undefined) {
        clearInterval(this.fetchTimeoutId)
        delete this.fetchTimeoutId
      }

      this.fetch(true)
    }
  }

  fetch(mustLoop) {
    if (this.state.currentLanguageId.length === 0) return

    const params = {
      languageId: this.state.currentLanguageId,
      projectId: this.state.currentProjectId,
      isDone: Number(this.state.currentStatus === 'DONE'),
    }
    if (this.$searchInput.value.length !== 0) params.query = this.$searchInput.value

    axios.get(API_URL, { params })
      .then(({ data }) => {
        this.setState({
          isLoading: !mustLoop && this.state.isLoading ? false : this.state.isLoading,
          items: data,
        })
        if (mustLoop && this.state.currentLanguageId.length !== 0) {
          this.fetchTimeoutId = setTimeout(() => this.fetch(true), FETCH_INTERVAL)
        }
      })
  }

  create(keyLanguageId, value) {
    if (this.state.isLoading) return

    this.setState({ isLoading: true })
    const data = {
      keyLanguageId,
      language: this.state.currentLanguageId,
      value,
    }

    axios.post(`${API_URL}`, data)
      .then(() => {
        this.setState({
          formData: undefined,
          formErrors: {},
          formKey: this.state.formKey + 1,
        })
        this.fetch(false)
      })
      .catch(({ data }) => {
        this.setState({
          formErrors: data,
          isLoading: false,
        })
      })
  }

  accept(keyLanguageId, translationId, isAccepted) {
    if (this.state.isLoading) return

    this.setState({ isLoading: true })
    const data = {
      isAccepted,
      keyLanguageId,
    }

    axios.put(`${API_URL}/${translationId}/accept`, data)
      .then(() => this.fetch(false))
      .catch(() => this.setState({ isLoading: false }))
  }

  vote(translationId, state) {
    if (this.state.isLoading) return

    this.setState({ isLoading: true })

    axios.put(`${API_URL}/${translationId}/${state === 1 ? 'up' : 'down'}Vote`)
      .then(() => this.fetch(false))
      .catch(() => this.setState({ isLoading: false }))
  }

  delete(translationId) {
    if (this.state.isLoading) return

    this.setState({ isLoading: true })

    axios.delete(`${API_URL}/${translationId}`)
      .then(() => this.fetch(false))
      .catch(() => this.setState({ isLoading: false }))
  }

  selectLanguage() {
    this.setState({ currentLanguageId: this.$languageSelect.value })
  }

  selectProject() {
    this.setState({ currentProjectId: this.$projectSelect.value })
  }

  selectStatus() {
    this.setState({ currentStatus: this.$statusSelect.value })
  }

  render() {
    return (
      <div>
        <div className='mb-2'>
          <div className='input-group mr-3'>
            <div className='input-group-prepend'>
              <i className='input-group-text material-icons no-select' style={{ fontSize: '1.5rem' }}>search</i>
            </div>
            <input
              aria-label='Search'
              className='form-control'
              disabled={this.state.isLoading}
              onInput={this.fetch.bind(this)}
              placeholder='Search'
              type='text'
              ref={node => this.$searchInput = node}
            />
          </div>
        </div>

        <div className='d-flex justify-content-end form-inline mb-4'>
          <select
            className='form-control mr-2'
            defaultValue='PENDING'
            disabled={this.state.isLoading}
            onChange={this.selectStatus.bind(this)}
            ref={node => this.$statusSelect = node}
          >
            <option children={'Pending'} key={'pending'} value={'PENDING'} />
            <option children={'Done'} key={'done'} value={'DONE'} />
          </select>
          <select
            className='form-control mr-2'
            disabled={this.state.isLoading}
            onChange={this.selectProject.bind(this)}
            ref={node => this.$projectSelect = node}
          >
            <option children='All Projects' key={'all'} value='' />
            {this.props.meta.foreignData.projects.map(({ _id, name }) =>
              <option
                children={name}
                key={_id}
                value={_id}
              />
            )}
          </select>
          <select
            className='form-control'
            defaultValue={this.state.currentLanguageId}
            disabled={this.state.isLoading}
            onChange={this.selectLanguage.bind(this)}
            ref={node => this.$languageSelect = node}
          >
            <option children='Language:' key={'all'} value='' />
            {this.props.meta.foreignData.languages.map(({ _id, name }) =>
              <option children={name} key={_id} value={_id} />
            )}
          </select>
        </div>

        {this.state.currentLanguageId.length === 0
          ? (
            <div className='p-3 mb-2 bg-light text-secondary text-right no-select'>
              Please pick up a language to see its pending translations
              <i
                children='arrow_upward'
                className='material-icons ml-2'
                style={{ fontSize: '2rem', verticalAlign: '-5px' }}
              />
            </div>
          )
          : (
            <Table
              errors={this.state.formErrors}
              onAccept={this.accept.bind(this)}
              onDelete={this.delete.bind(this)}
              onSubmit={this.create.bind(this)}
              onVote={this.vote.bind(this)}
              isLoading={this.state.isLoading}
              isManager={this.props.isManager}
              items={this.state.items}
              userId={this.props.userId}
            />
          )
        }
      </div>
    )
  }
}
