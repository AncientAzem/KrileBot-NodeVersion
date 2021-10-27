const incoming = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        if (!interaction.isCommand()) return

        const command = client.commands.get(interaction.commandName)
        if (!command) return

        try {
            await command.execute(client, interaction)
        } catch (error) {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        }
    },
}

module.exports = {
    incoming,
}
