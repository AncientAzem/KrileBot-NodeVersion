const { SlashCommandBuilder } = require('@discordjs/builders')
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube-together')
        .setDescription('Starts a youtube together activity in the specified voice channel')
        .addChannelOption((option) => option
            .setName('target')
            .setDescription('The voice channel to start an activity in')
            .setRequired(true)),
    async execute(interaction) {
        const channel = interaction.options.getChannel('target')
        if (channel && !channel.isText()) {
            axios.post(`https://discord.com/api/v8/channels/${channel.id}/invites`,
                {
                    max_age: 86400,
                    max_uses: 0,
                    target_application_id: '755600276941176913', // youtube together
                    target_type: 2,
                    temporary: false,
                    validate: null,
                }, {
                    headers: {
                        Authorization: `Bot ${process.env.TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                })
                .then((response) => {
                    const invite = response.data
                    if (invite.error || !invite.code) { return interaction.reply('Unable to start a **Youtube Together** activity in the specific channel at this time.') }
                    return interaction.reply(`And done! **YouTube Together** has been started in [${channel.name}](https://discord.gg/${invite.code})`)
                })
                .catch(() => interaction.reply('Unable to start a **Youtube Together** activity in the specific channel at this time.'))
        } else {
            return interaction.reply('You did not specify a voice channel. Please try again.')
        }
    },
}
