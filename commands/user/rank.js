module.exports.info = {
    name: 'info',
    description: 'Узнать инофрмацию о своем профиле и аккаунте в Discord',
    regex: '(ran[kg]|ран[кг])',
    args: []
};

module.exports.run = function (message) {
    new Bot.User(message.author.id, /** @param {object<*, *>} data */ (data) => {
        let info = [
            ['Общий ник', message.author.username],
            ['Ник на сервере', message.member.nickname || '*Отсутствует*'],
            ['Дискриминатор', message.author.discriminator],
            ['Дата регистрации', `${message.author.createdAt.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow'})} МСК`],
            ['Дата входа на сервер', `${message.member.joinedAt.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow'})} МСК`],
            ['Баланс', data.balance],
            ['Ранк', data.rank],
            ['Уровень', data.level],
            ['Опыт', data.xp],

        ];
        let embed = new Bot.Discord.RichEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL)
            .setTitle('Информация');
        info.forEach((field, num) => {
            embed.addField(`${field[0]}:`, `${field[1]}`, true);
            if (num%2) embed.addBlankField(true);
        });

        message.channel.send(embed).catch(console.error);
    })
};