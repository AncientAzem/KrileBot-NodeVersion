/* eslint-disable no-unexpected-multiline */
const fs = require('fs')
const dotenv = require('dotenv')
const { Commands } = require('./helpers')

dotenv.config()

const commands = []
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'))
commandFiles.forEach((file) => {
    // eslint-disable-next-line global-require
    const command = require(`./commands/${file}`)
    commands.push(command.data.toJSON())
})

Commands.RegisterWithDiscord(commands)
