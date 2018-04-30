import moment from 'moment'
import React from 'react'

export default class Table extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isDeleting: false,
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

  renderHead(field, index) {
    return (
      <th
        className={`${field.type === 'boolean' ? 'text-center ' : ''}list__headCell`}
        key={index}
        onClick={() => this.props.onSort(field.name)}
        scope='col'
      >
        {field.type === 'boolean' ? field.label[0] : field.label}
        {this.props.sortBy === field.name && field.type !== 'boolean' && (
          <i className='material-icons'>{this.props.sortOrder ? 'arrow_drop_up' : 'arrow_drop_down'}</i>
        )}
      </th>
    )
  }

  renderRow(item, index) {
    if (item._id === this.state.removeConfirmationItemId) {
      if (this.state.isDeleting) {
        return (
          <tr className='table-info' key={index}>
            <td className='no-select' colSpan={this.props.columns.length + 2}>
              Deleting {item[this.props.defaultName]}...
            </td>
          </tr>
        )
      }

      return (
        <tr className='table-danger' key={index}>
          <td className='no-select' colSpan={this.props.columns.length}>
            Are you sure to remove « {item[this.props.defaultName]} » ?
          </td>
          <td className='bg-danger no-select list__iconCell' onClick={() => this.delete(item._id)}>
            <i className='material-icons'>done</i>
          </td>
          <td className='bg-primary no-select list__iconCell' onClick={() => this.setState({ removeConfirmationItemId: '' })}>
            <i className='material-icons'>clear</i>
          </td>
        </tr>
      )
    }

    const buttonClass = this.props.isLoading || this.state.isDeleting ? 'text-muted' : 'text-primary'

    return  (
      <tr key={index}>
        {this.props.columns.map(({ name, type }, index) => {
          switch (type) {
            case 'boolean':
              return (
                <td className='text-center list__iconCell' key={index}>
                  {item[name]
                    ? <i className='material-icons text-success'>done</i>
                    : <i className='material-icons text-danger'>clear</i>
                  }
                </td>
              )

            case 'date':
              return <td key={index}>{moment(item[name]).fromNow()}</td>

            default:
              return <td key={index}>{item[name]}</td>
          }
        })}
        <td className={`${buttonClass} no-select list__iconCell`} onClick={() => this.edit(item._id)}>
          <i className='material-icons'>edit</i>
        </td>
        <td className={`${buttonClass} no-select list__iconCell`} onClick={() => this.remove(item._id)}>
          <i className='material-icons'>delete</i>
        </td>
      </tr>
    )
  }

  render() {
    return (
      <table className='table table-sm table-striped'>
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
