const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js')
const firebaseAdmin = require('firebase-admin')

module.exports = {
    global: false,
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
    isModeration: true,
    async execute(client, interaction) {
        const { guildId, options } = interaction
        const amount = options.getInteger('amount')
        let channel = options.getInteger('channel')
        if (channel === null) {
            channel = interaction.channel
        }
        const logMessage = new MessageEmbed()
            .setColor('#c22f25')
            .setTitle('Messages Pruned')
            .setDescription(`I have just pruned ${amount} messages. See below for details`)
            .addField('Channel', `<#${channel.id}>`)
            .addField('Trigger By', `@${interaction.user.tag}`)

        if (amount <= 1 || amount > 100) {
            console.log('amount too small')
            return interaction.reply({ content: 'You need to input a number between 2 and 99.', ephemeral: true })
        }
        console.log('checking channel')
        if (channel) {
            if (!channel.isText()) { return interaction.reply({ content: `Unable to prune messages. ${channel.name} is not a text channel` }) }
            interaction.reply({ content: 'Your prune request is now being processed...', ephemeral: true })
            await channel.bulkDelete(amount)
                .then(async () => {
                    await interaction.followUp({
                        content: `Successfully pruned \`${amount}\` messages.`,
                        ephemeral: true,
                    })
                    const db = firebaseAdmin.firestore().collection('krilebot')
                    const serverConfig = await db.doc(`/config/servers/${guildId}`).get()
                    if (serverConfig.data() && serverConfig.data().logChannel) {
                        const loggingChannel = await client.channels.cache.get(serverConfig.data().logChannel)
                        console.log('sending log')
                        loggingChannel.send({ embeds: [logMessage] })
                    }
                })
                .catch((error) => {
                    console.error(error)
                    interaction.editReply({ content: `There was an error trying to prune messages in ${channel.name}`, ephemeral: true })
                })
        } else {
            interaction.channel.bulkDelete(amount, true)
                .catch((error) => {
                    console.error(error)
                    interaction.editReply({ content: 'There was an error trying to prune messages in this channel', ephemeral: true })
                })
        }
    },
}
