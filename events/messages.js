const { MessageEmbed } = require('discord.js')

const deletion = {
    name: 'messageDelete',
    async execute(message, channel) {
        console.log(message)
        const timestamp = new Date(message.createdTimestamp)
        const utcTime = Date.UTC(timestamp.getUTCFullYear(), timestamp.getUTCMonth(), timestamp.getUTCDate(),
            timestamp.getUTCHours(), timestamp.getUTCMinutes(), timestamp.getUTCSeconds())

        const logMessage = new MessageEmbed()
            .setColor('#c22f25')
            .setTitle('A message has been deleted')
            .setDescription(message.content)
            .setAuthor(`${message.author.username}#${message.author.discriminator}`)
            .setThumbnail(message.author.avatarURL())
            .addField('Original Posting Time', `<t:${utcTime}:F>`)
            .addField('Channel', `<#${message.channelId}>`)
            .setTimestamp(new Date().toDateString())
        channel.send({
            embeds: [logMessage],
        })
    },
}

module.exports = {
    deletion,
}
