module.exports.info = {
    'name': 'ping',
    'description': 'Узнать пинг API сервера',
    'regex': '(p[ieo]ng|п[иео]н[гх])'
};

module.exports.run = (message) => {
    Bot.Response.info(message.channel, 'Пинг API сервера', `Пинг API сервера - ${Bot.client.ping}мс`);
};