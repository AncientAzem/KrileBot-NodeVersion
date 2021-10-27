const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const firebaseAdmin = require('firebase-admin')

async function SetPermissions(client, commandFiles, guildId) {
    const guild = client.guilds.cache.find((g) => g.id == guildId)
    if (guild) {
        console.log(`Setting command permissions for guild "${guildId}".....`)
        const db = firebaseAdmin.firestore().collection('krilebot')
        const serverConfig = await db.doc(`/config/servers/${guild.id}`).get()
        if (serverConfig.data() && serverConfig.data().moderatorCommandRoles) {
            const roles = serverConfig.data().moderatorCommandRoles
            guild.commands.fetch().then((result) => {
                result.forEach((cmd) => {
                    const { isModeration, data } = commandFiles.find((x) => x.data.name === cmd.name)
                    if (isModeration) {
                        const perms = []
                        roles.forEach((roleId) => {
                            perms.push({
                                id: roleId,
                                type: 'ROLE',
                                permission: true,
                            })
                        })
                        cmd.permissions.add({ permissions: perms }).then(() => console.log(`Permissions added for "/${data.name}" in guild "${guildId}"`))
                    }
                })
            })
        } else {
            console.log('WARNING: No moderation roles have been set for this sever. Some commands may not be available for use')
        }
    }
}

/**
 * Registers application commands in server(s)
 * @param {Array<number>} approvedServers
 */
function RegisterGuildCommands(commands, approvedServers = [process.env.GUILD_ID]) {
    console.log(commands)
    const discordApi = new REST({ version: '9' }).setToken(process.env.TOKEN)
    approvedServers.forEach((server) => {
        discordApi.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, server), { body: commands })
            .then(() => console.log(`Successfully registered server commands for guild ${server}`))
            .catch(console.error)
    })
}
/**
 * Registers global application commands
 */
function RegisterApplicationCommands(commands) {
    const discordApi = new REST({ version: '9' }).setToken(process.env.TOKEN)
    discordApi.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
        .then(() => console.log('Successfully registered application level command'))
        .catch(console.error)
}

module.exports = {
    SetPermissions,
    RegisterGuildCommands,
    RegisterApplicationCommands,
}
