const fs = require('fs')
const dotenv = require('dotenv')
const { Client, Collection, Intents } = require('discord.js')

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

dotenv.config()
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
    client.user.setActivity('Ejika\'s theories', { type: 'LISTENING' })

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

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) return

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
    }
})

client.login(process.env.TOKEN)
