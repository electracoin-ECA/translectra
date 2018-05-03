import moment from 'moment'
import React from 'react'

export default class Table extends React.PureComponent {
  // constructor(props) {
  //   super(props)

  //   this.state = {
  //     openedKeyId: '',
  //   }
  // }

  renderRow(key) {
    const buttonClass = this.props.isLoading ? 'text-muted' : 'text-primary'

    return [
      <tr key={key._id}>
        <td key={`${key._id}-name`}>{key.name}</td>
        <td key={`${key._id}-updatedAt`}>{moment(key.updatedAt).fromNow()}</td>
        {key.note !== undefined && key.note.length !== 0
          ? (
            <td
              className='text-center text-info list__iconCell list__iconCell-action'
              key={`${key._id}-note`}
              title={key.note}
            >
              <i children='note' className='material-icons' />
            </td>
          )
          : <td className='list__iconCell' key={`${key._id}-note`} />
        }
        {key.url !== undefined && key.url.length !== 0
          ? (
            <td
              className='text-center text-info list__iconCell list__iconCell-action'
              key={`${key._id}-url`}
              onClick={() => window.open(key.url, '_blank')}
            >
              <i className='material-icons'>link</i>
            </td>
          )
          : <td className='list__iconCell' key={`${key._id}-url`} />
        }
      </tr>,
      <tr key={`${key._id}-projects`}>
        <td className='pt-0 border-top-0' colSpan='4' style={{ lineHeight: 1 }}>
          {key.projects.map(({ _id, name: _name }) =>
            <span children={_name} className='badge badge-info no-select mr-1' key={_id} />,
          )}
        </td>
      </tr>,
      <tr key={`${key._id}-value`}>
        <td className='bg-light font-italic pt-0 border-top-0' colSpan='4'>
          {key.value}
        </td>
      </tr>
    ]
  }

  render() {
    return (
      <table className='table table-sm'>
        <thead>
          <tr className={`no-select${this.props.isLoading ? ' text-muted' : ''}`}>
            <th key='name' scope='col'>Name</th>
            <th key={'updatedAt'} scope='col'>
              Updated
              <i className='material-icons'>arrow_drop_down</i>
            </th>
            <th className='text-center' key='note' scope='col' />
            <th className='text-center' key='url' scope='col' />
          </tr>
        </thead>
        <tbody>
          {this.props.items.map(this.renderRow.bind(this))}
        </tbody>
      </table>
    )
  }
}
