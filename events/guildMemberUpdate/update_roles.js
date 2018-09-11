module.exports = function (old_, new_) {
    // noinspection EqualityComparisonWithCoercionJS
    if (old_.roles == new_.roles) return;
    let roles = JSON.stringify(new_.roles.keyArray());
    delete roles[new_.guild.roles.find((r) => r.name === '@everyone')];
    Bot.connection.query(`UPDATE \`users\` SET \`roles\` = '${roles}' WHERE \`users\`.\`id\` = '${new_.id}'`);
};