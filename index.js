const fs = require('fs')
const dotenv = require('dotenv')
const firebaseAdmin = require('firebase-admin')

const { Client, Collection, Intents } = require('discord.js')
const { DiscordTogether } = require('discord-together')
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
    client.activities = new DiscordTogether(client)
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

        const applicationCommands = await Commands.GetRegisteredCommands()
        applicationCommands.forEach((cmd) => {
            if (commands.filter((commandFile) => commandFile.data.name == cmd.name).length === 0) {
                client.application.commands.delete(cmd.id)
                    .then(() => console.log(`Application Command /${cmd.name} (${cmd.id}) has been deleted`))
                    .catch((error) => console.log(`Unable to Delete Application Command /${cmd.name} (${cmd.id})`, error))
            }
        })

        await Promise.all(approvedServers.map(async (guildId) => {
            try {
                const guildCommands = await Commands.GetRegisteredCommands(guildId)
                guildCommands.forEach((cmd) => {
                    if (commands.filter((commandFile) => commandFile.data.name == cmd.name).length === 0) {
                        client.guilds.cache.get(guildId).commands.delete(cmd.id)
                            .then(() => console.log(`Application Command /${cmd.name} (${cmd.id}) has been deleted in server (${guildId})`))
                            .catch((error) => console.log(`Unable to Delete Application Command /${cmd.name} (${cmd.id}) in Guild ${guildId}`, error))
                    }
                })

                await Commands.SetPermissions(client, commands.filter((c) => !c.global), guildId)
            } catch (e) {
                console.log(`Unable to manage commands for server ${guildId}`)
            }
        }))
        console.log('KrileBot is now online')
    })

    // Event Processing
    client.on(Interactions.incoming.name, async (interaction) => {
        await Interactions.incoming.execute(client, interaction)
    })

    // Logging
    client.on(Messages.deletion.name, async (message) => {
        const serverConfig = await db.doc(`/config/servers/${message.guildId}`).get()
        if (serverConfig.data() && serverConfig.data().logSettings.messageDeletion) {
            const logChannel = message.guild.channels.cache.get(serverConfig.data().logChannel)
            await Messages.deletion.execute(message, logChannel)
        }
    })

    // Start Bot
    await client.login(process.env.TOKEN)
}

// noinspection JSIgnoredPromiseFromCall
startApp()
