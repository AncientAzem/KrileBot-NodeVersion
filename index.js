const fs = require('fs')
const dotenv = require('dotenv')
const firebaseAdmin = require('firebase-admin')

const { Client, Collection, Intents } = require('discord.js')
const { Interactions, Messages } = require('./events')
const { Commands, FileStorage } = require('./helpers')

dotenv.config()
async function startApp() {
    const firebaseConfig = await FileStorage.Get('firebase-admin.json')
    if (!firebaseConfig) {
        throw new Error('Unable to connect to bucket to obtain firebase admin sdk info')
    }

    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(JSON.parse(firebaseConfig)),
        databaseURL: 'https://isle-of-val-default-rtdb.firebaseio.com',
    })
    const db = firebaseAdmin.firestore().collection('krilebot')
    const botConfig = await db.doc('config').get()

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
    const approvedServers = botConfig.get('approvedServers')

    const commands = []
    commandFiles.forEach((file) => {
        // eslint-disable-next-line global-require
        const command = require(`./commands/${file}`)
        commands.push(command)
        client.commands.set(command.data.name, command)
    })

    client.once('ready', async () => {
        client.user.setActivity(botConfig.get('statusMessage'), { type: botConfig.get('statusType') })
        approvedServers.forEach((guildId) => {
            Commands.SetPermissions(client, commands, guildId)
        })

        console.log('KrileBot is now online')
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
    await client.login(process.env.TOKEN)
}

// noinspection JSIgnoredPromiseFromCall
startApp()
