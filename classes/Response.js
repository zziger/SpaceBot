module.exports = class Response {
    constructor () {
        this.emojis = {
            'blank': '465052189774315540'
        }
    }

    /**
     * @param {Object} channel
     * @param {String} header
     * @param {String} description
     */
    error (channel, header, description) {
        let embed = new Bot.client.RichEmbed();
        embed
            .setColor('#DD2E44')
            .setDescription(`:x: **${header}**\n${this.emojis.blank} ${description}`);
        channel.send(embed).catch(console.error);
    }

    /**
     * @param {Object} channel
     * @param {String} header
     * @param {String} description
     */
    success (channel, header, description) {
        let embed = new Bot.client.RichEmbed();
        embed
            .setColor('#77B255')
            .setDescription(`:white_check_mark: **${header}**\n${this.emojis.blank} ${description}`);
        channel.send(embed).catch(console.error);
    }

    /**
     * @param {Object} channel
     * @param {String} header
     * @param {String} description
     */
    info (channel, header, description) {
        let embed = new Bot.client.RichEmbed();
        embed
            .setColor('#3B88C3')
            .setDescription(`:information_source: **${header}**\n${this.emojis.blank} ${description}`);
        channel.send(embed).catch(console.error);
    }
};