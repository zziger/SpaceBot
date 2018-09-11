module.exports = function (member) {
    let roles = JSON.stringify(member.roles.keyArray());
    delete roles[member.guild.roles.find((r) => r.name === '@everyone')];
    Bot.connection.query(`UPDATE \`users\` SET \`roles\` = '${roles}' WHERE \`users\`.\`id\` = '${member.id}'`);
};