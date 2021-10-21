const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prune')
        .setDescription('Remove recent messages from a channel (max of 99)')
        .setDefaultPermission(false)
        .addIntegerOption((option) => option
            .setName('amount')
            .setDescription('Number of messages to prune')
            .setRequired(true))
        .addChannelOption((option) => option
            .setName('channel')
            .setDescription('Channel to remove messages from')
            .setRequired(false)),
    permissions: [
        {
            id: process.env.ADMIN_ROLE,
            type: 'ROLE',
            permission: true,
        },
        {
            id: process.env.TESTER_ROLE,
            type: 'ROLE',
            permission: true,
        },
    ],
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount')
        const channel = interaction.options.getChannel('channel')

        if (amount <= 1 || amount > 100) {
            return interaction.reply({ content: 'You need to input a number between 2 and 99.', ephemeral: true })
        }
        if (channel) {
            if (!channel.isText()) { return interaction.reply({ content: `Unable to prune messages. ${channel.name} is not a text channel` }) }
            await channel.bulkDelete(amount)
                .catch((error) => {
                    console.error(error)
                    interaction.reply({ content: `There was an error trying to prune messages in ${channel.name}`, ephemeral: true })
                })
        } else {
            await interaction.channel.bulkDelete(amount, true)
                .catch((error) => {
                    console.error(error)
                    interaction.reply({ content: 'There was an error trying to prune messages in this channel', ephemeral: true })
                })
        }

        interaction.reply({ content: `Successfully pruned \`${amount}\` messages.`, ephemeral: true })

        const loggingChannel = await interaction.client.channels.cache.get(process.env.LOGGING_CHANNEL)
        if (loggingChannel) {
            loggingChannel.send()
        }
    },
}
