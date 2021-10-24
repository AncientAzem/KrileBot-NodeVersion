/* eslint-disable global-require */
const { SetPermissions } = require('./commands')
const { Setup, Get } = require('./S3')

const Commands = {
    SetPermissions,
}

const FileStorage = {
    Setup,
    Get,
}
module.exports = {
    Commands,
    FileStorage,
}
