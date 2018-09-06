module.exports = class Response {
    constructor () {
        this.emojis = {
            'blank': '465052189774315540'
        };
        for (let emoji in this.emojis) {
            if (this.emojis.hasOwnProperty(emoji))
            this.emojis[emoji] = Bot.client.emojis.get(this.emojis[emoji]);
        }
    }

    /**
     * @param {Object} channel
     * @param {String} header
     * @param {String} description
     */
    error (channel, header, description) {
        let embed = new Bot.Discord.RichEmbed();
        let new_description = '';
        description.split(/\n|\r\n/g).forEach(line => {
            new_description += `${this.emojis.blank} ${line}\n`;
        });
        embed
            .setColor('#DD2E44')
            .setDescription(`:x:   **${header}**\n${new_description}`);
        channel.send(embed).catch(console.error);
    }

    /**
     * @param {Object} channel
     * @param {String} header
     * @param {String} description
     */
    success (channel, header, description) {
        let embed = new Bot.Discord.RichEmbed();
        let new_description = '';
        description.split(/\n|\r\n/g).forEach(line => {
            new_description += `${this.emojis.blank} ${line}\n`;
        });
        embed
            .setColor('#77B255')
            .setDescription(`:white_check_mark:   **${header}**\n${new_description}`);
        channel.send(embed).catch(console.error);
    }

    /**
     * @param {Object} channel
     * @param {String} header
     * @param {String} description
     */
    info (channel, header, description) {
        let embed = new Bot.Discord.RichEmbed();
        let new_description = '';
        description.split(/\n|\r\n/g).forEach(line => {
            new_description += `${this.emojis.blank} ${line}\n`;
        });
        embed
            .setColor('#3B88C3')
            .setDescription(`:information_source:   **${header}**\n${new_description}`);
        channel.send(embed).catch(console.error);
    }
};