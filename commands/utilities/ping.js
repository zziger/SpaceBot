module.exports.info = {
    name: 'ping',
    description: 'Узнать пинг API сервера Discord',
    regex: '(p[ieo]ng|п[иео]н[гх])',
    args: []
};

module.exports.run = function (message, command, args) {
    let embed = new Bot.Discord.RichEmbed()
        .setTitle('🏓 Понг!')
        .setDescription(`Пинг API сервера Discord - **${Math.round(Bot.client.ping)}**мс.`)
        .setColor('RANDOM');
    message.reply(embed);
};