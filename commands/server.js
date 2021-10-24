const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    global: true,
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Display info about this server.')
        .setDefaultPermission(true),
    async execute(interaction) {
        return interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`)
    },
}
