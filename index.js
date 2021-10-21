const fs = require('fs')
const dotenv = require('dotenv')

const aws = require('aws-sdk')
const firebaseAdmin = require('firebase-admin')

const { Client, Collection, Intents } = require('discord.js')
const { Interactions, Messages } = require('./events')

dotenv.config()

// Discord Client Setup
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_BANS,
    ],
})

// Setup Commands
client.commands = new Collection()
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'))

const commands = []
commandFiles.forEach((file) => {
    // eslint-disable-next-line global-require
    const command = require(`./commands/${file}`)
    commands.push(command)
    client.commands.set(command.data.name, command)
})

client.once('ready', async () => {
    // Set Status Message
    client.user.setActivity('Ejika\'s theories', { type: 'LISTENING' })

    // Add Guild Command Permission
    const guild = client.guilds.cache.get(process.env.GUILD_ID)
    if (guild) {
        const guildCommands = await guild.commands.fetch()
        guildCommands.forEach((cmd) => {
            const { permissions, data } = commands.find((x) => x.data.name === cmd.name)
            if (permissions) {
                permissions.forEach((perm) => {
                    console.log(`Adding Permissions for ${data.name} | Type: ${perm.type} | ID of Restriction: ${perm.id}`)
                })
                cmd.permissions.add({ permissions })
            }
        })
    }
    console.log('Bot is ready and online!')
})

// Event Processing
client.on(Interactions.incoming.name, async (interaction) => {
    await Interactions.incoming.execute(client, interaction)
})

// Logging
if (process.env.ENABLE_LOGGING) {
    client.on(Messages.deletion.name, (message) => {
        const logChannel = client.channels.cache.get(process.env.LOGGING_CHANNEL)
        Messages.deletion.execute(message, logChannel)
    })
}

// Start Bot
client.login(process.env.TOKEN)
