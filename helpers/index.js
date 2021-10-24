/* eslint-disable global-require */
const { SetPermissions, RegisterWithDiscord } = require('./commands')
const { Setup, Get } = require('./S3')

const Commands = {
    SetPermissions,
    RegisterWithDiscord,
}

const FileStorage = {
    Setup,
    Get,
}
module.exports = {
    Commands,
    FileStorage,
}
