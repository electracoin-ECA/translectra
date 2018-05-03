import axios from 'axios'
import React from 'react'

import Table from './table'

const API_URL = '/api/translate'
const FETCH_INTERVAL = 10000

export default class App extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      currentLanguageId: '',
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
    this.fetch(true)
  }

  fetch(mustLoop) {
    const params = {}
    if (this.$searchInput.value.length !== 0) params.query = this.$searchInput.value

    axios.get(API_URL, { params })
      .then(({ data }) => {
        this.setState({
          isLoading: !mustLoop && this.state.isLoading ? false : this.state.isLoading,
          items: data,
        })
        if (mustLoop) setTimeout(() => this.fetch(true), FETCH_INTERVAL)
      })
  }

  selectProject() {
    this.setState({ currentProjectId: this.$projectSelect.value })
  }

  selectLanguage() {
    this.setState({ currentLanguageId: this.$languageSelect.value })
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

        {/* {this.state.isFormOpen && (
          <Form
            action={this.state.formAction}
            errors={this.state.formErrors}
            foreignData={this.props.meta.foreignData}
            initialData={this.state.formData}
            isLoading={this.state.isLoading}
            key={this.state.formKey}
            onSubmit={this.state.formAction === 'create' ? this.create.bind(this) : this.update.bind(this)}
            schema={this.props.schema.filter(({ isField }) => isField)}
          />
        )} */}

        <div className='d-flex justify-content-end form-inline mb-4'>
          <select
            className='form-control mr-2'
            defaultValue='PENDING'
            onChange={this.selectProject.bind(this)}
            ref={node => this.$projectSelect = node}
          >
            <option children='Status:' key={'all'} value='' />
            <option children={'Pending'} key={'pending'} value={'PENDING'} />
            <option children={'Done'} key={'done'} value={'DONE'} />
          </select>
          <select
            className='form-control mr-2'
            onChange={this.selectProject.bind(this)}
            ref={node => this.$projectSelect = node}
          >
            <option children='Project:' key={'all'} value='' />
            {this.props.meta.foreignData.projects.map(({ _id, name }) =>
              <option children={name} key={_id} value={_id} />
            )}
          </select>
          <select
            className='form-control'
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
          : <Table isLoading={this.state.isLoading} items={this.state.items} />
        }
      </div>
    )
  }
}
