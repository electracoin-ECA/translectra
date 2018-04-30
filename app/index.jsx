import React from 'react'
import ReactDOM from 'react-dom'

import App from './app'

import getMeta from './helpers/getMeta'

if (document.getElementById('root') !== null) {
  ReactDOM.render(
    <App meta={getMeta('meta')} model={getMeta('model')} schema={getMeta('schema')} />,
    document.getElementById('root')
  )
}
