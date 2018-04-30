import axios from 'axios'
import React from 'react'

import Form from './components/form'
import Table from './components/table'

// @see https://github.com/axios/axios/issues/960#issuecomment-320659373
axios.interceptors.response.use(response => response, error => Promise.reject(error.response))

const API_URL = '/api'
const FETCH_INTERVAL = 2000

export default class App extends React.PureComponent {
  constructor(props) {
    super(props)

    this.isLoading = false

    this.state = {
      currentEditedItemId: '',
      formAction: 'create',
      formData: undefined,
      formErrors: {},
      isFormOpen: false,
      items: [],
      sortBy: props.meta.sortBy,
      sortOrder: props.meta.sortOrder,
    }
  }

  componentDidMount() {
    this.fetch(true)
  }

  fetch(mustLoop) {
    const params = {
      sortBy: this.state.sortBy,
      sortOrder: this.state.sortOrder ? 1 : -1,
    }
    if (this.$searchInput.value.length !== 0) params.query = this.$searchInput.value

    axios.get(`${API_URL}/${this.props.model}`, { params })
      .then(({ data }) => {
        if (!mustLoop && this.isLoading) this.isLoading = false
        this.setState({
          isFormOpen: !mustLoop && this.isUpdating ? false : this.state.isFormOpen,
          items: data,
        })
        if (mustLoop) setTimeout(() => this.fetch(true), FETCH_INTERVAL)
      })
  }

  sort(fieldName) {
    this.isLoading = true

    this.setState({
      sortBy: fieldName,
      sortOrder: this.state.sortBy === fieldName ? !this.state.sortOrder : true,
    })

    this.fetch(false)
  }

  create($form) {
    this.isLoading = true

    const data = {}
    this.props.schema
      .filter(({ isField }) => isField)
      .forEach(({ name, type }) => {
        switch (type) {
          case 'boolean':
            data[name] = $form[name].checked
            break

          default:
            data[name] = $form[name].value
        }
      })

    axios.post(`${API_URL}/${this.props.model}`, data)
      .then(() => {
        this.setState({
          formData: undefined,
          formErrors: {},
          isLoading: true,
        })
        this.isLoading = true
        this.fetch(false)
      })
      .catch(({ data }) => {
        this.isLoading = false
        this.setState({ formErrors: data })
      })
  }

  edit(itemId) {
    const formData = this.state.items.find(({ _id }) => _id === itemId)
    if (formData === undefined) return

    this.setState({
      currentEditedItemId: itemId,
      formData,
      formAction: 'update',
      isFormOpen: true,
    })
  }

  update($form) {
    this.isLoading = true
    this.isUpdating = true

    const data = {}
    this.props.schema
      .filter(({ isField }) => isField)
      .forEach(({ name, type }) => {
        switch (type) {
          case 'boolean':
            data[name] = $form[name].checked
            break

          default:
            data[name] = $form[name].value
        }
      })

    axios.put(`${API_URL}/${this.props.model}/${this.state.currentEditedItemId}`, data)
      .then(() => {
        this.setState({
          formData: undefined,
          formErrors: {},
          isLoading: true,
        })
        this.isLoading = true
        this.fetch(false)
      })
      .catch(({ data }) => {
        this.isLoading = false
        this.setState({ formErrors: data })
      })
  }

  delete(itemId) {
    this.isLoading = true

    axios.delete(`${API_URL}/${this.props.model}/${itemId}`)
      .then(() => this.fetch(false))
      .catch(({ data }) => {
        this.isLoading = false
      })
  }

  toggleForm() {
    this.setState({
      formAction: 'create',
      formData: undefined,
      isFormOpen: this.state.formAction === 'update' && this.state.isFormOpen ? true : !this.state.isFormOpen,
    })
  }

  render() {
    return (
      <div>
        <div className={`${this.props.meta.canCreate ? 'd-flex justify-content-between' : ''}mb-4`}>
          <div className='input-group mr-3'>
            <div className='input-group-prepend'>
              <i className='input-group-text material-icons no-select'>search</i>
            </div>
            <input
              aria-label='Search'
              className='form-control'
              onInput={this.fetch.bind(this)}
              placeholder='Search'
              type='text'
              ref={node => this.$searchInput = node}
            />
          </div>
          {this.props.meta.canCreate && (
            <button
              children={`NEW ${this.props.model.toUpperCase()}`}
              className='btn btn-primary no-select'
              onClick={this.toggleForm.bind(this)}
              type='button'
            />
          )}
        </div>

        {this.state.isFormOpen && (
          <Form
            action={this.state.formAction}
            errors={this.state.formErrors}
            initialData={this.state.formData}
            isLoading={this.isLoading || this.isLoading}
            onSubmit={this.formAction === 'create' ? this.create.bind(this) : this.update.bind(this)}
            schema={this.props.schema.filter(({ isField }) => isField)}
          />
        )}

        <Table
          columns={this.props.schema.filter(({ isColumn }) => isColumn)}
          defaultName={this.props.meta.defaultName}
          isLoading={this.isLoading || this.isLoading}
          items={this.state.items}
          meta={this.props.meta}
          model={this.props.model}
          onDelete={this.delete.bind(this)}
          onEdit={this.edit.bind(this)}
          onSort={this.sort.bind(this)}
          sortBy={this.state.sortBy}
          sortOrder={this.state.sortOrder}
        />
      </div>
    )
  }
}
