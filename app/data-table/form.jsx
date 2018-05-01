import * as R from 'ramda'
import React from 'react'

import keyify from '../helpers/keyify'

export default class Form extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isUpdating: false,
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps.isLoading && prevState.isUpdating) {
      return {
        isUpdating: false,
      }
    }

    return null
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isUpdating && prevState.isUpdating && R.isEmpty(this.props.errors)) this.$form.reset()
  }

  submit(event) {
    event.preventDefault()
    this.setState({ isUpdating: true })
    this.props.onSubmit(this.$form)
  }

  renderField(schemaProp, index) {
    const hasError = this.props.errors[schemaProp.name] !== undefined

    switch (schemaProp.type) {
      case 'boolean':
        return (
          <div className='form-group row' key={index}>
            <div className='col-sm-10 offset-md-2'>
              <input
                className='form-check-input'
                defaultChecked={this.props.initialData !== undefined ? this.props.initialData[schemaProp.name] : false}
                disabled={this.props.isLoading || this.state.isUpdating}
                id={schemaProp.name}
                key={this.props.initialData !== undefined ? keyify(this.props.initialData[schemaProp.name]) : undefined}
                name={schemaProp.name}
                type='checkbox'
              />
              <label className='form-check-label no-select' htmlFor={schemaProp.name}>{schemaProp.label}</label>
            </div>
          </div>
        )

      case 'foreign':
        return (
          <div className='form-group row' key={index}>
            <label className='col-sm-2 col-form-label no-select' htmlFor={schemaProp.name}>{schemaProp.label}</label>
            <div className='col-sm-10'>
              <select
                className={['form-control', hasError ? 'is-invalid' : ''].join(' ').trim()}
                defaultValue={this.props.initialData !== undefined ? this.props.initialData[schemaProp.name]._id : ''}
                disabled={this.props.isLoading || this.state.isUpdating}
                id={schemaProp.name}
                key={this.props.initialData !== undefined ? keyify(this.props.initialData[schemaProp.name].name) : undefined}
                name={schemaProp.name}
              >
                <option value='' />
                {this.props.foreignData[schemaProp.name].map((foreignDataItem, index) => (
                  <option
                    children={foreignDataItem.name}
                    key={index}
                    value={foreignDataItem._id}
                  />
                ))}
              </select>
              <div className='invalid-feedback'>{hasError && this.props.errors[schemaProp.name].message}</div>
            </div>
          </div>
        )

      default:
        return (
          <div className='form-group row' key={index}>
            <label className='col-sm-2 col-form-label no-select' htmlFor={schemaProp.name}>{schemaProp.label}</label>
            <div className='col-sm-10'>
              <input
                autoCapitalize='off'
                autoCorrect='off'
                className={['form-control', hasError ? 'is-invalid' : ''].join(' ').trim()}
                defaultValue={this.props.initialData !== undefined ? this.props.initialData[schemaProp.name] : ''}
                disabled={this.props.isLoading || this.state.isUpdating}
                id={schemaProp.name}
                key={this.props.initialData !== undefined ? keyify(this.props.initialData[schemaProp.name]) : undefined}
                name={schemaProp.name}
                spellCheck='false'
                type='text'
              />
              <div className='invalid-feedback'>{hasError && this.props.errors[schemaProp.name].message}</div>
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
            <div className='col-sm-10 offset-sm-2'>
              <button
                children={this.props.action.toUpperCase()}
                className='btn btn-primary'
                disabled={this.props.isLoading || this.state.isUpdating}
                type='submit'
              />
            </div>
          </div>
        </form>
      </div>
    )
  }
}
