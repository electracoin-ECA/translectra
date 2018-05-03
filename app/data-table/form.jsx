import * as R from 'ramda'
import React from 'react'

import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter'

export default class Form extends React.PureComponent {
  constructor(props) {
    super(props)

    this.inputWidth = 0

    this.state = props.schema
      .filter(({ type }) => type === 'collection')
      .reduce((prev, { name }) => {
        prev[`${name}IsFocused`] = false
        prev[`${name}Query`] = ''
        prev[`${name}SelectedItems`] = []

        return prev
      }, {})
  }

  focusCollection(fieldName) {
    this.inputWidth = this[`$${fieldName}`].clientWidth

    const state = {...this.state}
    state[`${fieldName}IsFocused`] = true
    this.setState({...state})
  }

  blurCollection(fieldName) {
    // We delay the blur actions to let the onClick event to be handled before
    // in case a collection item has been clicked.
    setTimeout(() => {
      const state = {...this.state}
      state[`${fieldName}IsFocused`] = false
      this.setState({...state})
    }, 150)
  }

  queryCollection(fieldName) {
    const state = {...this.state}
    state[`${fieldName}Query`] = this[`$${fieldName}`].value
    this.setState({...state})
  }

  selectCollectionItem(fieldName, itemId) {
    const state = {...this.state}
    state[`${fieldName}SelectedItems`]
      .push(this.props.foreignData[fieldName].find(({ _id }) => _id === itemId))
    this.setState({...state})
  }

  unselectCollectionItem(fieldName, itemId) {
    const state = {...this.state}
    state[`${fieldName}IsFocused`] = false
    state[`${fieldName}Query`] = ''
    state[`${fieldName}SelectedItems`] = state[`${fieldName}SelectedItems`].filter(({ _id }) => _id !== itemId)
    this.setState({...state})
  }

  submit(event) {
    event.preventDefault()

    const data = {}
    this.props.schema
      .filter(({ isField }) => isField)
      .forEach(({ name, type }) => {
        switch (type) {
          case 'boolean':
            data[name] = this.$form[name].checked
            break

          case 'collection':
            data[name] = this.state[`${name}SelectedItems`].map(({ _id }) => _id)
            break

          default:
            data[name] = this.$form[name].value
        }
      })

    this.props.onSubmit(data)
  }

