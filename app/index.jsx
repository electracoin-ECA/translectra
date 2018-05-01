import React from 'react'
import ReactDOM from 'react-dom'

import DataTable from './data-table'

import getMeta from './helpers/getMeta'

if (document.getElementById('data-table') !== null) {
  ReactDOM.render(
    <DataTable meta={getMeta('meta')} model={getMeta('model')} schema={getMeta('schema')} />,
    document.getElementById('data-table')
  )
}
