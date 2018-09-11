module.exports = function (member) {
    Bot.connection.query(`SELECT * FROM users WHERE \`users\`.\`id\` = '${member.id}'`, (err, res) => {
        if (err) throw err;
        if (res.length === 0) new Bot.User(member.id);
        else {
            new Bot.User(member.id, (data, obj) => {obj.restoreRoles()});
        }
    });
};