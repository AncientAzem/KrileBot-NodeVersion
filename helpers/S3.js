const aws = require('aws-sdk')

/**
 * @returns {S3} An S3 connection
 * @constructor
 */
function Setup() {
    return new aws.S3({
        endpoint: new aws.Endpoint('sfo3.digitaloceanspaces.com'),
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET,
    })
}

/**
 * Returns the body of a file from the container
 * @param {string} fileName
 * @param {aws.S3} connection
 // * @return {aws.S3.GetObjectOutput}
 * @constructor
 */
async function Get(fileName, connection = Setup()) {
    let result
    await connection.getObject({ Bucket: 'isle-of-val', Key: fileName }, async (error, data) => {
        if (error) {
            return
        }
        result = data
    })

    return result
}

module.exports = {
    Setup,
    Get,
}
