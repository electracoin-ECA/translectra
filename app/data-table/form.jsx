import * as R from 'ramda'
import React from 'react'

import capitalizeFirstLetter from '../helpers/capitalizeFirstLetter'
import MarkdownField from './markdown-field'

export default class Form extends React.PureComponent {
  constructor(props) {
    super(props)

    this.inputWidth = 0
    this.refocusField = ''

    const collectionsStateProps = props.schema
      .filter(({ type }) => type === 'collection')
      .reduce((prev, { name }) => {
        prev[`${name}IsFocused`] = false
        prev[`${name}Query`] = ''
        prev[`${name}SelectedItems`] = props.initialData === undefined ? [] : props.initialData[name]

        return prev
      }, {})

    const tagsStateProps = props.schema
      .filter(({ type }) => type === 'tags')
      .reduce((prev, { name }) => {
        prev[`${name}Key`] = 0
        prev[`${name}Tags`] = props.initialData === undefined ? [] : props.initialData[name].map(({ name }) => name)

        return prev
      }, {})

    this.state = {
      ...collectionsStateProps,
      ...tagsStateProps,
      isMarkdown: Boolean(props.initialData) && Boolean(props.initialData.isMarkdown),
    }
  }

  componentDidUpdate() {
    if (this.refocusField !== '') {
      this[this.refocusField].focus()
      this.refocusField = ''
    }
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

  checkTagsInput(fieldName) {
    const value = this[`$${fieldName}`].value
    if (!value.endsWith(' ')) return

    this.addTag(fieldName, value.trim())
  }

  checkTagsKeyDown(event, fieldName) {
    if (event.keyCode !== 13) return

    event.preventDefault()
    const value = this[`$${fieldName}`].value.trim()
    if (value.length === 0) {
      this.submit()

      return
    }

    this.addTag(fieldName, value)
  }

  addTag(fieldName, value) {
    this.refocusField = `$${fieldName}`
    const state = {...this.state}
    state[`${fieldName}Key`] = state[`${fieldName}Key`] + 1
    if (value.length !== 0 && !state[`${fieldName}Tags`].includes(value)) {
      state[`${fieldName}Tags`].push(value)
    }
    this.setState({...state})
  }

  removeTag(fieldName, tag) {
    const state = {...this.state}
    state[`${fieldName}Tags`] = state[`${fieldName}Tags`].filter(_tag => _tag !== tag)
    this.setState({...state})
  }

  switchTextareaToMarkdown($checkbox) {
    this.setState({ isMarkdown: $checkbox.checked })
  }

  submit(event) {
    if (event !== undefined) event.preventDefault()

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

          case 'tags':
            data[name] = this.state[`${name}Tags`]
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
        <div className='form-group row' key={String(index)}>
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
          <div className='form-group row' key={String(index)}>
            <div className='col-sm-10 offset-sm-2'>
              <input
                className='form-check-input ml-0 mr-2'
                defaultChecked={this.props.initialData !== undefined ? this.props.initialData[field.name] : false}
                disabled={this.props.isLoading}
                id={field.name}
                name={field.name}
                onClick={event => field.name === 'isMarkdown' ? this.switchTextareaToMarkdown(event.target) : void 0}
                style={{ position: 'static' }}
                type='checkbox'
              />
              <label className='form-check-label no-select' htmlFor={field.name}>{field.label}</label>
            </div>
          </div>
        )

      case 'collection':
        return (
          <div className='form-group row' key={String(index)}>
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
                        key={String(index)}
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
                      className='btn btn-sm btn-info mr-1'
                      key={`${field.name}-${index}`}
                      onClick={() => this.unselectCollectionItem(field.name, collectionItem._id)}
                      type='button'
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'enum':
      case 'foreign':
        return (
          <div className='form-group row' key={String(index)}>
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
                    key={String(index)}
                    value={foreignItem._id}
                  />
                ))}
              </select>
              <div className='invalid-feedback'>{hasError && this.props.errors[field.name].message}</div>
            </div>
          </div>
        )

      case 'markdown':
        return (
          <div className='form-group row' key={String(index)}>
            <label className='col-sm-2 col-form-label no-select' htmlFor={field.name}>{field.label}</label>
            <div className='col-sm-10'>
              <MarkdownField
                defaultValue={this.props.initialData !== undefined ? this.props.initialData[field.name] : ''}
                isDisabled={this.props.isLoading}
                isText={!this.state.isMarkdown}
                hasError={hasError}
                name={field.name}
              />
              <div
                children={hasError && this.props.errors[field.name].message}
                className='invalid-feedback'
                style={{ display: hasError && Boolean(this.props.errors[field.name]) ? 'block' : 'none' }}
              />
            </div>
          </div>
        )

      case 'tags':
        return (
          <div className='form-group row' key={String(index)}>
            <label className='col-sm-2 col-form-label no-select' htmlFor={field.name}>{field.label}</label>
            <div className='col-sm-10'>
              <input
                autoCapitalize='off'
                autoCorrect='off'
                className={['form-control', hasError ? 'is-invalid' : ''].join(' ').trim()}
                disabled={this.props.isLoading}
                key={String(this.state[`${field.name}Key`])}
                onInput={() => this.checkTagsInput(field.name)}
                onKeyDown={event => this.checkTagsKeyDown(event, field.name)}
                ref={node => this[`$${field.name}`] = node}
                spellCheck='false'
                type='text'
              />
              <div className='invalid-feedback'>{hasError && this.props.errors[field.name].message}</div>
              {this.state[`${field.name}Tags`].length !== 0 && (
                <div className='mt-1'>
                  {this.state[`${field.name}Tags`].map((tag, index) => (
                    <button
                      children={tag}
                      className='btn btn-sm btn-info mr-1'
                      key={`${field.name}-${index}`}
                      onClick={() => this.removeTag(field.name, tag)}
                      type='button'
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'textarea':
        return (
          <div className='form-group row' key={String(index)}>
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
          <div className='form-group row' key={String(index)}>
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
          autoComplete='off'
          className='form mb-0'
          noValidate
          onSubmit={this.submit.bind(this)}
          ref={node => this.$form = node}
        >
          {this.props.schema.map(this.renderField.bind(this))}
          <div className='form-group row'>
            <div className='col-sm-10 offset-sm-2 text-right'>
              <button
                children='Cancel'
                className='btn btn-secondary mr-3'
                onClick={this.props.onCancel.bind(this)}
                type='button'
              />
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
