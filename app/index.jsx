import React from 'react'
import ReactDOM from 'react-dom'

import DataTable from './data-table'
import TranslateTable from './translate-table'

import getMeta from './helpers/getMeta'

if (document.getElementById('data-table') !== null) {
  ReactDOM.render(
    <DataTable meta={getMeta('meta')} model={getMeta('model')} schema={getMeta('schema')} />,
    document.getElementById('data-table')
  )
}

if (document.getElementById('translate-table') !== null) {
  ReactDOM.render(
    <TranslateTable isManager={getMeta('isManager')} meta={getMeta('meta')} />,
    document.getElementById('translate-table')
  )
}
