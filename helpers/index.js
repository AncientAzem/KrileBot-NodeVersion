/* eslint-disable global-require */
const { SetPermissions, RegisterGuildCommands, RegisterApplicationCommands } = require('./commands')
const { Setup, Get } = require('./S3')
const { StartActivity } = require('./general')

const Activities = {
    'Youtube Together': '755600276941176913',
    'Youtube Together (Dev Build)': '880218832743055411',
    'Poker Night': '755827207812677713',
    'Chess in the Park': '832012774040141894',
    Betrayal: '773336526917861400',
}

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
    Activities,
    StartActivity,
}