  renderField(field, index) {
    const hasError = this.props.errors[field.name] !== undefined

    if (field.isDisabled) {
      return (
        <div className='form-group row' key={index}>
          <label className='col-sm-2 col-form-label no-select' htmlFor={field.name}>{field.label}</label>
          <div className='col-sm-10 col-form-label font-weight-bold'>
            {this.props.initialData[field.name]}
          </div>
        </div>
      )
    }

    switch (field.type) {
      case 'boolean':
        return (
          <div className='form-group row' key={index}>
            <div className='col-sm-10 offset-sm-2'>
              <input
                className='form-check-input ml-0 mr-2'
                defaultChecked={this.props.initialData !== undefined ? this.props.initialData[field.name] : false}
                disabled={this.props.isLoading}
                id={field.name}
                name={field.name}
                style={{ position: 'static' }}
                type='checkbox'
              />
              <label className='form-check-label no-select' htmlFor={field.name}>{field.label}</label>
            </div>
          </div>
        )

      case 'collection':
        return (
          <div className='form-group row' key={index}>
            <label className='col-sm-2 col-form-label no-select' htmlFor={field.name}>{field.label}</label>
            <div className='col-sm-10'>
              <input
                autoCapitalize='off'
                autoCorrect='off'
                className={['form-control', hasError ? 'is-invalid' : ''].join(' ').trim()}
                disabled={this.props.isLoading}
                onBlur={() => this.blurCollection(field.name)}
                onFocus={() => this.focusCollection(field.name)}
                onInput={() => this.queryCollection(field.name)}
                ref={node => this[`$${field.name}`] = node}
                spellCheck='false'
                type='text'
              />
              {this.state[`${field.name}IsFocused`] && (
                <div
                  className='dropdown-menu no-select'
                  style={{
                    cursor: 'pointer',
                    display: 'block',
                    left: '15px',
                    width: `${this.inputWidth}px`,
                  }}
                >
                  {this.props.foreignData[field.name]
                    .filter(({ _id, name }) =>
                      (new RegExp(this.state[`${field.name}Query`], 'i')).test(name) &&
                      this.state[`${field.name}SelectedItems`].filter(({ _id: id }) => id === _id).length === 0
                    )
                    .slice(0, 5)
                    .map((collectionItem, index) => (
                      <span
                        children={collectionItem.name}
                        className='dropdown-item'
                        key={index}
                        onClick={() => this.selectCollectionItem(field.name, collectionItem._id)}
                      />
                    ))
                  }
                </div>
              )}
              <div className='invalid-feedback'>{hasError && this.props.errors[field.name].message}</div>
              {this.state[`${field.name}SelectedItems`].length !== 0 && (
                <div className='mt-1'>
                  {this.state[`${field.name}SelectedItems`].map((collectionItem, index) => (
                    <button
                      children={collectionItem.name}
                      className='btn btn-sm btn-secondary mr-1'
                      key={index}
                      onClick={() => this.unselectCollectionItem(field.name, collectionItem._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'foreign':
        return (
          <div className='form-group row' key={index}>
            <label className='col-sm-2 col-form-label no-select' htmlFor={field.name}>{field.label}</label>
            <div className='col-sm-10'>
              <select
                className={['form-control', hasError ? 'is-invalid' : ''].join(' ').trim()}
                defaultValue={this.props.initialData !== undefined ? this.props.initialData[field.name]._id : ''}
                disabled={this.props.isLoading}
                id={field.name}
                name={field.name}
              >
                <option value='' />
                {this.props.foreignData[field.name].map((foreignItem, index) => (
                  <option
                    children={foreignItem.name}
                    key={index}
                    value={foreignItem._id}
                  />
                ))}
              </select>
              <div className='invalid-feedback'>{hasError && this.props.errors[field.name].message}</div>
            </div>
          </div>
        )

      case 'textarea':
        return (
          <div className='form-group row' key={index}>
            <label className='col-sm-2 col-form-label no-select' htmlFor={field.name}>{field.label}</label>
            <div className='col-sm-10'>
              <textarea
                autoCapitalize='off'
                autoCorrect='off'
                className={['form-control', hasError ? 'is-invalid' : ''].join(' ').trim()}
                defaultValue={this.props.initialData !== undefined ? this.props.initialData[field.name] : ''}
                disabled={this.props.isLoading}
                id={field.name}
                name={field.name}
                spellCheck='false'
                type='text'
              />
              <div className='invalid-feedback'>{hasError && this.props.errors[field.name].message}</div>
            </div>
          </div>
        )

      default:
        return (
          <div className='form-group row' key={index}>
            <label className='col-sm-2 col-form-label no-select' htmlFor={field.name}>{field.label}</label>
            <div className='col-sm-10'>
              <input
                autoCapitalize='off'
                autoCorrect='off'
                className={['form-control', hasError ? 'is-invalid' : ''].join(' ').trim()}
                defaultValue={this.props.initialData !== undefined ? this.props.initialData[field.name] : ''}
                disabled={this.props.isLoading}
                id={field.name}
                name={field.name}
                spellCheck='false'
                type='text'
              />
              <div className='invalid-feedback'>{hasError && this.props.errors[field.name].message}</div>
            </div>
          </div>
        )
    }
  }

  render() {
    return (
      <div className='card card-body bg-light mb-4'>
        <form
          action='/admin/country'
          autoComplete='off'
          className='form mb-0'
          method='post'
          noValidate
          onSubmit={this.submit.bind(this)}
          ref={node => this.$form = node}
        >
          {this.props.schema.map(this.renderField.bind(this))}
          <div className='form-group row'>
            <div className='col-sm-10 offset-sm-2 text-right'>
              <button
                children={capitalizeFirstLetter(this.props.action)}
                className='btn btn-primary'
                disabled={this.props.isLoading}
                type='submit'
              />
            </div>
          </div>
        </form>
      </div>
    )
  }
}
