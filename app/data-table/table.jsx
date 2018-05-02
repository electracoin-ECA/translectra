import moment from 'moment'
import React from 'react'

export default class Table extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isDeleting: false,
      openedItemId: '',
      removeConfirmationItemId: '',
      sortBy: props.sortBy,
      sortOrder: props.sortOrder,
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.isDeleting && !nextProps.isLoading) {
      return {
        isDeleting: false,
        removeConfirmationItemId: '',
      }
    }

    return null
  }

  toggleOpenedItem(itemId) {
    this.setState({
      openedItemId: this.state.openedItemId === itemId ? '' : itemId,
    })
  }

  edit(itemId) {
    if (this.props.isLoading || this.state.isDeleting) return
    this.props.onEdit(itemId)
  }

  remove(itemId) {
    if (this.props.isLoading || this.state.isDeleting) return
    this.setState({ removeConfirmationItemId: itemId })
  }

  delete(itemId) {
    this.setState({ isDeleting: true })
    this.props.onDelete(itemId)
  }

  renderHead({ label, name, type }) {
    switch (type) {
      case 'boolean':
      case 'link':
      case 'textarea':
      case 'tooltip':
        return (
          <th
            className='text-center list__headCell'
            key={name}
            onClick={() => this.props.onSort(name)}
            scope='col'
          >
            {type === 'boolean' && label[0]}
          </th>
        )

      case 'collection':
        return undefined

      default:
        return (
          <th
            className='list__headCell'
            key={name}
            onClick={() => this.props.onSort(name)}
            scope='col'
          >
            {label}
            <i className='material-icons'>{this.props.sortOrder ? 'arrow_drop_up' : 'arrow_drop_down'}</i>
          </th>
        )
    }
  }

  renderRow(item) {
    if (item._id === this.state.removeConfirmationItemId) {
      if (this.state.isDeleting) {
        return (
          <tr className='table-info' key={+Date.now()}>
            <td className='no-select' colSpan={this.props.columns.length + 2}>
              Deleting {item[this.props.defaultName]}...
            </td>
          </tr>
        )
      }

      return (
        <tr className='table-danger' key={+Date.now()}>
          <td className='no-select' colSpan={this.props.columns.length}>
            Are you sure to remove « {item[this.props.defaultName]} » ?
          </td>
          <td
            className='bg-danger text-light text-center no-select list__iconCell'
            onClick={() => this.delete(item._id)}
          >
            <i className='material-icons'>done</i>
          </td>
          <td
            className='bg-primary text-light text-center no-select list__iconCell'
            onClick={() => this.setState({ removeConfirmationItemId: '' })}
          >
            <i className='material-icons'>clear</i>
          </td>
        </tr>
      )
    }

    const buttonClass = this.props.isLoading || this.state.isDeleting ? 'text-muted' : 'text-primary'

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
        <td
          className={`${buttonClass} text-center no-select list__iconCell list__iconCell-action`}
          onClick={() => this.edit(item._id)}
        >
          <i className='material-icons'>edit</i>
        </td>
        <td
          className={`${buttonClass} text-center no-select list__iconCell list__iconCell-action`}
          onClick={() => this.remove(item._id)}
        >
          <i className='material-icons'>delete</i>
        </td>
      </tr>,
      this.props.columns
        .filter(({ type }) => type === 'collection')
        .map(({ name }, index) => item[name].length !== 0
          ? (
            <tr key={`${item._id}-${name}`}>
              <td className='pt-0' colSpan={this.props.columns.length + 2} style={{ borderTop: 0, lineHeight: 1 }}>
                {item[name].map(({ _id, name: _name }) =>
                  <span children={_name} className='badge badge-info no-select mr-1' key={_id} />,
                )}
              </td>
            </tr>
          )
          : undefined
        ),
      this.state.openedItemId === item._id && this.props.columns
        .filter(({ type }) => type === 'textarea')
        .map(({ name }, index) => item[name].length !== 0
          ? (
            <tr key={`${item._id}-${name}`}>
              <td
                className='bg-light font-italic'
                colSpan={this.props.columns.length + 2}
                style={{ borderTop: 0, fontSize: '12px' }}
              >
                {item[name]}
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
          <tr className='no-select'>
            {this.props.columns.map(this.renderHead.bind(this))}
            <th className='list__iconHeadCell' scope='col' />
            <th className='list__iconHeadCell' scope='col' />
          </tr>
        </thead>
        <tbody>
          {this.props.items.map(this.renderRow.bind(this))}
        </tbody>
      </table>
    )
  }
}
