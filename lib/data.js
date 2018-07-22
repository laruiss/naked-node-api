const fs = require('fs')
const path = require('path')
// Promisify all used fs functions
const { promisify } = require('util');
const closeAsync = promisify(fs.close);
const openAsync = promisify(fs.open);
const readFileAsync = promisify(fs.readFile);
const truncateAsync = promisify(fs.truncate);
const unlinkAsync = promisify(fs.unlink);
const writeFileAsync = promisify(fs.writeFile);

const helpers = require('./helpers')

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

const read = async (dir, file) => {
  const userAsString = await readFileAsync(`${basedir}/${dir}/${file}.json`, 'utf-8')
  console.log({userAsString})
  return helpers.parseJsonToObject(userAsString)
}

const update = async (dir, file, data) => {
  // Open the existing file
  const fileDescriptor = await openAsync(`${basedir}/${dir}/${file}.json`, 'r+')
  if (!fileDescriptor) {
    throw new Error('Could not open file', file, 'in', dir)
  }
  // Get data to save
  const stringData = JSON.stringify(data)
  // Truncate existing data
  await truncateAsync(fileDescriptor)
  await writeFileAsync(fileDescriptor, stringData)
  await closeAsync(fileDescriptor)
}

const remove = async (dir, file) => (
  await unlinkAsync(`${basedir}/${dir}/${file}.json`)
)

module.exports = {
  read,
  create,
  update,
  remove,
}