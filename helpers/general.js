const axios = require('axios')

async function StartActivity(channelId, activityId) {
    const result = await axios.post(`https://discord.com/api/v8/channels/${channelId}/invites`,
        {
            max_age: 86400,
            max_uses: 0,
            target_application_id: activityId,
            target_type: 2,
            temporary: false,
            validate: null,
        }, {
            headers: {
                Authorization: `Bot ${process.env.TOKEN}`,
                'Content-Type': 'application/json',
            },
        })

    if (!result.data || result.data.error || !result.data.code) { return undefined }
    return `https://discord.gg/${result.data.code}`
}

module.exports = {
    StartActivity,
}
