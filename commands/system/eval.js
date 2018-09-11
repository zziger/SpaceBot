module.exports.info = {
    name: 'eval',
    description: 'Эмулировать код',
    regex: '(e[vb]al|[еєэ][вб]ал)',
    args: false,
    access: {
        type: 'right',
        data: 'ADMINISTRATOR'
    }
};

module.exports.run = (message, command, args) => {
    let code = args.join(' ');
    let res = eval(code);
    message.channel.send(`\`\`\`${JSON.stringify(res, undefined, 2) || undefined}\`\`\``).catch(console.error);
};