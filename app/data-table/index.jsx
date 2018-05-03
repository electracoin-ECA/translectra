import axios from 'axios'
import React from 'react'

import Form from './form'
import Table from './table'

import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter'

// @see https://github.com/axios/axios/issues/960#issuecomment-320659373
axios.interceptors.response.use(response => response, error => Promise.reject(error.response))

const API_URL = '/api'
const FETCH_INTERVAL = 100000

export default class App extends React.PureComponent {
  constructor(props) {
    super(props)

    this.canCreate = this.props.meta.canCreate === undefined || this.props.meta.canCreate
    this.canDelete = this.props.meta.canDelete === undefined || this.props.meta.canDelete
    this.canEdit = this.props.meta.canEdit === undefined || this.props.meta.canEdit
    this.sortBy = props.meta.sortBy
    this.sortOrder = props.meta.sortOrder

    this.state = {
      currentEditedItemId: '',
      formAction: 'create',
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
    const params = {
      sortBy: this.sortBy,
      sortOrder: this.sortOrder ? 1 : -1,
    }
    if (this.$searchInput.value.length !== 0) params.query = this.$searchInput.value

    axios.get(`${API_URL}/${this.props.model}`, { params })
      .then(({ data }) => {
        this.setState({
          isLoading: !mustLoop && this.state.isLoading ? false : this.state.isLoading,
          items: data,
        })
        if (mustLoop) setTimeout(() => this.fetch(true), FETCH_INTERVAL)
      })
  }

  sort(fieldName, fieldType) {
    if (this.state.isLoading) return

    this.setState({ isLoading: true })

    this.sortOrder = this.sortBy === fieldName ? !this.sortOrder : !['boolean', 'date'].includes(fieldType)
    this.sortBy = fieldName

    this.fetch(false)
  }

  create(data) {
    if (this.state.isLoading) return

    this.setState({ isLoading: true })

    axios.post(`${API_URL}/${this.props.model}`, data)
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

  edit(itemId) {
    if (this.state.isLoading) return

    const formData = this.state.items.find(({ _id }) => _id === itemId)
    if (formData === undefined) return

    this.setState({
      currentEditedItemId: itemId,
      formAction: 'update',
      formData,
      formErrors: {},
      formKey: this.state.formKey + 1,
      isFormOpen: true,
    })
  }

  update(data) {
    if (this.state.isLoading) return

    axios.put(`${API_URL}/${this.props.model}/${this.state.currentEditedItemId}`, data)
      .then(() => {
        this.setState({
          formData: undefined,
          formErrors: {},
          isFormOpen: false,
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

  delete(itemId) {
    if (this.state.isLoading) return

    this.setState({ isLoading: true })

    axios.delete(`${API_URL}/${this.props.model}/${itemId}`)
      .then(() => this.fetch(false))
      .catch(({ data }) => {
        this.setState({ isLoading: false })
      })
  }

  toggleForm() {
    if (this.state.isLoading) return

    this.setState({
      formAction: 'create',
      formData: undefined,
      formErrors: {},
      formKey: this.state.formKey + 1,
      isFormOpen: this.state.formAction === 'update' && this.state.isFormOpen ? true : !this.state.isFormOpen,
    })
  }

  render() {
    return (
      <div>
        <div className={`${this.canCreate ? 'd-flex justify-content-between ' : ''}mb-4`}>
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
          {this.canCreate && (
            <button
              children={`New ${capitalizeFirstLetter(this.props.model)}`}
              className='btn btn-primary no-select'
              disabled={this.state.isLoading}
              onClick={this.toggleForm.bind(this)}
              type='button'
            />
          )}
        </div>

        {this.state.isFormOpen && (
          <Form
            action={this.state.formAction}
            errors={this.state.formErrors}
            foreignData={this.props.meta.foreignData}
            initialData={this.state.formData}
            isLoading={this.state.isLoading}
            key={String(this.state.formKey)}
            onSubmit={this.state.formAction === 'create' ? this.create.bind(this) : this.update.bind(this)}
            schema={this.props.schema.filter(({ isField }) => isField)}
          />
        )}

        <Table
          canDelete={this.canDelete}
          canEdit={this.canEdit}
          columns={this.props.schema.filter(({ isColumn }) => isColumn)}
          defaultName={this.props.meta.defaultName}
          isLoading={this.state.isLoading}
          items={this.state.items}
          meta={this.props.meta}
          model={this.props.model}
          onDelete={this.delete.bind(this)}
          onEdit={this.edit.bind(this)}
          onSort={this.sort.bind(this)}
          sortBy={this.sortBy}
          sortOrder={this.sortOrder}
        />
      </div>
    )
  }
}
