/* eslint-disable global-require */
const {
    SetPermissions, RegisterGuildCommands, RegisterApplicationCommands, GetRegisteredCommands,
} = require('./commands')
const { Setup, Get } = require('./S3')
const { StartActivity } = require('./general')

const Commands = {
    SetPermissions,
    RegisterGuildCommands,
    RegisterApplicationCommands,
    GetRegisteredCommands,
}

const Activities = {
    'Youtube Together': 'youtube',
    'Poker Night': 'poker',
    'Chess in the Park': 'chess',
    'Doodle Crew': 'doodlecrew',
    'Letter Tile': 'lettertile',
}

const FileStorage = {
    Setup,
    Get,
}

module.exports = {
    Commands,
    Activities,
    FileStorage,
    StartActivity,
}
