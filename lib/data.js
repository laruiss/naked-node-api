const fs = require('fs')
const path = require('path')
// Promisify all used fs functions
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const openAsync = promisify(fs.open);
const closeAsync = promisify(fs.close);

const basedir = path.join(__dirname, '..', '.data')

const create = async (dir, file, data) => {
  const fileDescriptor = await openAsync(`${basedir}/${dir}/${file}.json`, 'wx')
  if (!fileDescriptor) {
    throw new Error('Could not open file', file, 'in', dir)
  }
  const stringData = JSON.stringify(data)
  await writeFileAsync(fileDescriptor, stringData)
  await closeAsync(fileDescriptor)
}

module.exports = {
  basedir,
  create,
}