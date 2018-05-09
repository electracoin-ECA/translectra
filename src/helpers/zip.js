import log from '@inspired-beings/log'
const archiver = require('archiver')
import fs from 'fs'

// https://github.com/archiverjs/node-archiver#quick-start
export default function(directoryPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(`${directoryPath}.zip`)
    output.on('close', resolve)
    output.on('end', resolve)

    const archive = archiver('zip')
    archive.on('error', reject)
    archive.on('warning', log.warn)
    archive.pipe(output)

    archive
      .directory(directoryPath, false)
      .finalize()
  })
}
