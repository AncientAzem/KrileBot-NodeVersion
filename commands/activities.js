const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageButton, MessageActionRow } = require('discord.js')
const { Activities, StartActivity } = require('../helpers')

module.exports = {
    global: true,
    data: new SlashCommandBuilder()
        .setName('activities')
        .setDescription('Starts an activity in a voice channel')
        .setDefaultPermission(true)
        .addStringOption((option) => option.setName('type')
            .setDescription('The activity you would like to start')
            .addChoice('Youtube Together', Activities['Youtube Together'])
            .addChoice('Youtube Together (Dev Build)', Activities['Youtube Together (Dev Build)'])
            .addChoice('Poker Night', Activities['Poker Night'])
            .addChoice('Chess in the Park', Activities['Chess in the Park'])
            .addChoice('Betrayal', Activities.Betrayal)
            .setRequired(true))
        .addChannelOption((option) => option
            .setName('target')
            .setDescription('The voice channel to start an activity in')
            .setRequired(true)),
    async execute(client, interaction) {
        const channel = interaction.options.getChannel('target')
        if (channel && channel.isVoice()) {
            const inviteLink = await StartActivity(channel.id, interaction.options.getString('type'))
            if (inviteLink) {
                const actions = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setLabel('Join the activity')
                            .setStyle('LINK')
                            .setURL(inviteLink),
                    )
                const activityName = Object.keys(Activities).find((key) => Activities[key] === interaction.options.getString('type'))
                return interaction.reply({ content: `And done! **${activityName}** has been started in <#${channel.id}>`, components: [actions] })
            }
            return interaction.reply('Unable to start a **Youtube Together** activity in the specific channel at this time.')
        }
        return interaction.reply('You did not specify a voice channel. Please try again.')
    },
}
