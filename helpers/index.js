/* eslint-disable global-require */
const { SetPermissions, RegisterGuildCommands, RegisterApplicationCommands } = require('./commands')
const { Setup, Get } = require('./S3')

const Commands = {
    SetPermissions,
    RegisterGuildCommands,
    RegisterApplicationCommands,
}

const FileStorage = {
    Setup,
    Get,
}
module.exports = {
    Commands,
    FileStorage,
}
