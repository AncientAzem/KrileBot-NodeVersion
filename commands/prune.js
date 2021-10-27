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
        let channel = options.getChannel('channel')
        if (channel === null) {
            channel = interaction.channel
        }

        if (amount <= 1 || amount > 100) {
            return interaction.reply({ content: 'You need to input a number between 2 and 99', ephemeral: true })
        }
        if (channel) {
            if (!channel.isText()) { return interaction.reply({ content: `Unable to prune messages. <#${channel.id}> is not a text channel` }) }
            await interaction.deferReply({ ephemeral: true })
            await channel.bulkDelete(amount, true)
                .then(async (result) => {
                    if (result.size > 0) {
                        let replyString = `Successfully pruned \`${result.size}\` messages in <#${channel.id}>`
                        if (result.size < amount) {
                            replyString += `. However, ${amount - result.size} messages were not pruned due to them being too old for the bot to clear.`
                        }
                        await interaction.followUp({
                            content: replyString,
                            ephemeral: true,
                        })

                        const db = firebaseAdmin.firestore().collection('krilebot')
                        const serverConfig = await db.doc(`/config/servers/${guildId}`).get()
                        if (serverConfig.data() && serverConfig.data().logChannel) {
                            const loggingChannel = await client.channels.cache.get(serverConfig.data().logChannel)
                            const logMessage = new MessageEmbed()
                                .setColor('#c22f25')
                                .setTitle('Messages Pruned')
                                .setDescription(`I have just pruned ${result.size} messages. See below for details`)
                                .addField('Channel', `<#${channel.id}>`)
                                .addField('Trigger By', `@${interaction.user.tag}`)
                            loggingChannel.send({ embeds: [logMessage] })
                        }
                    } else {
                        await interaction.followUp({
                            content: `Unable to prune messages in <#${channel.id}>. To prune messages, the messages in question must not be older than 14 days.`,
                            ephemeral: true,
                        })
                    }
                })
                .catch(() => {
                    interaction.followUp({ content: `There was an error trying to prune messages in <#${channel.id}>`, ephemeral: true })
                })
        } else {
            interaction.channel.bulkDelete(amount, true)
                .catch(() => {
                    interaction.reply({ content: 'There was an error trying to prune messages in this channel', ephemeral: true })
                })
        }
    },
}
