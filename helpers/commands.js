const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')

function SetPermissions(client, commandFiles, guildId) {
    console.log(`Setting command permissions for guild "${guildId}".....`)
    const guild = client.guilds.cache.get(guildId)
    if (guild) {
        guild.commands.fetch().then((result) => {
            result.forEach((cmd) => {
                const { permissions, data } = commandFiles.find((x) => x.data.name === cmd.name)
                if (permissions) {
                    cmd.permissions.add({ permissions }).then(() => console.log(`Permissions added for "/${data.name}" in guild "${guildId}"`))
                }
            })
        })
    }
}

/**
 * Registers application commands in server(s)
 * @param {Array<number>} approvedServers
 */
function RegisterWithDiscord(commands, approvedServers = [process.env.GUILD_ID]) {
    const discordApi = new REST({ version: '9' }).setToken(process.env.TOKEN)
    approvedServers.forEach((server) => {
        discordApi.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, server), { body: commands })
            .then(() => console.log(`Successfully registered server commands for guild ${server}`))
            .catch(console.error)
    })
}

module.exports = {
    SetPermissions,
    RegisterWithDiscord,
}
