import React from 'react'
import showdown from 'showdown'

showdown.setFlavor('github')
const showdownConverter = new showdown.Converter()

export default class MarkdownField extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      htmlSource: '',
      isPreviewOpened: false,
    }
  }

  togglePreview() {
    const isPreviewOpened = !this.state.isPreviewOpened

    this.setState({
      htmlSource: 'Loading...',
      isPreviewOpened: !this.state.isPreviewOpened,
    })

    if (isPreviewOpened) this.convertToHtml()
  }

  convertToHtml() {
    this.setState({
      htmlSource: showdownConverter.makeHtml(this.$textarea.value).replace(/\n/g, '') || '<p>Nothing to preview.</p>'
    })
  }

  render() {
    return (
      <div className='card'>
        <div className='card-header'>
          <ul className='nav nav-tabs card-header-tabs'>
            <li className='nav-item' onClick={this.togglePreview.bind(this)}>
              <span className={`nav-link${!this.state.isPreviewOpened ? ' active' : ''}`}>Write</span>
            </li>
            <li className='nav-item' onClick={this.togglePreview.bind(this)}>
              <span className={`nav-link${this.state.isPreviewOpened ? ' active' : ''}`}>Preview</span>
            </li>
          </ul>
        </div>
        <div className='card-body p-0'>
          <textarea
            autoCapitalize='off'
            autoCorrect='off'
            className={`form-control border-0 form__markdownField${this.props.hasError ? ' is-invalid' : ''}`}
            defaultValue={this.props.defaultValue !== undefined ? this.props.defaultValue : ''}
            disabled={this.props.isDisabled}
            id={this.props.name}
            name={this.props.name}
            spellCheck='false'
            style={{ display: !this.state.isPreviewOpened ? 'block' : 'none' }}
            ref={node => this.$textarea = node}
            type='text'
          />
          {this.state.isPreviewOpened && (
            <div
              className='p-2 pre-scrollable form__markdownPreview'
              dangerouslySetInnerHTML={{ __html: this.state.htmlSource }}
            />
          )}
        </div>
      </div>
    )
  }
}
