import highlightJs from 'highlight.js'
import moment from 'moment'
import React from 'react'

export default class Table extends React.PureComponent {
  constructor(props) {
    super(props)

    this.actionColumnsLength = Number(this.props.canDelete) + Number(this.props.canEdit) + props.extraActions.length
    this.hasMarkdownFields = Boolean(props.columns.filter(({ type }) => type === 'markdown').length)

    this.state = {
      confirmActionForItemId: '',
      confirmActionText: '',
      confirmActionRunText: '',
      highlightedItemId: '',
      isRunningAction: false,
      openedItemId: '',
      rowWidth: '0',
      sortBy: props.sortBy,
      sortOrder: props.sortOrder,
    }
  }

  componentDidMount() {
    this.updateRowWidth()
    window.addEventListener('resize', this.updateRowWidth.bind(this))
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps.isLoading && prevState.isRunningAction) {
      return {
        confirmActionForItemId: '',
        isRunningAction: false,
      }
    }

    return null
  }

  componentDidUpdate() {
    if (
      this.hasMarkdownFields &&
      this.state.openedItemId.length !== 0 &&
      this.state.highlightedItemId !== this.state.openedItemId
    ) {
      this.setState({ highlightedItemId: this.state.openedItemId })
      highlightJs.highlightBlock(this.$code)
    }
  }

  updateRowWidth() {
    this.setState({ rowWidth: `${document.querySelector('tr').clientWidth}px` })
  }

  toggleOpenedItem(itemId) {
    this.setState({
      highlightedItemId: '',
      openedItemId: this.state.openedItemId === itemId ? '' : itemId,
    })
  }

  edit(itemId) {
    if (this.props.isLoading) return

    this.props.onEdit(itemId)
  }

  remove(itemId) {
    if (this.props.isLoading) return

    this.setState({
      confirmActionForItemId: itemId,
      confirmActionText: `Are you sure to delete « {defaultName} » ?`,
      confirmActionRunText: `Deleting « {defaultName} »...`,
      onActionConfirm: this.delete.bind(this),
    })
  }

  delete(itemId) {
    if (this.props.isLoading) return

    this.setState({ isRunningAction: true })
    this.props.onDelete(itemId)
  }

  confirmExtraAction(index, itemId) {
    this.setState({
      confirmActionForItemId: itemId,
      confirmActionText: this.props.extraActions[index].confirmActionText,
      confirmActionRunText: this.props.extraActions[index].confirmActionRunText,
      onActionConfirm: () => this.runExtraAction(index, itemId),
    })
  }

  runExtraAction(index, itemId) {
    if (this.props.isLoading) return

    this.setState({ isRunningAction: true })
    this.props.extraActions[index].onActionConfirm(itemId)
  }

  renderHead({ label, name, type }) {
    switch (type) {
      case 'boolean':
        return (
          <th
            className='text-center list__headCell'
            key={name}
            onClick={() => this.props.onSort(name, type)}
            scope='col'
          >
            {label[0]}
          </th>
        )

      case 'link':
      case 'markdown':
      case 'textarea':
      case 'tooltip':
        return (
          <th
            className='text-center'
            key={name}
            scope='col'
          />
        )

      case 'collection':
        return undefined

      case 'date':
        return (
          <th
            className='list__headCell'
            key={name}
            onClick={() => this.props.onSort(name, type)}
            scope='col'
          >
            {label}
            {this.props.sortBy === name && (
              <i className='material-icons'>{!this.props.sortOrder ? 'arrow_drop_up' : 'arrow_drop_down'}</i>
            )}
          </th>
        )

      default:
        return (
          <th
            className='list__headCell'
            key={name}
            onClick={() => this.props.onSort(name, type)}
            scope='col'
          >
            {label}
            {this.props.sortBy === name && (
              <i className='material-icons'>{this.props.sortOrder ? 'arrow_drop_up' : 'arrow_drop_down'}</i>
            )}
          </th>
        )
    }
  }

  renderRow(item) {
    if (item._id === this.state.confirmActionForItemId) {
      if (this.state.isRunningAction) {
        return (
          <tr className='table-info' key={+Date.now()}>
            <td className='no-select' colSpan={this.props.columns.length + this.actionColumnsLength}>
              {this.state.confirmActionRunText.replace('{defaultName}', item[this.props.defaultName])}
            </td>
          </tr>
        )
      }

      return (
        <tr className='table-danger' key={+Date.now()}>
          <td className='no-select' colSpan={this.props.columns.length}>
            {this.state.confirmActionText.replace('{defaultName}', item[this.props.defaultName])}
          </td>
          <td
            className='bg-danger text-light text-center no-select list__iconCell list__iconCell-action'
            onClick={() => this.state.onActionConfirm(item._id)}
          >
            <i className='material-icons'>done</i>
          </td>
          <td
            className='bg-primary text-light text-center no-select list__iconCell list__iconCell-action'
            onClick={() => this.setState({ confirmActionForItemId: '' })}
          >
            <i className='material-icons'>clear</i>
          </td>
        </tr>
      )
    }

    const actionClass = this.props.isLoading ? 'text-muted' : 'text-primary'

    return [
      <tr key={item._id}>
        {this.props.columns.map(({ name, type }) => {
          switch (type) {
            case 'boolean':
              return (
                <td className='text-center list__iconCell' key={`${item._id}-${name}`}>
                  {item[name]
                    ? <i className='material-icons text-success'>done</i>
                    : <i className='material-icons text-danger'>clear</i>
                  }
                </td>
              )

            case 'collection':
              return undefined

            case 'date':
              return <td key={`${item._id}-${name}`}>{moment(item[name]).fromNow()}</td>

            case 'foreign':
              return <td key={`${item._id}-${name}`}>{item[name].name}</td>

            case 'link':
              return item[name] !== undefined && item[name].length !== 0
                ? (
                  <td
                    className='text-center text-info list__iconCell list__iconCell-action'
                    key={`${item._id}-${name}`}
                    onClick={() => window.open(item[name], '_blank')}
                  >
                    <i className='material-icons'>link</i>
                  </td>
                )
                : <td className='list__iconCell' key={`${item._id}-${name}`} />

            case 'markdown':
            case 'textarea':
              return item[name] !== undefined && item[name].length !== 0
                ? (
                  <td
                      className='text-center text-info list__iconCell list__iconCell-action'
                      key={`${item._id}-${name}`}
                      onClick={() => this.toggleOpenedItem(item._id)}
                    >
                      <i className='material-icons'>short_text</i>
                  </td>
                )
                : <td className='list__iconCell' key={`${item._id}-${name}`} />

            case 'tooltip':
              return item[name] !== undefined && item[name].length !== 0
                ? (
                  <td
                    className='text-center text-info list__iconCell list__iconCell-action'
                    key={`${item._id}-${name}`}
                    title={item[name]}
                  >
                    <i children='note' className='material-icons' />
                  </td>
                )
                : <td className='list__iconCell' key={`${item._id}-${name}`} />

            default:
              return <td key={`${item._id}-${name}`}>{item[name]}</td>
          }
        })}
        {this.props.extraActions.map((action, index) => (
          <td
            className={`${actionClass} text-center no-select list__iconCell list__iconCell-action`}
            key={String(index)}
            onClick={() => this.confirmExtraAction(index, item._id)}
          >
            <i className='material-icons'>{action.icon}</i>
          </td>
        ))}
        {this.props.canEdit && (
          <td
            className={`${actionClass} text-center no-select list__iconCell list__iconCell-action`}
            onClick={() => this.edit(item._id)}
          >
            <i className='material-icons'>edit</i>
          </td>
        )}
        {this.props.canDelete && (
          <td
            className={`${actionClass} text-center no-select list__iconCell list__iconCell-action`}
            onClick={() => this.remove(item._id)}
          >
            <i className='material-icons'>delete</i>
          </td>
        )}
      </tr>,
      this.props.columns
        .filter(({ type }) => type === 'collection')
        .map(({ name }, index) => item[name].length !== 0
          ? (
            <tr key={`${item._id}-${name}`}>
              <td
                className='pt-0' colSpan={this.props.columns.length + this.actionColumnsLength}
                style={{ borderTop: 0, lineHeight: 1 }}
              >
                {item[name].map(({ _id, name: _name }) =>
                  <span children={_name} className='badge badge-info no-select mr-1' key={_id} />,
                )}
              </td>
            </tr>
          )
          : undefined
        ),
      this.state.openedItemId === item._id && this.props.columns
        .filter(({ type }) => ['markdown', 'textarea'].includes(type))
        .map(({ name, type }, index) => item[name].length !== 0
          ? (
            <tr key={`${item._id}-${name}`}>
              <td className='border-top-0 p-0' colSpan={this.props.columns.length + this.actionColumnsLength}>
                <pre className='pre-scrollable list__markdownHighlight mt-3' style={{ maxWidth: this.state.rowWidth }}>
                  <code
                    children={item[name]}
                    className={type === 'markdown' ? 'markdown' : undefined}
                    ref={node => this.$code = node}
                  />
                </pre>
              </td>
            </tr>
          )
          : undefined
        ),
    ]
  }

  render() {
    return (
      <table className='table table-sm'>
        <thead>
          <tr className={`no-select${this.props.isLoading ? ' text-muted' : ''}`}>
            {this.props.columns.map(this.renderHead.bind(this))}
            {this.props.extraActions.map((a, index) => <th className='list__iconHeadCell' key={index} scope='col' />)}
            {this.props.canEdit && <th className='list__iconHeadCell' scope='col' />}
            {this.props.canDelete && <th className='list__iconHeadCell' scope='col' />}
          </tr>
        </thead>
        <tbody>
          {this.props.items.map(this.renderRow.bind(this))}
        </tbody>
      </table>
    )
  }
}
