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

module.exports = {
    SetPermissions,
}
