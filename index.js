const fs = require('fs')
const dotenv = require('dotenv')

const aws = require('aws-sdk')
const firebaseAdmin = require('firebase-admin')

const { Client, Collection, Intents } = require('discord.js')
const { Interactions, Messages } = require('./events')

dotenv.config()

// DigitalOcean Spaces Setup
const spacesEndpoint = new aws.Endpoint('sfo3.digitaloceanspaces.com')
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
})

s3.getObject({ Bucket: 'isle-of-val', Key: 'firebase-admin.json' }, async (err, object) => {
    if (err) {
        throw new Error('Unable to connect to bucket to obtain firebase admin sdk info')
    }
    // Firebase Setup
    await firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(JSON.parse(object.Body)),
        databaseURL: 'https://isle-of-val-default-rtdb.firebaseio.com',
    })

    const db = await firebaseAdmin.firestore().collection('krilebot')

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
        const config = db.doc('globals')

        config.get('status').then((result) => {
            const { status } = result.data()
            client.user.setActivity(status.message, status.type)
        })

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
    await client.login(process.env.TOKEN)
})
