import axios from 'axios'
import React from 'react'

import DataTable from '../data-table'

const API_URL = '/api/key'

export default class KeysTable extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      isLoading: false,
    }
  }

  upgradeVersion(keyId) {
    console.warn(keyId)
    this.setState({ isLoading: true })

    axios.put(`${API_URL}/${keyId}/upgrade`)
      .then(() => this.setState({ isLoading: false }))
      .catch(() => this.setState({ isLoading: false }))
  }

  render() {
    return (
      <DataTable
        extraActions={[
          {
            confirmActionText: 'Are sure to upgrade the key version of « {defaultName} » ?',
            confirmActionRunText: 'Upgrading « {defaultName} » key version...',
            icon: 'publish',
            onActionConfirm: this.upgradeVersion.bind(this),
          },
        ]}
        isLoading={this.state.isLoading}
        meta={this.props.meta}
        model={this.props.model}
        schema={this.props.schema}
      />
    )
  }
}
