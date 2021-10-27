/* eslint-disable no-unexpected-multiline */
const fs = require('fs')
const dotenv = require('dotenv')
const { Commands } = require('./helpers')

dotenv.config()

const globalCommands = []
const guildCommands = []
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'))
commandFiles.forEach((file) => {
    // eslint-disable-next-line global-require
    const command = require(`./commands/${file}`)
    if (command.global) {
        globalCommands.push(command.data.toJSON())
    } else {
        guildCommands.push(command.data.toJSON())
    }
})

const options = process.argv.slice(2)
if (options.length === 0) {
    throw new Error('Unable to register commands. Please pass in the types of commands you want to register (guild | global)')
}

if (options.includes('dev-mode')) {
    Commands.RegisterGuildCommands(guildCommands)
    Commands.RegisterGuildCommands(globalCommands)
} else {
    if (options.includes('guild')) {
        Commands.RegisterGuildCommands(guildCommands)
    }
    if (options.includes('global')) {
        Commands.RegisterApplicationCommands(globalCommands)
    }
}
